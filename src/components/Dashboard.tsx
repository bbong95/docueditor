import { BarChart3, Clock, CheckCircle2, AlertTriangle, Layers, Zap } from 'lucide-react';

export default function OutputDashboard() {
    return (
        <div style={{
            height: '100%', padding: '1.5rem', overflowY: 'auto',
            background: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900 }}>교정 통계</h3>
                <div style={{ padding: '0.4rem 0.8rem', background: 'hsl(var(--color-primary-soft))', color: 'hsl(var(--color-primary))', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>
                    LIVE
                </div>
            </div>

            {/* Grid Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <StatCard icon={CheckCircle2} color="hsl(var(--color-success))" label="완료" value="12" />
                <StatCard icon={AlertTriangle} color="hsl(var(--color-error))" label="미교정" value="4" />
                <StatCard icon={Clock} color="hsl(var(--color-primary))" label="진행 시간" value="2m 45s" />
                <StatCard icon={Zap} color="hsl(var(--color-secondary))" label="정확도" value="98.2%" />
            </div>

            {/* Artifact List */}
            <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '1rem', color: 'hsl(var(--text-muted))' }}>최근 산출물</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <ArtifactItem name="Slide_01_Corrected.png" type="Image" date="2분 전" />
                    <ArtifactItem name="Text_Analysis_Report.pdf" type="Report" date="5분 전" />
                    <ArtifactItem name="Original_Source.png" type="Source" date="10분 전" />
                </div>
            </div>

            {/* Chart Placeholder */}
            <div style={{
                flex: 1, minHeight: '140px', background: 'hsl(var(--grad-soft))',
                borderRadius: '1.5rem', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                flexDirection: 'column'
            }}>
                <BarChart3 size={24} style={{ color: 'hsl(var(--color-primary))', opacity: 0.5 }} />
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>작업 분포 차트 (준비 중)</span>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
    return (
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{label}</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900 }}>{value}</span>
        </div>
    );
}

function ArtifactItem({ name, type, date }: { name: string, type: string, date: string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
            background: 'white', borderRadius: '1rem', border: '1px solid var(--glass-border)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.01)', transition: 'transform 0.2s', cursor: 'pointer'
        }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsl(var(--color-bg-base))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={14} style={{ color: 'hsl(var(--color-primary))' }} />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', fontWeight: 800 }}>{name}</p>
                <p style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{type} · {date}</p>
            </div>
        </div>
    );
}
