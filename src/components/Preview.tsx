import { motion } from 'framer-motion';
import { Play, Maximize2, RotateCcw } from 'lucide-react';

export default function PreviewFrame() {
    return (
        <div style={{
            width: '100%', height: '100%', background: 'white', borderRadius: '1.5rem',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)'
        }}>
            <header style={{
                height: '40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem'
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <div style={{
                    background: '#e2e8f0', padding: '0.2rem 0.75rem', borderRadius: '100px',
                    fontSize: '10px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    <RotateCcw size={10} />
                    LOCALPREVIEW:5173
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', color: '#94a3b8' }}>
                    <Play size={12} cursor="pointer" />
                    <Maximize2 size={12} cursor="pointer" />
                </div>
            </header>

            <div style={{
                flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white', padding: '2.5rem', borderRadius: '1.25rem',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center',
                        maxWidth: '280px', position: 'relative', zIndex: 2
                    }}
                >
                    <h3 style={{ color: '#0f172a', fontSize: '15px', fontWeight: 900, marginBottom: '0.5rem' }}>준비 완료</h3>
                    <p style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.5, marginBottom: '1.5rem' }}>생성된 코드가 라이브 프리미엄 환경에서 즉시 렌더링됩니다.</p>
                    <div style={{ height: '4px', width: '100%', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', background: '#3b82f6', width: '40%' }}
                            animate={{ width: ['40%', '60%', '40%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>

                {/* Aesthetic Background Grid */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
            </div>
        </div>
    );
}
