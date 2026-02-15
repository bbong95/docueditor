import { useState, useRef, useEffect, useCallback } from 'react';
import type { TextBox } from '../services/ocrService';
import { OCRService } from '../services/ocrService';
import { Loader2, MousePointer2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { jsPDF } from 'jspdf';
import { useEditorStore } from '../store/useEditorStore';

interface SlideEditorProps {
    pages: string[]; // Changed from imageUrl to pages array
    boxes: TextBox[];
    selectedBox: TextBox | null;
    onSelectionComplete: (box: TextBox) => void;
    onBoxesChange: (boxes: TextBox[]) => void;
    onBoxSelect: (box: TextBox) => void;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function SlideEditor({
    pages,
    boxes,
    onBoxesChange,
    selectedBox,
    onSelectionComplete,
    onBoxSelect
}: SlideEditorProps) {
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // States
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [baseScale, setBaseScale] = useState(1);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [loading, setLoading] = useState(false);

    // Selection state
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState<Rect | null>(null);
    const [activePageIndex, setActivePageIndex] = useState<number | null>(null);

    // Panning state
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Text box drag move state
    const [draggedBoxId, setDraggedBoxId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

    // Info module drag state
    const [infoPos, setInfoPos] = useState<{ x: number, y: number } | null>(null);
    const [isInfoDragging, setIsInfoDragging] = useState(false);
    const [infoDragOffset, setInfoDragOffset] = useState({ x: 0, y: 0 });

    const { exportTrigger, isUploading, setIsExporting, resetExportTrigger, uploadProgress } = useEditorStore();

    // ----------------------------------------------------
    // Load Images
    // ----------------------------------------------------
    useEffect(() => {
        if (!pages || pages.length === 0) {
            setImages([]);
            return;
        }

        const loadImages = async () => {
            const loadedImages = await Promise.all(pages.map(url => {
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
                        img.crossOrigin = 'anonymous';
                    }
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = url;
                });
            }));
            setImages(loadedImages);
        };

        loadImages();
    }, [pages]);

    // ----------------------------------------------------
    // Export Handler
    // ----------------------------------------------------
    const generateFullResCanvas = useCallback((index: number) => {
        const img = images[index];
        if (!img) return null;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Draw original image at native resolution
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Filter and Draw boxes for this page
        const pageBoxes = boxes.filter(b => (b.pageIndex ?? 0) === index);

        const drawWrappedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, verticalAlign: string) => {
            const lines = text.split('\n');
            let allLines: string[] = [];

            lines.forEach(line => {
                let words = line.split('');
                let currentLine = words[0] || '';

                for (let i = 1; i < words.length; i++) {
                    const width = context.measureText(currentLine + words[i]).width;
                    if (width < maxWidth) {
                        currentLine += words[i];
                    } else {
                        allLines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                allLines.push(currentLine);
            });

            const totalTextHeight = allLines.length * lineHeight;
            let startY = y;
            if (verticalAlign === 'middle') startY = y - (totalTextHeight / 2);
            if (verticalAlign === 'bottom') startY = y - totalTextHeight;

            context.textBaseline = 'top';
            allLines.forEach((line, idx) => {
                context.fillText(line, x, startY + (idx * lineHeight));
            });
        };

        for (const box of pageBoxes) {
            // Apply coordinates directly (Scale 1.0)
            const bx = box.x;
            const by = box.y;
            const bw = box.width;
            const bh = box.height;

            if (box.applied) { // Export only applied/finalized boxes usually? Or all? User likely wants all visible.
                ctx.fillStyle = box.backgroundColor || '#0B1120';
                ctx.fillRect(bx, by, bw, bh);

                // Font size is stored relative to original image if logic is correct. 
                // In handleWindowMouseUp: logicalRect = currentRect / scale. So box.x/y/w/h/fontSize are already in 'original image space'.
                const fs = box.fontSize || (box.height * 0.8);
                const fontFamily = box.fontFamily || 'Paperlogy';
                ctx.font = `${box.fontWeight || 'normal'} ${fs}px ${fontFamily}, sans-serif`;
                ctx.fillStyle = box.fontColor || '#FFFFFF';

                const align = box.textAlign || 'center';
                const vAlign = box.verticalAlign || 'middle';
                ctx.textAlign = align as CanvasTextAlign;

                let tx = bx;
                if (align === 'center') tx = bx + (bw / 2);
                if (align === 'right') tx = bx + bw;

                let ty = by;
                if (vAlign === 'middle') ty = by + (bh / 2);
                if (vAlign === 'bottom') ty = by + bh;

                const sanitizedText = DOMPurify.sanitize(box.text);
                const lineHeight = fs * 1.3;
                drawWrappedText(ctx, sanitizedText, tx, ty, bw, lineHeight, vAlign);
            }
        }
        return canvas;
    }, [images, boxes]);

    useEffect(() => {
        if (!exportTrigger.type || !exportTrigger.timestamp) return;
        if (images.length === 0) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        setIsExporting(true);

        // Run in next tick to allow UI to update (start animation)
        setTimeout(() => {
            try {
                if (exportTrigger.type === 'image') {
                    images.forEach((_, index) => {
                        const canvas = generateFullResCanvas(index);
                        if (!canvas) return;

                        const link = document.createElement('a');
                        link.download = `docueditor-page-${index + 1}-${timestamp}.png`;
                        link.href = canvas.toDataURL('image/png'); // PNG preserves quality better
                        link.click();
                    });

                } else if (exportTrigger.type === 'pdf') {
                    // Determine orientation based on first page
                    const firstCanvas = generateFullResCanvas(0);
                    if (!firstCanvas) return;

                    const pdf = new jsPDF({
                        orientation: firstCanvas.width > firstCanvas.height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [firstCanvas.width, firstCanvas.height] // Use native resolution size
                    });

                    images.forEach((_, index) => {
                        const canvas = generateFullResCanvas(index);
                        if (!canvas) return;

                        if (index > 0) {
                            pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'landscape' : 'portrait');
                        }

                        const imgData = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG for PDF
                        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                    });

                    pdf.save(`docueditor-export-${timestamp}.pdf`);
                }
            } catch (e) {
                console.error('Export failed', e);
                alert('파일 내보내기 중 오류가 발생했습니다.');
            } finally {
                setIsExporting(false);
                resetExportTrigger(); // Clear trigger to prevent re-run
            }
        }, 100);

    }, [exportTrigger, images, setIsExporting, generateFullResCanvas, resetExportTrigger]);
    // Wait, I need to update the component body to destructure resetExportTrigger first.
    // Retrying with correct replacement strategy.

    // ----------------------------------------------------
    // Drawing Logic (Multi-Canvas)
    // ----------------------------------------------------
    const drawCanvas = useCallback((index: number) => {
        const img = images[index];
        const canvas = canvasRefs.current[index];
        const container = containerRef.current;
        if (!img || !canvas || !container) return;

        // Calculate Base Scale (Fit to container, based on FIRST image usually, or individually?)
        // To keep consistent zoom, we should calculate base scale ONCE based on the first image 
        // and apply it to all.
        let s = baseScale;
        if (index === 0 && baseScale === 1) { // Only set initial base scale once
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            s = Math.min((containerWidth - 80) / img.width, (containerHeight - 80) / img.height, 1);
            if (s !== baseScale) setBaseScale(s);
        }
        // Use the state baseScale unless it's the initialization frame
        const effectiveBaseScale = (index === 0 && baseScale === 1) ? s : baseScale;

        const currentScale = effectiveBaseScale * zoomLevel;
        canvas.width = img.width * currentScale;
        canvas.height = img.height * currentScale;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const drawWrappedText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, verticalAlign: string) => {
            const lines = text.split('\n');
            let allLines: string[] = [];

            lines.forEach(line => {
                let words = line.split('');
                let currentLine = words[0] || '';

                for (let i = 1; i < words.length; i++) {
                    const width = context.measureText(currentLine + words[i]).width;
                    if (width < maxWidth) {
                        currentLine += words[i];
                    } else {
                        allLines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                allLines.push(currentLine);
            });

            const totalTextHeight = allLines.length * lineHeight;
            let startY = y;
            if (verticalAlign === 'middle') startY = y - (totalTextHeight / 2);
            if (verticalAlign === 'bottom') startY = y - totalTextHeight;

            context.textBaseline = 'top';
            allLines.forEach((line, idx) => {
                context.fillText(line, x, startY + (idx * lineHeight));
            });
        };

        // Filter and Draw boxes for this page
        const pageBoxes = boxes.filter(b => (b.pageIndex ?? 0) === index);

        for (const box of pageBoxes) {
            const isSelected = selectedBox?.id === box.id;
            const renderBox = isSelected ? selectedBox : box;

            const bx = renderBox.x * currentScale;
            const by = renderBox.y * currentScale;
            const bw = renderBox.width * currentScale;
            const bh = renderBox.height * currentScale;

            if (renderBox.applied || isSelected) {
                ctx.fillStyle = renderBox.backgroundColor || '#0B1120';
                ctx.fillRect(bx, by, bw, bh);

                const fs = (renderBox.fontSize || (renderBox.height * 0.8)) * currentScale;
                const fontFamily = renderBox.fontFamily || 'Paperlogy';
                ctx.font = `${renderBox.fontWeight || 'normal'} ${fs}px ${fontFamily}, sans-serif`;
                ctx.fillStyle = renderBox.fontColor || '#FFFFFF';

                const align = renderBox.textAlign || 'center';
                const vAlign = renderBox.verticalAlign || 'middle';

                ctx.textAlign = align as CanvasTextAlign;

                let tx = bx;
                if (align === 'center') tx = bx + (bw / 2);
                if (align === 'right') tx = bx + bw;

                let ty = by;
                if (vAlign === 'middle') ty = by + (bh / 2);
                if (vAlign === 'bottom') ty = by + bh;

                const sanitizedText = DOMPurify.sanitize(renderBox.text);
                const lineHeight = fs * 1.3;
                drawWrappedText(ctx, sanitizedText, tx, ty, bw, lineHeight, vAlign);
            } else {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(bx, by, bw, bh);
                ctx.fillRect(bx, by, bw, bh);
            }
        }
    }, [images, boxes, zoomLevel, baseScale, selectedBox]);

    useEffect(() => {
        images.forEach((_, index) => drawCanvas(index));
    }, [images, drawCanvas]);

    // ----------------------------------------------------
    // Color Analysis
    // ----------------------------------------------------
    const analyzeColors = useCallback((rect: Rect, pageIndex: number) => {
        const canvas = canvasRefs.current[pageIndex];
        if (!canvas) return { fontColor: '#FFFFFF', backgroundColor: '#0B1120' };

        const ctx = canvas.getContext('2d');
        if (!ctx) return { fontColor: '#FFFFFF', backgroundColor: '#0B1120' };

        const currentScale = baseScale * zoomLevel;
        const sx = Math.floor(rect.x * currentScale);
        const sy = Math.floor(rect.y * currentScale);
        const sw = Math.floor(rect.width * currentScale);
        const sh = Math.floor(rect.height * currentScale);

        if (sw <= 0 || sh <= 0) return { fontColor: '#FFFFFF', backgroundColor: '#0B1120' };

        try {
            const imageData = ctx.getImageData(sx, sy, sw, sh);
            const data = imageData.data;
            const colorCounts: { [key: string]: number } = {};
            let maxCount = 0;
            let dominantBg = '#0B1120';
            const step = Math.max(1, Math.floor(data.length / 4000));

            for (let i = 0; i < data.length; i += 4 * step) {
                if (data[i + 3] < 128) continue;
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                if (colorCounts[hex] > maxCount) { maxCount = colorCounts[hex]; dominantBg = hex; }
            }

            let maxDiff = 0, dominantFg = '#FFFFFF';
            const bgR = parseInt(dominantBg.slice(1, 3), 16);
            const bgG = parseInt(dominantBg.slice(3, 5), 16);
            const bgB = parseInt(dominantBg.slice(5, 7), 16);

            for (const [hex, count] of Object.entries(colorCounts)) {
                if (hex === dominantBg) continue;
                if (count < (data.length / (4 * step)) * 0.01) continue;
                const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
                const diff = (Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB));
                if (diff > maxDiff) { maxDiff = diff; dominantFg = hex; }
            }
            if (maxDiff < 30) {
                const brightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;
                dominantFg = brightness > 128 ? '#000000' : '#FFFFFF';
            }
            return { fontColor: dominantFg, backgroundColor: dominantBg };
        } catch { return { fontColor: '#FFFFFF', backgroundColor: '#0B1120' }; }
    }, [baseScale, zoomLevel]);

    const captureSnippet = useCallback((rect: Rect, pageIndex: number): string | null => {
        const img = images[pageIndex];
        if (!img) return null;

        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return null;

        const currentScale = baseScale * zoomLevel;
        const unscale = 1 / currentScale;
        const sx = rect.x * unscale;
        const sy = rect.y * unscale;
        const sw = rect.width * unscale;
        const sh = rect.height * unscale;

        cropCanvas.width = sw;
        cropCanvas.height = sh;
        cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        return cropCanvas.toDataURL('image/png');
    }, [baseScale, zoomLevel, images]);

    // ----------------------------------------------------
    // Window Event Handlers (Drag/Pan)
    // ----------------------------------------------------
    useEffect(() => {
        if (!isPanning && !draggedBoxId && !isDragging && !isInfoDragging) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            if (isInfoDragging) {
                const rootEl = containerRef.current?.parentElement;
                if (rootEl) {
                    const rootRect = rootEl.getBoundingClientRect();
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    let newX = e.clientX - rootRect.left - infoDragOffset.x;
                    let newY = e.clientY - rootRect.top - infoDragOffset.y;
                    if (containerRect) {
                        newX = Math.max(0, Math.min(newX, rootRect.width - 50));
                        newY = Math.max(0, Math.min(newY, rootRect.height - 20));
                    }
                    setInfoPos({ x: newX, y: newY });
                }
                return;
            }

            if (isPanning) {
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                if (containerRef.current) {
                    containerRef.current.scrollLeft -= dx;
                    containerRef.current.scrollTop -= dy;
                }
                setLastMousePos({ x: e.clientX, y: e.clientY });
                return;
            }

            // For dragging items, we need to know the ACTIVE Canvas context or coordinates.
            // If dragging, we assume we are on the activePageIndex.
            if (activePageIndex === null) return;
            const canvas = canvasRefs.current[activePageIndex];
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();

            if (draggedBoxId) {
                // Dragging a box can move it outside bounds logically? Usually prevented.
                const x = (e.clientX - rect.left);
                const y = (e.clientY - rect.top);
                const currentScale = baseScale * zoomLevel;
                const newX = (x - dragOffset.x) / currentScale;
                const newY = (y - dragOffset.y) / currentScale;

                onBoxesChange(boxes.map(b =>
                    b.id === draggedBoxId ? { ...b, x: newX, y: newY } : b
                ));
            } else if (isDragging && currentRect && startPos) {
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
                setCurrentRect({
                    x: Math.min(startPos.x, x),
                    y: Math.min(startPos.y, y),
                    width: Math.abs(x - startPos.x),
                    height: Math.abs(y - startPos.y)
                });
            }
        };

        const handleWindowMouseUp = async () => {
            if (isInfoDragging) { setIsInfoDragging(false); return; }
            if (isPanning) { setIsPanning(false); return; }
            if (draggedBoxId) { setDraggedBoxId(null); setActivePageIndex(null); return; }

            if (isDragging) {
                setIsDragging(false);
                if (!currentRect || currentRect.width < 15 || currentRect.height < 15 || activePageIndex === null) {
                    setCurrentRect(null);
                    setActivePageIndex(null);
                    return;
                }

                const snippet = captureSnippet(currentRect, activePageIndex);
                if (!snippet) { setCurrentRect(null); setActivePageIndex(null); return; }

                setLoading(true);
                try {
                    const ocr = OCRService.getInstance();
                    const result = await ocr.recognizeSnippetWithStyle(snippet);
                    const logicalRect = {
                        x: currentRect.x / (baseScale * zoomLevel),
                        y: currentRect.y / (baseScale * zoomLevel),
                        width: currentRect.width / (baseScale * zoomLevel),
                        height: currentRect.height / (baseScale * zoomLevel)
                    };
                    const colors = analyzeColors(logicalRect, activePageIndex);
                    const newBox: TextBox = {
                        id: `txt-${Date.now()}`,
                        text: result.text || '',
                        confidence: 100,
                        x: logicalRect.x,
                        y: logicalRect.y,
                        width: logicalRect.width,
                        height: logicalRect.height,
                        fontSize: Math.max(14, Math.round(logicalRect.height * 0.7)),
                        fontWeight: '700',
                        fontFamily: 'Paperlogy',
                        fontColor: colors.fontColor,
                        backgroundColor: colors.backgroundColor,
                        pageIndex: activePageIndex // IMPORTANT: Assign Page Index
                    };
                    onSelectionComplete(newBox);
                } catch (e) { console.error('[OCR] Analysis failed', e); }
                finally { setLoading(false); setCurrentRect(null); setActivePageIndex(null); }
            }
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isPanning, draggedBoxId, isDragging, lastMousePos, boxes, startPos, dragOffset, baseScale, zoomLevel, currentRect, onBoxesChange, onSelectionComplete, analyzeColors, captureSnippet, isInfoDragging, infoDragOffset, activePageIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 5));
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (container) container.addEventListener('wheel', handleWheel, { passive: false });
        // NOTE: Panning wheel (shift+wheel) is handled natively by overflowing div unless we want custom Logic.
        return () => { if (container) container.removeEventListener('wheel', handleWheel); };
    }, [handleWheel]);

    // ----------------------------------------------------
    // Render
    // ----------------------------------------------------
    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {(loading || isUploading) && (
                <div style={{
                    position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                    background: 'hsl(var(--color-primary))', color: 'white',
                    padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center',
                    gap: '0.5rem', zIndex: 200, boxShadow: 'var(--shadow-premium)', fontSize: '0.8rem', fontWeight: 700
                }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>
                        {isUploading
                            ? `PDF 변환 중... ${uploadProgress > 0 ? `(${uploadProgress}%)` : '(페이지 수에 따라 시간이 소요됩니다)'}`
                            : 'Gemini가 분석 중...'}
                    </span>
                </div>
            )}

            <div ref={containerRef} style={{
                flex: 1, position: 'relative', overflow: 'auto',
                display: 'flex', flexDirection: 'column', alignItems: 'center', // Column layout for pages
                background: 'hsla(var(--color-bg-base), 0.5)',
                padding: '40px' // Padding around pages
            }}>
                {pages.length > 0 ? pages.map((_, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'relative',
                            display: 'inline-block',
                            margin: '0 0 40px 0', // Vertical spacing between pages
                            cursor: isShiftPressed
                                ? (isPanning ? 'grabbing' : 'grab')
                                : (draggedBoxId ? 'grabbing' : 'crosshair'),
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' // Shadow for each page
                        }}
                        onMouseDown={(e) => {
                            if (loading) return;
                            if (e.shiftKey || e.button === 1) {
                                e.preventDefault();
                                setIsPanning(true);
                                setLastMousePos({ x: e.clientX, y: e.clientY });
                                return;
                            }

                            // Identify Canvas Interaction coordinates
                            const canvas = canvasRefs.current[index];
                            if (!canvas) return;
                            const rect = canvas.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const currentScale = baseScale * zoomLevel;

                            // Check Click on Box (Filtered by Page Index)
                            const clickedBox = boxes.find(box => {
                                if ((box.pageIndex ?? 0) !== index) return false;
                                const bx = box.x * currentScale;
                                const by = box.y * currentScale;
                                const bw = box.width * currentScale;
                                const bh = box.height * currentScale;
                                return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
                            });

                            setActivePageIndex(index); // Set active page for dragging context

                            if (clickedBox) {
                                setDraggedBoxId(clickedBox.id);
                                setDragOffset({ x: x - (clickedBox.x * currentScale), y: y - (clickedBox.y * currentScale) });

                                // Style Update Logic (reused)
                                let updatedBox = { ...clickedBox };
                                const isDefaultStyle = !updatedBox.fontColor || updatedBox.fontColor === '#FFFFFF' || !updatedBox.backgroundColor;
                                if (isDefaultStyle) {
                                    const styles = analyzeColors(updatedBox, index);
                                    const smartFontSize = Math.max(14, Math.round(updatedBox.height * 0.7));
                                    updatedBox = { ...updatedBox, ...styles, fontSize: updatedBox.fontSize && updatedBox.fontSize > 10 ? updatedBox.fontSize : smartFontSize, fontFamily: updatedBox.fontFamily || 'Paperlogy', fontWeight: updatedBox.fontWeight || '700' };
                                    onBoxesChange(boxes.map(b => b.id === updatedBox.id ? updatedBox : b));
                                }
                                onBoxSelect(updatedBox);
                                return;
                            }

                            // Start Selection
                            setIsDragging(true);
                            setStartPos({ x, y });
                            setCurrentRect({ x, y, width: 0, height: 0 });
                        }}
                    >
                        <canvas
                            ref={el => { canvasRefs.current[index] = el; }}
                            style={{ display: 'block', borderRadius: '4px', background: 'white' }}
                        />

                        {/* Selection Rect - Only show if active on THIS page */}
                        {currentRect && activePageIndex === index && (
                            <div className="selection-rect" style={{
                                left: currentRect.x,
                                top: currentRect.y,
                                width: currentRect.width,
                                height: currentRect.height
                            }} />
                        )}

                        {/* Text Boxes - Filtered for THIS page */}
                        {boxes.filter(box => (box.pageIndex ?? 0) === index).map(box => {
                            const isSelected = selectedBox?.id === box.id;
                            const isHovered = hoveredBoxId === box.id;

                            return (
                                <div
                                    key={box.id}
                                    onClick={(e) => { e.stopPropagation(); onBoxSelect(box); }}
                                    onMouseEnter={() => setHoveredBoxId(box.id)}
                                    onMouseLeave={() => setHoveredBoxId(null)}
                                    style={{
                                        position: 'absolute',
                                        left: box.x * baseScale * zoomLevel,
                                        top: box.y * baseScale * zoomLevel,
                                        width: box.width * baseScale * zoomLevel,
                                        height: box.height * baseScale * zoomLevel,
                                        cursor: isPanning ? 'grabbing' : 'pointer',
                                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxSizing: 'border-box',
                                        border: isSelected
                                            ? '2px solid hsl(var(--color-primary))'
                                            : isHovered
                                                ? '1.5px solid hsla(var(--color-primary), 0.6)'
                                                : box.applied
                                                    ? '1px dashed hsla(var(--color-primary), 0.3)'
                                                    : '1px dashed rgba(255,255,255,0.3)',
                                        background: isSelected
                                            ? 'hsla(var(--color-primary), 0.15)'
                                            : isHovered
                                                ? 'hsla(var(--color-primary), 0.05)'
                                                : 'transparent',
                                        borderRadius: '3px',
                                        zIndex: isSelected ? 20 : 10,
                                        boxShadow: isSelected || isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                        transform: isHovered && !isSelected && !isPanning ? 'scale(1.005)' : 'none'
                                    }}
                                    className="animate-pop"
                                />
                            );
                        })}
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', color: 'hsl(var(--text-dim))', marginTop: 'auto', marginBottom: 'auto' }}>
                        <MousePointer2 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>이미지 또는 PDF를 업로드하세요</p>
                    </div>
                )}
            </div>

            {/* Info Module */}
            {pages.length > 0 && (
                <div
                    onMouseDown={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const rootEl = containerRef.current?.parentElement;
                        if (rootEl) {
                            const rootRect = rootEl.getBoundingClientRect();
                            const currentTargetRect = e.currentTarget.getBoundingClientRect();
                            setInfoDragOffset({ x: e.clientX - currentTargetRect.left, y: e.clientY - currentTargetRect.top });
                            if (!infoPos) { setInfoPos({ x: currentTargetRect.left - rootRect.left, y: currentTargetRect.top - rootRect.top }); }
                            setIsInfoDragging(true);
                        }
                    }}
                    style={{
                        position: 'absolute',
                        ...(infoPos ? { left: infoPos.x, top: infoPos.y } : { bottom: '2rem', right: '2rem' }),
                        background: 'hsla(0, 0%, 100%, 0.85)', padding: '0.6rem 1.2rem', borderRadius: '2rem',
                        color: 'hsl(var(--text-main))', fontSize: '0.8rem', fontWeight: 600,
                        backdropFilter: 'blur(12px)', border: '1px solid hsl(var(--color-border))',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px',
                        cursor: isInfoDragging ? 'grabbing' : 'grab', userSelect: 'none'
                    }}>
                    <span style={{ fontWeight: 800, color: 'hsl(var(--color-primary))' }}>{Math.round(zoomLevel * 100)}%</span>
                    <div style={{ width: '1px', height: '12px', background: 'hsl(var(--color-border))' }} />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <kbd style={{ fontFamily: 'inherit', padding: '2px 4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px' }}>Shift</kbd>
                        + Drag Panning
                    </span>
                    <div style={{ width: '1px', height: '12px', background: 'hsl(var(--color-border))' }} />
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <kbd style={{ fontFamily: 'inherit', padding: '2px 4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px' }}>Ctrl</kbd>
                        + Wheel Zoom
                    </span>
                </div>
            )}
        </div>
    );
}
