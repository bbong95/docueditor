import { useState, useEffect } from 'react';
import { Type, Type as FontIcon, Palette, Pipette, AlignLeft, AlignCenter, AlignRight, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, Minus, Plus, Image as ImageIcon, ScanText } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

const TextAreaWithIME = ({ text, onChange }: { text: string, onChange: (val: string) => void }) => {
    const [localText, setLocalText] = useState(text);
    const [isComposing, setIsComposing] = useState(false);

    // Sync local state when external text changes (e.g. selecting a different box)
    // We strictly compare values to avoid cursor jumping if unnecessary
    useEffect(() => {
        if (!isComposing && text !== localText) {
            setLocalText(text);
        }
    }, [text, isComposing]);

    return (
        <textarea
            value={localText}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
                setIsComposing(false);
                // Ensure final composition result is captured
                const newVal = e.currentTarget.value;
                setLocalText(newVal);
                onChange(newVal);
            }}
            onChange={(e) => {
                setLocalText(e.target.value);
                // Update parent immediately only if not composing (for non-IME inputs)
                // For IME, we wait for compositionEnd or let the local state handle the buffer
                onChange(e.target.value);
            }}
            style={{
                width: '100%', padding: '1rem', background: 'hsl(var(--color-surface))',
                border: '1px solid hsl(var(--color-border))', borderRadius: '0.5rem',
                color: 'hsl(var(--text-main))', fontSize: '1rem', resize: 'none', height: '120px', outline: 'none',
                lineHeight: 1.5, fontFamily: 'Paperlogy, sans-serif'
            }}
        />
    );
};

