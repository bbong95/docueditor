import { useRef } from 'react';
import { Upload, Save, LogOut, Download, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export default function StudioHeader() {
    const { pages, handleFileUpload } = useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            const { handleClear } = useEditorStore.getState();
            handleClear();
            localStorage.removeItem('gemini_api_key');
            window.location.reload();
        }
    };

    return (
        <header className="studio-header">
            <div className="brand-wrap">
                <img
                    src="/assets/logo.png"
                    alt="DocuEditor Logo"
                />
                <div className="brand-copy">
                    <strong style={{ fontFamily: 'Paperlogy, sans-serif' }}>DocuEditor</strong>
                    <span>Text replacement studio</span>
                </div>
            </div>

            <div className="header-actions">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                />
                <button className="btn-pill" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} />
                    파일 업로드
                </button>
                <button className="btn-pill" disabled={pages.length === 0} onClick={() => {
                    useEditorStore.getState().setPendingExport('image');
                    useEditorStore.getState().setShowAnalystReport(true);
                }}>
                    <Save size={16} />
                    이미지 저장
                </button>
                <button
                    className="btn-pill"
                    onClick={() => useEditorStore.getState().setViewMode('deliverables')}
                    style={{ border: '1px solid hsl(var(--color-primary))', color: 'hsl(var(--color-primary))' }}
                >
                    <Layers size={16} />
                    산출물
                </button>
                <button className="btn-pill" onClick={onLogout} style={{ color: 'hsl(var(--color-error))' }}>
                    <LogOut size={16} />
                    로그아웃
                </button>
                <button className="btn-pill primary" disabled={pages.length === 0} onClick={() => {
                    useEditorStore.getState().setPendingExport('pdf');
                    useEditorStore.getState().setShowAnalystReport(true);
                }}>
                    <Download size={16} />
                    PDF 다운로드
                </button>
            </div>
        </header>
    );
}
