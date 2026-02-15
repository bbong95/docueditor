import { useState, useEffect, useRef } from 'react';
import {
    BookOpen, Layers, Box, Cpu, FileJson,
    CheckCircle, Shield, FileText, ArrowLeft, X, Download,
    ClipboardList, Database, Server, Wrench
} from 'lucide-react';
import rough from 'roughjs';
import { marked } from 'marked';
import { useEditorStore } from '../store/useEditorStore';

// =====================================================
// DATA: 산출물 데이터 (v53.0 - Standardized Diagrams)
// =====================================================
interface Artifact {
    id: string;
    title: string;
    type: 'doc' | 'arch' | 'report' | 'plan';
    path: string;
    desc: string;
    icon: any;
    diagram?: string;
}

const artifacts: Artifact[] = [
    { id: 'req_def', title: '요구사항 정의서 (Requirements Definition)', type: 'doc', path: '/artifacts/requirements_definition_ko.md', desc: '시스템 기능 및 비기능 요구사항 상세 명세', icon: ClipboardList },
    { id: 'roadmap', title: '통합 로드맵 및 이력 (Integrated Roadmap & History)', type: 'doc', path: '/artifacts/roadmap_history_ko.md', desc: '프로젝트 수행 단계별 계획 및 진행 이력', icon: FileText },

    // =====================================================
    // ARCHITECTURE: 10 Standardized Diagrams
    // =====================================================
    { id: 'ctx_diag', title: '시스템 컨텍스트 (System Context)', type: 'arch', path: '/artifacts/context_diagram.excalidraw', desc: '사용자 및 외부 시스템 간의 상호작용 관계 정의', icon: Layers, diagram: 'context' },
    { id: 'sys_arch', title: '시스템 아키텍처 상세 (Architecture Detail)', type: 'arch', path: '/artifacts/system_architecture.excalidraw', desc: 'S/W 계층 구조 및 모델 기반 기술 아키텍처', icon: Server, diagram: 'sys_arch' },
    { id: 'sys_comp', title: '시스템 구성도 (System Composition)', type: 'arch', path: '/artifacts/system_composition.excalidraw', desc: '모듈간 의존성 및 구성 요소 배치도', icon: Box, diagram: 'composition' },
    { id: 'seq_diag', title: '시퀀스 다이어그램 (Sequence Diagram)', type: 'arch', path: '/artifacts/sequence_diagram.excalidraw', desc: '이미지 처리 워크플로우의 객체 간 상호작용', icon: FileJson, diagram: 'sequence' },
    { id: 'data_model', title: '데이터 모델 (Data Model)', type: 'arch', path: '/artifacts/data_model.excalidraw', desc: '논리적 데이터 구조 및 Zustand 스토어 엔티티 (ERD)', icon: Database, diagram: 'data_model' },
    { id: 'ia_struc', title: '정보 구조도 (IA Structure)', type: 'arch', path: '/artifacts/ia_structure.excalidraw', desc: '메뉴 구조 및 콘텐츠 정보 계층 구조', icon: Layers, diagram: 'ia' },
    { id: 'proc_flow', title: '프로세스 흐름도 (Process Flows)', type: 'arch', path: '/artifacts/process_flows.excalidraw', desc: '비즈니스 로직 및 전체 시스템 프로세스 흐름', icon: Wrench, diagram: 'process' },
    { id: 'core_work', title: '핵심 워크플로우 (Core Workflow)', type: 'arch', path: '/artifacts/core_workflow.excalidraw', desc: '사용자 시나리오별 핵심 작업 단계 시각화', icon: BookOpen, diagram: 'workflow' },
    { id: 'agent_skill', title: '에이전트 스킬 구성 (Agent Skill Config)', type: 'arch', path: '/artifacts/agent_skill_config.excalidraw', desc: '4대 에이전트의 역할 및 스킬 매핑 구조', icon: Cpu, diagram: 'agents' },
    { id: 'state_flow', title: '상태 관리 흐름도 (Store State Flow)', type: 'arch', path: '/artifacts/zustand_state_flow.excalidraw', desc: 'Zustand 기반 액션 및 상태 변화 라이프사이클', icon: Database, diagram: 'state' },

    { id: 'screen_design', title: '화면 설계서 (DocuEditor v2.0)', type: 'doc', path: '/artifacts/screen_designs_ko.md', desc: '상세 UI/UX 디자인 가이드 및 레이아웃', icon: Box },
    { id: 'ai_specs', title: 'AI 엔진 상세 명세 (DocuEditor v2.0)', type: 'doc', path: '/artifacts/ai_engine_specs_ko.md', desc: 'Gemini 3.0 네이티브 모델 연동 규격', icon: Cpu, diagram: 'fallback_grid' },
    { id: 'qa_report', title: 'QA 점검 결과서', type: 'report', path: '/artifacts/qa_report_ko.md', desc: '품질 검증 수행 결과 및 기능 테스트 결과', icon: CheckCircle },
    { id: 'sec_report', title: '보안 취약점 점검 및 조치 결과서', type: 'report', path: '/artifacts/security_report_ko.md', desc: '소스코드 취약점 분석 및 보안 조치 결과', icon: Shield },
    { id: 'analysis', title: '정적/동적 분석 결과서', type: 'report', path: '/artifacts/analysis_report_ko.md', desc: '정적/동적 코드 구조 및 품질 분석', icon: FileText },
    { id: 'user_manual', title: '공식 사용자 가이드 (Official User Guide)', type: 'doc', path: '/artifacts/user_manual_ko.md', desc: '워크플로우 기반 시스템 사용 가이드', icon: BookOpen, diagram: 'core_workflow' },
];