export default function PropertiesPanel() {
    const { selectedBox, setSelectedBox, handleApplyReplacement } = useEditorStore();

    if (!selectedBox) {
        return (
            <aside className="properties-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <Type size={16} style={{ color: 'hsl(var(--color-primary))' }} />
                    <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>텍스트 교체</h2>
                </div>
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', color: 'hsl(var(--text-dim))', gap: '1rem'
                }}>
                    <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'hsl(var(--color-surface))' }}>
                        <ScanText size={40} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                        텍스트 교체 영역을 선택하거나<br />
                        교체된 텍스트를 클릭하세요
                    </p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="properties-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <Type size={16} style={{ color: 'hsl(var(--color-primary))' }} />
                <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>텍스트 교체</h2>
            </div>

            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                        <Type size={12} /> 인지된 텍스트
                    </label>
                    <TextAreaWithIME
                        text={selectedBox.text}
                        onChange={(newText) => setSelectedBox({ ...selectedBox, text: newText })}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                        <Type size={12} /> Paperlogy 폰트 굵기
                    </label>
                    <select
                        value={selectedBox.fontWeight || '400'}
                        onChange={(e) => setSelectedBox({ ...selectedBox, fontWeight: e.target.value })}
                        style={{
                            width: '100%', padding: '0.5rem', background: 'hsl(var(--color-surface))',
                            border: '1px solid hsl(var(--color-border))', borderRadius: '0.4rem',
                            color: 'hsl(var(--text-main))', fontSize: '0.9rem', outline: 'none',
                            fontFamily: 'Paperlogy, sans-serif',
                            fontWeight: parseInt(selectedBox.fontWeight as string) || 400
                        }}
                    >
                        <option value="100" style={{ fontWeight: 100 }}>Paperlogy Thin (100)</option>
                        <option value="200" style={{ fontWeight: 200 }}>Paperlogy ExtraLight (200)</option>
                        <option value="300" style={{ fontWeight: 300 }}>Paperlogy Light (300)</option>
                        <option value="400" style={{ fontWeight: 400 }}>Paperlogy Regular (400)</option>
                        <option value="500" style={{ fontWeight: 500 }}>Paperlogy Medium (500)</option>
                        <option value="600" style={{ fontWeight: 600 }}>Paperlogy SemiBold (600)</option>
                        <option value="700" style={{ fontWeight: 700 }}>Paperlogy Bold (700)</option>
                        <option value="800" style={{ fontWeight: 800 }}>Paperlogy ExtraBold (800)</option>
                        <option value="900" style={{ fontWeight: 900 }}>Paperlogy Black (900)</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                            <FontIcon size={12} /> 폰트 크기
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => setSelectedBox({ ...selectedBox, fontSize: Math.max(1, (selectedBox.fontSize || 16) - 1) })}
                                className="btn-pill" style={{ padding: '0.4rem', minWidth: 'auto' }}
                            >
                                <Minus size={12} />
                            </button>
                            <input
                                type="number"
                                value={selectedBox.fontSize || 20}
                                onChange={(e) => setSelectedBox({ ...selectedBox, fontSize: parseInt(e.target.value) || 0 })}
                                style={{
                                    width: '100%', background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))',
                                    borderRadius: '0.4rem', color: 'hsl(var(--text-main))', textAlign: 'center', padding: '0.4rem', fontSize: '0.9rem', fontWeight: 700
                                }}
                            />
                            <button
                                onClick={() => setSelectedBox({ ...selectedBox, fontSize: (selectedBox.fontSize || 16) + 1 })}
                                className="btn-pill" style={{ padding: '0.4rem', minWidth: 'auto' }}
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                            <Palette size={12} /> 폰트 색상
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'hsl(var(--color-surface))', padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid hsl(var(--color-border))'
                            }}>
                                <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: selectedBox.fontColor || '#FFFFFF' }} />
                                <input
                                    type="text"
                                    value={selectedBox.fontColor || '#FFFFFF'}
                                    onChange={(e) => setSelectedBox({ ...selectedBox, fontColor: e.target.value })}
                                    style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-main))', fontSize: '10px', width: '100%', outline: 'none', fontWeight: 600 }}
                                />
                            </div>
                            <button
                                title="색상 추출"
                                onClick={async () => {
                                    // @ts-expect-error - roughjs type mismatch
                                    if (!window.EyeDropper) return;
                                    try {
                                        // @ts-expect-error - roughjs type mismatch
                                        const eyeDropper = new window.EyeDropper();
                                        const result = await eyeDropper.open();
                                        setSelectedBox({ ...selectedBox, fontColor: result.sRGBHex });
                                    } catch (e) { }
                                }}
                                className="btn-pill" style={{ padding: '0.4rem', minWidth: 'auto', background: 'hsla(var(--color-primary), 0.15)', color: 'hsl(var(--color-primary))' }}
                            >
                                <Pipette size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                            <AlignLeft size={12} /> 가로 정렬
                        </label>
                        <div style={{ display: 'flex', background: 'hsl(var(--color-surface))', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--color-border))' }}>
                            {(['left', 'center', 'right'] as const).map(align => (
                                <button
                                    key={align}
                                    onClick={() => setSelectedBox({ ...selectedBox, textAlign: align })}
                                    style={{
                                        flex: 1, padding: '0.4rem', border: 'none', borderRadius: '0.3rem', cursor: 'pointer',
                                        background: (selectedBox.textAlign || 'left') === align ? 'hsl(var(--color-primary))' : 'transparent',
                                        color: (selectedBox.textAlign || 'left') === align ? 'white' : 'hsl(var(--text-dim))',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                            <AlignStartHorizontal size={12} /> 세로 정렬
                        </label>
                        <div style={{ display: 'flex', background: 'hsl(var(--color-surface))', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--color-border))' }}>
                            {(['top', 'middle', 'bottom'] as const).map(align => (
                                <button
                                    key={align}
                                    onClick={() => setSelectedBox({ ...selectedBox, verticalAlign: align })}
                                    style={{
                                        flex: 1, padding: '0.4rem', border: 'none', borderRadius: '0.3rem', cursor: 'pointer',
                                        background: (selectedBox.verticalAlign || 'top') === align ? 'hsl(var(--color-primary))' : 'transparent',
                                        color: (selectedBox.verticalAlign || 'top') === align ? 'white' : 'hsl(var(--text-dim))',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {align === 'top' && <AlignStartHorizontal size={14} />}
                                    {align === 'middle' && <AlignCenterHorizontal size={14} />}
                                    {align === 'bottom' && <AlignEndHorizontal size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-dim))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
                        <ImageIcon size={12} /> 텍스트 배경색 (합성용)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'hsl(var(--color-surface))', padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid hsl(var(--color-border))'
                        }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)', background: selectedBox.backgroundColor || '#0B1120' }} />
                            <input
                                type="text"
                                value={selectedBox.backgroundColor || '#0B1120'}
                                onChange={(e) => setSelectedBox({ ...selectedBox, backgroundColor: e.target.value })}
                                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-main))', fontSize: '10px', width: '100%', outline: 'none', fontWeight: 600 }}
                            />
                        </div>
                        <button
                            title="배경색 추출"
                            onClick={async () => {
                                // @ts-expect-error - roughjs type mismatch
                                if (!window.EyeDropper) return;
                                try {
                                    // @ts-expect-error - roughjs type mismatch
                                    const eyeDropper = new window.EyeDropper();
                                    const result = await eyeDropper.open();
                                    setSelectedBox({ ...selectedBox, backgroundColor: result.sRGBHex });
                                } catch (e) { }
                            }}
                            className="btn-pill" style={{ padding: '0.4rem', minWidth: 'auto', background: 'hsla(var(--color-primary), 0.15)', color: 'hsl(var(--color-primary))' }}
                        >
                            <Pipette size={14} />
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'hsla(217, 91%, 60%, 0.1)', borderRadius: '1rem', border: '1px solid hsla(217, 91%, 60%, 0.2)', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '11px', color: 'hsl(var(--color-primary))', lineHeight: 1.5, fontWeight: 600 }}>
                            AI가 배경색(`#${selectedBox.backgroundColor?.replace('#', '') || '0B1120'}`)을 감지했습니다. <br />브러시 영역에 글자를 합성합니다.
                        </p>
                    </div>
                    <button
                        className="btn-pill primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.9rem' }}
                        onClick={handleApplyReplacement}
                    >
                        변경 사항 적용하기
                    </button>
                </div>
            </div>
        </aside>
    );
}
