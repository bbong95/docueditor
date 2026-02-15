import { create } from 'zustand';
import { type TextBox } from '../services/ocrService';

interface EditorState {
    // Core State
    pages: string[]; // Changed from imageUrl
    boxes: TextBox[];
    selectedBox: TextBox | null;
    isHistoryOpen: boolean;

    // Actions
    setPages: (urls: string[]) => void;
    setBoxes: (boxes: TextBox[] | ((prev: TextBox[]) => TextBox[])) => void;
    setSelectedBox: (box: TextBox | null) => void;
    setIsHistoryOpen: (isOpen: boolean) => void;

    // View Mode
    viewMode: 'editor' | 'deliverables';
    setViewMode: (mode: 'editor' | 'deliverables') => void;

    // Upload State
    isUploading: boolean;
    uploadProgress: number; // 0-100
    setIsUploading: (isUploading: boolean) => void;
    setUploadProgress: (progress: number) => void;

    // Export State
    isExporting: boolean;
    setIsExporting: (isExporting: boolean) => void;
    showAnalystReport: boolean;
    setShowAnalystReport: (show: boolean) => void;

    // Logic Actions
    handleFileUpload: (file: File) => void;
    handleClear: () => void;
    handleApplyReplacement: () => void;
    removeBox: (id: string) => void;

    // Export Trigger
    exportTrigger: { type: 'image' | 'pdf' | null; timestamp: number };
    triggerExport: (type: 'image' | 'pdf') => void;
    resetExportTrigger: () => void; // New reset action

    pendingExportType: 'image' | 'pdf' | null;
    setPendingExport: (type: 'image' | 'pdf' | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    pages: [],
    boxes: [],
    selectedBox: null,
    isHistoryOpen: false,
    isUploading: false,
    uploadProgress: 0,
    isExporting: false,
    viewMode: 'editor',

    setPages: (urls) => set({ pages: urls }),

    setBoxes: (boxesOrFn) => set((state) => ({
        boxes: typeof boxesOrFn === 'function' ? boxesOrFn(state.boxes) : boxesOrFn
    })),

    setViewMode: (mode) => set({ viewMode: mode }),

    setSelectedBox: (box) => set({ selectedBox: box }),

    setIsHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
    setIsUploading: (isUploading) => set({ isUploading, uploadProgress: isUploading ? 0 : 0 }), // Reset progress when starting/stopping
    setUploadProgress: (progress) => set({ uploadProgress: progress }),
    setIsExporting: (isExporting) => set({ isExporting }),
    showAnalystReport: false,
    setShowAnalystReport: (show) => set({ showAnalystReport: show }),

    handleFileUpload: async (file: File) => {
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
            alert('이미지 또는 PDF 파일만 업로드 가능합니다.');
            return;
        }

        console.log('Starting file upload:', file.name);
        const { setIsUploading } = get();
        setIsUploading(true);

        try {
            if (file.type.includes('pdf')) {
                console.log('Processing PDF...');
                const { convertPdfToImage } = await import('../utils/pdfUtils');
                const { setUploadProgress } = get();
                const urls = await convertPdfToImage(file, setUploadProgress); // Pass progress callback
                console.log('PDF converted, pages:', urls.length);
                set({ pages: urls });
            } else {
                console.log('Processing Image...');
                // Single image upload
                const url = URL.createObjectURL(file);
                set({ pages: [url] });
            }
        } catch (e) {
            console.error('File Upload Error', e);
            alert('파일 업로드 및 변환 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
            console.log('Upload finished');
        }
    },

    handleClear: () => {
        const { pages } = get();
        pages.forEach(url => URL.revokeObjectURL(url));
        set({ pages: [], boxes: [], selectedBox: null });
    },

    handleApplyReplacement: () => {
        const { selectedBox, boxes } = get();
        if (!selectedBox) return;

        set({
            boxes: boxes.map(b => b.id === selectedBox.id ? { ...selectedBox, applied: true } : b),
            selectedBox: null
        });
    },

    removeBox: (id: string) => {
        const { boxes, selectedBox } = get();
        set({
            boxes: boxes.filter(b => b.id !== id),
            selectedBox: selectedBox?.id === id ? null : selectedBox
        });
    },

    exportTrigger: { type: null, timestamp: 0 },
    triggerExport: (type) => set({ exportTrigger: { type, timestamp: Date.now() } }),
    resetExportTrigger: () => set({ exportTrigger: { type: null, timestamp: 0 } }), // Implementation

    pendingExportType: null,
    setPendingExport: (type) => set({ pendingExportType: type })
}));