function RoughDiagram({ data }: { data: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        document.fonts.load("1em Paperlogy").then(() => {
            setFontsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !data) return;
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;

        try {
            const rc = rough.canvas(canvas);
            const excalidraw = JSON.parse(data);

            // 1. Safe Bounding Box Calculation
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            let hasValidElements = false;

            if (excalidraw.elements && Array.isArray(excalidraw.elements)) {
                excalidraw.elements.forEach((el: any) => {
                    if (typeof el.x === 'number' && typeof el.y === 'number') {
                        minX = Math.min(minX, el.x);
                        minY = Math.min(minY, el.y);
                        maxX = Math.max(maxX, el.x + (el.width || 0));
                        maxY = Math.max(maxY, el.y + (el.height || 0));
                        hasValidElements = true;
                    }
                });
            }

            // Fallback for empty or invalid diagrams
            if (!hasValidElements || minX === Infinity) {
                minX = 0; minY = 0; maxX = 800; maxY = 600;
            }

            // 2. Add Padding & Calculate Content Size
            const padding = 40;
            const contentWidth = Math.max(100, maxX - minX + (padding * 2));
            const contentHeight = Math.max(100, maxY - minY + (padding * 2));

            // 3. Responsive Scaling
            // Default to 800 if parent width is not available yet (init render)
            const parentWidth = canvas.parentElement?.clientWidth || 0;
            const containerWidth = parentWidth > 0 ? parentWidth : 1000;

            // Adjust scale to fit ONLY if content is wider than container
            // Otherwise use 1.0 scale to prevent shrinking too small diagrams
            const scale = Math.min(1, containerWidth / contentWidth);

            // 4. Set Canvas Dimensions
            canvas.width = contentWidth * scale * dpr;
            canvas.height = contentHeight * scale * dpr;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.maxWidth = `${contentWidth}px`; // Don't stretch small diagrams

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(scale * dpr, scale * dpr);
                ctx.translate(-minX + padding, -minY + padding);
                ctx.clearRect(minX - padding, minY - padding, contentWidth, contentHeight);

                // Optional: Draw debug background
                // ctx.fillStyle = '#fafafa';
                // ctx.fillRect(minX - padding, minY - padding, contentWidth, contentHeight);
            }

            // 5. Render Elements with Auto-Wrapping Text
            excalidraw.elements.forEach((el: any) => {
                const opts = {
                    stroke: el.strokeColor || '#000',
                    strokeWidth: el.strokeWidth || 1,
                    fill: el.backgroundColor !== 'transparent' ? el.backgroundColor : undefined,
                    fillStyle: el.fillStyle === 'solid' ? 'solid' : 'hachure',
                    roughness: el.roughness || 1
                };

                if (el.type === 'rectangle') {
                    rc.rectangle(el.x, el.y, el.width, el.height, opts);
                } else if (el.type === 'ellipse') {
                    rc.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height, opts);
                } else if (el.type === 'diamond') {
                    rc.polygon([
                        [el.x + el.width / 2, el.y],
                        [el.x + el.width, el.y + el.height / 2],
                        [el.x + el.width / 2, el.y + el.height],
                        [el.x, el.y + el.height / 2]
                    ], opts);
                } else if (el.type === 'arrow' || el.type === 'line') {
                    if (el.points && el.points.length > 0) {
                        const points = el.points.map((p: any) => [el.x + p[0], el.y + p[1]]);
                        rc.curve(points, { ...opts, roughness: 0.5 });
                        // Simple arrow head approximation would go here, omitting for brevity
                    }
                } else if (el.type === 'text') {
                    if (ctx) {
                        ctx.save();
                        const fontSize = el.fontSize || 16;
                        const lineHeight = fontSize * 1.3;

                        // Support Handwritten Font (Excalidraw fontFamily: 2 -> Paperlogy)
                        // Mapping ID 1 (Sans) to Paperlogy as requested
                        let font = 'sans-serif';
                        if (el.fontFamily === 1) {
                            font = "'Paperlogy', sans-serif";
                        } else if (el.fontFamily === 2) {
                            font = "'Kalam', 'Nanum Pen Script', cursive";
                        } else if (el.fontFamily === 3) {
                            font = "'Cascadia Code', monospace";
                        }
                        ctx.font = `${el.fontWeight || '700'} ${fontSize}px ${font}`;

                        ctx.fillStyle = el.strokeColor || '#000000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        const rawLines = el.text.split(/\\n|\n/);
                        const totalHeight = rawLines.length * lineHeight;

                        // Robust dimension calculation (fallback for missing width/height)
                        const w = typeof el.width === 'number' && el.width > 0 ? el.width : ctx.measureText(rawLines[0] || "").width + 20;
                        const h = typeof el.height === 'number' && el.height > 0 ? el.height : totalHeight + 10;

                        const centerX = el.x + (w / 2);
                        const centerY = el.y + (h / 2);
                        const startY = centerY - (totalHeight / 2) + (lineHeight / 2);

                        rawLines.forEach((l: string, i: number) => {
                            if (!isNaN(centerX) && !isNaN(startY)) {
                                ctx.fillText(l, centerX, startY + (i * lineHeight));
                            }
                        });
                        ctx.restore();
                    }
                }
            });
        } catch {
            console.error('Diagram render error');
        }
    }, [data, fontsLoaded]);
    return <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0', background: '#f8fafc', borderRadius: '12px', padding: '20px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)', minHeight: '300px', overflow: 'hidden' }}><canvas ref={canvasRef} style={{ background: 'transparent' }} /></div>;
}

