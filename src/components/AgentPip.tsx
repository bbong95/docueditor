import { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import AgentOffice3D from './AgentOffice3D';
import { motion, AnimatePresence as _AnimatePresence } from 'framer-motion';

export default function AgentPip() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, _setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                width: isExpanded ? '100vw' : '320px',
                height: isExpanded ? '100vh' : '220px',
                borderRadius: isExpanded ? 0 : '1rem',
                bottom: isExpanded ? 0 : '2rem',
                right: isExpanded ? 0 : '2rem',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                position: 'fixed',
                zIndex: isExpanded ? 9999 : 50,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isExpanded ? 'none' : '0 20px 40px -10px rgba(0,0,0,0.15)',
                overflow: 'hidden'
            }}
        >
            {/* Header Controls */}
            <div style={{
                position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                display: 'flex', gap: '0.5rem'
            }}>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="btn-icon"
                    style={{
                        background: 'rgba(255,255,255,0.5)', borderRadius: '50%', padding: '0.5rem',
                        cursor: 'pointer', border: 'none', color: '#1e293b'
                    }}
                >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        className="btn-icon"
                        style={{
                            background: 'rgba(255,255,255,0.5)', borderRadius: '50%', padding: '0.5rem',
                            cursor: 'pointer', border: 'none', color: '#1e293b'
                        }}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Title Overlay (Mini Mode) */}
            {!isExpanded && (
                <div style={{
                    position: 'absolute', top: '1rem', left: '1rem', zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                        Agent Office
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>Active</span>
                    </div>
                </div>
            )}

            {/* Click to Expand Overlay (Mini Mode) */}
            {!isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    style={{
                        position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer'
                    }}
                    title="Click to expand 3D Office"
                />
            )}

            {/* 3D Scene */}
            <div style={{ width: '100%', height: '100%' }}>
                <AgentOffice3D status="active" viewMode={isExpanded ? 'full' : 'mini'} />
            </div>
        </motion.div>
    );
}
