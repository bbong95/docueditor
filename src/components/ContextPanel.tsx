import { Folder, FileText, UploadCloud, Plus } from 'lucide-react';

export default function ContextPanel() {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '1.5rem', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))' }}>
                    Sources
                </h3>
            </header>

            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                        <UploadCloud size={20} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Upload PDF / Images</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <SourceItem icon={FileText} name="Requirements.pdf" size="2.4MB" />
                    <SourceItem icon={Folder} name="Assets" size="4 files" />
                </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}>
                <button style={{
                    width: '100%', padding: '0.75rem', background: 'hsla(0,0%,100%,0.05)',
                    border: '1px solid hsla(0,0%,100%,0.1)', borderRadius: '0.75rem',
                    color: 'hsl(var(--text-main))', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    cursor: 'pointer'
                }}>
                    <Plus size={14} />
                    Add Source
                </button>
            </div>
        </div>
    );
}

function SourceItem({ icon: Icon, name, size }: { icon: any, name: string, size: string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
            borderRadius: '0.75rem', background: 'hsla(0,0%,100%,0.02)',
            cursor: 'pointer', transition: 'background 0.2s'
        }} className="hover:bg-white/5">
            <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'hsla(0,0%,100%,0.05)' }}>
                <Icon size={14} className="text-blue-400" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: '10px', color: 'hsl(var(--text-dim))' }}>{size}</div>
            </div>
        </div>
    );
}
