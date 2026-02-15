import { History, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function HistoryPanel() {
    const { boxes, selectedBox, setSelectedBox, removeBox } = useEditorStore();

    const appliedBoxes = boxes.filter(b => b.applied);

    return (
        <aside className="history-panel fade-in" style={{
            width: '280px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--color-border))' }}>
                <h2 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={16} /> 수정 히스토리
                </h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {appliedBoxes.length > 0 ? (
                    appliedBoxes.map((box, idx) => (
                        <div
                            key={box.id}
                            onClick={() => setSelectedBox(box)}
                            className="history-item"
                            style={{
                                padding: '1rem', borderRadius: '0.75rem', background: selectedBox?.id === box.id ? 'hsla(152, 31%, 31%, 0.12)' : 'hsla(0, 0%, 100%, 0.55)',
                                border: `1px solid ${selectedBox?.id === box.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-divider))'}`,
                                marginBottom: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '10px', color: 'hsl(var(--color-primary))', fontWeight: 800 }}>EDIT #{idx + 1}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeBox(box.id);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', padding: 0 }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-main))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {box.text}
                            </p>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'hsl(var(--text-dim))', marginTop: '2rem' }}>
                        <p style={{ fontSize: '0.8rem' }}>아직 수정한 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