export default function DeliverablesPortal() {
    const { setViewMode } = useEditorStore();
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedArtifact) {
            setLoading(true);
            fetch(selectedArtifact.path)
                .then(res => res.text())
                .then(text => {
                    if (selectedArtifact.path.endsWith('.excalidraw')) {
                        try {
                            const json = JSON.parse(text);
                            setContent(`# ${selectedArtifact.title}\n\n<Diagram data='${JSON.stringify(json)}' />\n\n### 상세 기술 사양\n위 다이어그램은 실제 아키텍처를 반영한 정밀 설계도입니다.`);
                        } catch {
                            setContent('다이어그램 데이터 파싱 실패');
                        }
                    } else {
                        setContent(text);
                    }
                })
                .catch(() => setContent('문서를 불러올 수 없습니다.'))
                .finally(() => setLoading(false));
        }
    }, [selectedArtifact]);

    // Helper to render content with mixed markdown and diagrams
    const renderContent = (md: string) => {
        const parts = md.split(/(<Diagram data='.*?' \/>)/g);
        return parts.map((part, i) => {
            const match = part.match(/<Diagram data='(.*?)' \/>/);
            return match ? <RoughDiagram key={i} data={match[1]} /> : <div key={i} dangerouslySetInnerHTML={{ __html: marked.parse(part) as string }} />;
        });
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: 'linear-gradient(170deg, hsla(46, 43%, 97%, 0.95), hsla(38, 17%, 93%, 0.92)), repeating-linear-gradient(0deg, transparent, transparent 32px, hsla(24, 17%, 80%, 0.08) 33px)',
            padding: '2.5rem',
            position: 'relative',
            zIndex: 100, // Safe Z-index above agents
            fontFamily: "'Paperlogy', sans-serif"
        }}>
            {/* Header Content */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Kalam:wght@300;400;700&display=swap');
                @font-face {
                    font-family: 'Paperlogy';
                    src: url('/fonts/Paperlogy-Regular.woff2') format('woff2');
                    font-weight: 400;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'Paperlogy';
                    src: url('/fonts/Paperlogy-Bold.woff2') format('woff2');
                    font-weight: 700;
                    font-style: normal;
                }
            `}</style>
            <div className="max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
                <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{
                            color: 'hsl(var(--color-primary))',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: 'currentColor', borderRadius: '2px', marginRight: '8px' }} />
                            Project Deliverables Archive
                        </div>
                        <h1 style={{ fontFamily: "'Paperlogy', sans-serif", fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--color-ink))', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>산출물 아카이브</h1>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem', maxWidth: '650px', lineHeight: '1.6' }}>
                            기술 설계 사양서부터 품질 검증 결과서까지, 프로젝트의 모든 공학적 자산을 <br />
                            스튜디오 표준 규격에 따라 체계적으로 관리합니다.
                        </p>
                    </div>

                    <button
                        onClick={() => setViewMode('editor')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '999px',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'white',
                            color: 'hsl(var(--color-ink))',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            fontFamily: "'Paperlogy', sans-serif"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 5px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = 'hsl(var(--color-primary))';
                            e.currentTarget.style.color = 'hsl(var(--color-primary))';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                            e.currentTarget.style.color = 'hsl(var(--color-ink))';
                        }}
                    >
                        <ArrowLeft size={18} />
                        스튜디오 돌아가기
                    </button>
                </div>

                {/* Grid Layout - Explicit Format */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1.5rem',
                    width: '100%',
                    paddingBottom: '4rem'
                }}>
                    {artifacts.map(art => (
                        <div key={art.id}
                            onClick={() => setSelectedArtifact(art)}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = 'hsl(var(--color-primary))';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                                e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid hsl(var(--color-border))',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '260px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{
                                    padding: '0.8rem',
                                    borderRadius: '0.75rem',
                                    background: 'hsl(var(--color-bg-accent))',
                                    color: 'hsl(var(--color-primary))'
                                }}>
                                    <art.icon size={26} strokeWidth={1.5} />
                                </div>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    letterSpacing: '0.05em',
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    border: '1px solid currentColor',
                                    opacity: 0.7,
                                    color: art.type === 'doc' ? '#2563EB' : art.type === 'arch' ? '#7C3AED' : '#059669'
                                }}>
                                    {art.type.toUpperCase()}
                                </span>
                            </div>

                            <h3 style={{ fontFamily: "'Paperlogy', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--color-ink))', marginBottom: '0.75rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{art.title}</h3>
                            <p style={{
                                fontSize: '0.9rem',
                                color: 'hsl(var(--text-muted))',
                                lineHeight: 1.6,
                                flex: 1,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}>{art.desc}</p>

                            <div style={{
                                marginTop: '1.5rem',
                                paddingTop: '1.25rem',
                                borderTop: '1px solid hsl(var(--color-divider))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: 'hsl(var(--text-dim))'
                            }}>
                                <span style={{ letterSpacing: '0.05em' }}>OPEN SPECIFICATION</span>
                                <ArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document Viewer Modal */}
            {selectedArtifact && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedArtifact(null)} />
                    <div className="animate-in fade-in zoom-in-95 duration-300" style={{
                        background: 'white',
                        width: '100%',
                        maxWidth: '1100px',
                        height: '90vh',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid hsl(var(--color-divider))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '1rem', background: 'hsl(var(--color-bg-base))', color: 'hsl(var(--color-primary))' }}>
                                    <selectedArtifact.icon size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--color-primary))', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>STUDIO STANDARD V1.0</div>
                                    <h2 style={{ fontFamily: "'Paperlogy', sans-serif", fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'hsl(var(--color-ink))' }}>{selectedArtifact.title}</h2>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button style={{ padding: '0.75rem', borderRadius: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--text-muted))' }} title="Download"><Download size={20} /></button>
                                <button onClick={() => setSelectedArtifact(null)} style={{ padding: '0.75rem', borderRadius: '1rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--color-error))' }}><X size={24} /></button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 5rem', background: '#FCFBF9' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>
                                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[hsl(var(--color-primary))] rounded-full animate-spin" />
                                    Loading Specification...
                                </div>
                            ) : (
                                <div className="prose prose-lg max-w-4xl mx-auto" style={{ fontFamily: "'Paperlogy', sans-serif" }}>
                                    {/* Markdown Style Injection for Content */}
                                    <style>{`
                                        .prose p { line-height: 1.8; margin-bottom: 1.5em; color: hsl(var(--text-main)); font-size: 1.05rem; }
                                        .prose h1 { font-family: 'Paperlogy', sans-serif !important; font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5em; color: hsl(var(--color-ink)); border-bottom: 2px solid hsl(var(--color-divider)); padding-bottom: 0.5em; }
                                        .prose h2 { font-family: 'Paperlogy', sans-serif !important; font-size: 1.5rem; font-weight: 700; margin-top: 2.5em; margin-bottom: 1em; color: hsl(var(--color-primary)); border-left: 4px solid hsl(var(--color-primary)); padding-left: 1rem; }
                                        .prose h3 { font-family: 'Paperlogy', sans-serif !important; font-size: 1.25rem; font-weight: 700; margin-top: 2em; margin-bottom: 0.75em; color: hsl(var(--color-ink)); }
                                        .prose ul, .prose ol { padding-left: 1.5em; margin-bottom: 1.5em; }
                                        .prose li { margin-bottom: 0.5em; color: hsl(var(--text-main)); position: relative; }
                                        .prose table { width: 100%; border-collapse: collapse; margin: 2em 0; border: 1px solid hsl(var(--color-border)); border-radius: 8px; overflow: hidden; }
                                        .prose th { background: hsl(var(--color-bg-accent)); color: hsl(var(--color-ink)); font-weight: 700; padding: 1rem; text-align: left; border-bottom: 2px solid hsl(var(--color-border)); }
                                        .prose td { padding: 1rem; border-bottom: 1px solid hsl(var(--color-divider)); color: hsl(var(--text-main)); }
                                        .prose tr:last-child td { border-bottom: none; }
                                        .prose blockquote { font-style: normal; border-left: 4px solid hsl(var(--color-primary)); background: hsla(152, 30%, 33%, 0.05); padding: 1rem 1.5rem; border-radius: 0 8px 8px 0; margin: 1.5em 0; color: hsl(var(--text-main)); }
                                    `}</style>
                                    {renderContent(content)}

                                    <div style={{ marginTop: '5rem', paddingTop: '2.5rem', borderTop: '2px dashed hsl(var(--color-divider))', textAlign: 'center', opacity: 0.5 }}>
                                        <Shield className="mx-auto mb-4 text-[hsl(var(--color-primary))]" size={40} />
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.3em', marginBottom: '0.25rem' }}>OFFICIALLY VERIFIED AT STUDIO</div>
                                        <div style={{ fontSize: '0.65rem' }}>Generated on {new Date().toLocaleDateString('ko-KR')}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
