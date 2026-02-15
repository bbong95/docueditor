import { History, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function SidebarNav() {
    const { isHistoryOpen, setIsHistoryOpen, handleClear } = useEditorStore();

    return (
        <nav className="sidebar-nav">
            <button
                title="History"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                style={{
                    background: isHistoryOpen ? 'hsl(var(--color-primary))' : 'hsla(0, 0%, 100%, 0.7)',
                    border: '1px solid hsl(var(--color-divider))',
                    color: isHistoryOpen ? 'white' : 'hsl(var(--text-muted))',
                    cursor: 'pointer',
                    padding: '0.7rem',
                    borderRadius: '999px',
                    transition: 'all 0.25s ease',
                    boxShadow: isHistoryOpen ? '0 10px 24px -16px hsla(152, 31%, 26%, 0.8)' : 'none'
                }}
            >
                <History size={24} />
            </button>
            <button
                title="Clear"
                onClick={handleClear}
                style={{
                    background: 'hsla(0, 0%, 100%, 0.7)',
                    border: '1px solid hsl(var(--color-divider))',
                    color: 'hsl(var(--text-muted))',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    padding: '0.7rem',
                    borderRadius: '999px',
                    transition: 'all 0.25s ease'
                }}
            >
                <Trash2 size={24} />
            </button>
        </nav>
    );
}
