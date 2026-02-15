import { useState } from 'react';
import PreviewFrame from './Preview';
import OutputDashboard from './Dashboard';
import { Layout, Activity } from 'lucide-react';

type Tab = 'app' | 'dashboard';

export default function PreviewPanel() {
    const [activeTab, setActiveTab] = useState<Tab>('app');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'hsla(0,0%,100%,0.05)', padding: '0.25rem', borderRadius: '0.75rem' }}>
                    <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')} icon={Layout} label="Preview" />
                    <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Activity} label="Dashboard" />
                </div>
            </header>

            <div style={{ flex: 1, overflow: 'hidden', padding: '1.5rem', position: 'relative' }}>
                {activeTab === 'app' && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <PreviewFrame />
                    </div>
                )}
                {activeTab === 'dashboard' && <OutputDashboard />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem',
                background: active ? 'white' : 'transparent',
                color: active ? 'black' : 'hsl(var(--text-muted))',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={14} />
            {label}
        </button>
    )
}
