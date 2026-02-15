import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Artifact {
    id: string;
    title: string;
    type: string;
    path: string;
    desc: string;
}

interface ArtifactViewerProps {
    artifact: Artifact;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function ArtifactViewer({ artifact, onClose }: ArtifactViewerProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Handle different file types
        if (artifact.type === 'doc' || artifact.type === 'report') {
            fetch(artifact.path)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load ${artifact.path}`);
                    return res.text();
                })
                .then(text => {
                    setContent(text);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Artifact load error:", err);
                    setError("문서를 불러오는 중 오류가 발생했습니다.");
                    setLoading(false);
                });
        } else if (artifact.type === 'arch') {
            // For Excalidraw, we can't easily render .excalidraw JSON files directly without the heavy Excalidraw package.
            // Check if there's a corresponding .png or just show a roadmap/placeholder.
            // For this implementation, we will show a "Preview Not Available" for raw Excalidraw unless we have images.
            // BUT, the project has some .png exports like architecture diagrams? 
            // If not, we fall back to a specific message or try to load a matching png if convention exists.
            // Strategy: Try to load path.replace('.excalidraw', '.png')? 
            // The prompt implies "Direct Viewing".
            // Let's rely on the file extension.
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [artifact]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="artifact-viewer-overlay"
                style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    background: 'hsla(0, 0%, 0%, 0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: isFullscreen ? 0 : '2rem'
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div
                    className="viewer-content"
                    style={{
                        background: '#fff',
                        width: isFullscreen ? '100%' : 'min(1200px, 90vw)',
                        height: isFullscreen ? '100%' : 'min(85vh, 800px)',
                        borderRadius: isFullscreen ? 0 : '1rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {/* Toolbar */}
                    <div style={{
                        padding: '1rem 1.5rem', borderBottom: '1px solid #eee',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: '#f9fafb'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#111', fontFamily: '"Paperlogy", sans-serif' }}>
                                {artifact.title}
                            </h2>
                            <span style={{
                                fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: '#333', color: '#fff',
                                borderRadius: '99px', textTransform: 'uppercase', fontWeight: 600
                            }}>
                                {artifact.type === 'arch' ? 'Architecture' : 'Document'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="toolbar-btn" style={toolbarBtnStyle}>
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <a href={artifact.path} download className="toolbar-btn" style={toolbarBtnStyle}>
                                <Download size={18} />
                            </a>
                            <button onClick={onClose} className="toolbar-btn close" style={{ ...toolbarBtnStyle, color: '#ef4444' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: isFullscreen ? '3rem' : '2rem', background: '#fff', position: 'relative' }}>
                        {loading && (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {artifact.path.endsWith('.md') ? (
                                    <div className="markdown-body" style={{ maxWidth: '850px', margin: '0 auto', fontFamily: '"Paperlogy", sans-serif', lineHeight: 1.6 }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                            h1: ({ node, ...props }) => <h1 style={{ fontSize: '2.2em', paddingBottom: '0.5em', borderBottom: '1px solid #eee', marginBottom: '1em', fontFamily: '"Paperlogy", sans-serif', fontWeight: 800, letterSpacing: '-0.02em', color: '#111' }} {...props} />,
                                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.6em', marginTop: '1.5em', marginBottom: '0.8em', fontFamily: '"Paperlogy", sans-serif', fontWeight: 700, color: '#222' }} {...props} />,
                                            p: ({ node, ...props }) => <p style={{ marginBottom: '1em', color: '#374151' }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5em', marginBottom: '1em' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.25em' }} {...props} />,
                                            code: ({ node, inline, className, children, ...props }: any) => {
                                                /language-(\w+)/.exec(className || '')
                                                return !inline ? (
                                                    <pre style={{ background: '#f6f8fa', padding: '1rem', borderRadius: '6px', overflowX: 'auto', marginBottom: '1em' }}>
                                                        <code className={className} {...props}>{children}</code>
                                                    </pre>
                                                ) : (
                                                    <code style={{ background: '#f1f5f9', padding: '0.2em 0.4em', borderRadius: '4px', fontSize: '0.9em', color: '#ec4899' }} {...props}>{children}</code>
                                                )
                                            },
                                            blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '4px solid #e5e7eb', paddingLeft: '1rem', color: '#6b7280', margin: '1em 0' }} {...props} />,
                                            table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1em 0', border: '1px solid #e5e7eb' }} {...props} />,
                                            th: ({ node, ...props }) => <th style={{ background: '#f9fafb', padding: '0.75em', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 600 }} {...props} />,
                                            td: ({ node, ...props }) => <td style={{ padding: '0.75em', borderBottom: '1px solid #e5e7eb' }} {...props} />,
                                            img: ({ node, ...props }) => (
                                                <img
                                                    style={{
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        borderRadius: '8px',
                                                        display: 'block',
                                                        margin: '2rem auto',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                        border: '1px solid rgba(0,0,0,0.05)'
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                        }}>
                                            {content}
                                        </ReactMarkdown>
                                    </div>
                                ) : artifact.path.endsWith('.excalidraw') ? (
                                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                                        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                                            Excalidraw 원본 파일(.excalidraw) 뷰어는 준비 중입니다.<br />
                                            다운로드 후 <a href="https://excalidraw.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>excalidraw.com</a>에서 열람해주세요.
                                        </p>
                                        <a href={artifact.path} download className="btn-pill primary" style={{ display: 'inline-flex', padding: '0.8rem 1.5rem', background: '#333', color: '#fff', borderRadius: '99px', textDecoration: 'none', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={18} /> 파일 다운로드
                                        </a>
                                    </div>
                                ) : (artifact.path.endsWith('.png') || artifact.path.endsWith('.jpg') || artifact.path.endsWith('.jpeg') || artifact.path.endsWith('.webp')) ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', background: '#f8f9fa' }}>
                                        <img
                                            src={artifact.path}
                                            alt={artifact.title}
                                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                    </div>
                                ) : (
                                    <iframe src={artifact.path} style={{ width: '100%', height: '100%', border: 'none' }} title="Preview" />
                                )}
                            </>
                        )}

                        {error && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

const toolbarBtnStyle = {
    background: 'transparent', border: 'none', padding: '0.5rem', borderRadius: '0.375rem',
    cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
};
