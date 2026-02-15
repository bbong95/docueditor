import { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useEditorStore } from './store/useEditorStore';
import SlideEditor from './components/SlideEditor';
import OnboardingTour from './components/OnboardingTour';
import DistributedAgents from './components/DistributedAgents';
import LoginScreen from './components/auth/LoginScreen';
import StudioLayout from './components/layout/StudioLayout';
import DeliverablesPortal from './components/DeliverablesPortal';
import { OCRService } from './services/ocrService';

const ocrService = OCRService.getInstance();

/**
 * 메인 애플리케이션 컴포넌트 (App)
 *
 * 에디터의 주요 상태와 이벤트 핸들링을 관리하며, `StudioLayout`을 통해 UI를 구성합니다.
 * 파일 업로드(Drag & Drop) 및 편집 모드 전환 로직을 포함합니다.
 */
function App() {
  const {
    pages,
    boxes,
    selectedBox,
    // isHistoryOpen, // Layout으로 이동됨
    setBoxes,
    setSelectedBox,
    handleFileUpload,
    viewMode
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <StudioLayout
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <main
        className={viewMode === 'deliverables' ? 'overflow-hidden relative' : `main-preview ${isDragging ? 'drag-active' : ''}`}
        style={viewMode === 'deliverables' ? {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        } : undefined}
      >
        {isDragging && viewMode !== 'deliverables' && (
          <div className="drag-overlay fade-in">
            <ImageIcon size={64} className="bounce" />
            <p>파일을 이곳에 드롭하여 업로드하세요</p>
          </div>
        )}

        {/* Global Loading Overlay */}
        {useEditorStore(state => state.isUploading) && (
          <>
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)', zIndex: 9998, backdropFilter: 'blur(2px)'
            }} />
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'hsl(var(--color-primary))', color: 'white',
              padding: '1rem 2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', zIndex: 9999, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', fontSize: '1rem', fontWeight: 600,
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <Loader2 size={32} className="animate-spin" />
              <span>
                {(() => {
                  const progress = useEditorStore.getState().uploadProgress;
                  return progress > 0
                    ? `PDF 변환 중... (${progress}%)`
                    : '파일 처리 중...';
                })()}
              </span>
            </div>
          </>
        )}

        {viewMode === 'deliverables' ? (
          <DeliverablesPortal />
        ) : pages.length > 0 ? (
          <SlideEditor
            pages={pages}
            boxes={boxes}
            selectedBox={selectedBox}
            onBoxesChange={setBoxes}
            onBoxSelect={setSelectedBox}
            onSelectionComplete={(box) => {
              setBoxes(prev => {
                const existing = Array.isArray(prev) ? prev : [];
                return [...existing, box];
              });
              setSelectedBox(box);
            }}
          />
        ) : (
          <div className="fade-in empty-intro">
            <div className="eyebrow">editorial workspace</div>
            <div className="empty-icon">
              <ImageIcon size={48} />
            </div>
            <h1 className="empty-title" style={{ fontFamily: 'Paperlogy, sans-serif', fontWeight: 800 }}>AI Slide Atelier</h1>
            <p className="empty-description">
              PDF 또는 이미지를 업로드하여 지능형 텍스트 교체를 시작하세요.
              AI가 폰트와 스타일을 완벽하게 재현합니다.
            </p>
            <button
              className="btn-pill primary"
              style={{ padding: '0.9rem 1.6rem', fontSize: '0.9rem', margin: '0 auto' }}
              onClick={() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                input?.click();
              }}
            >
              파일 선택하기
            </button>
          </div>
        )}
      </main>
      <OnboardingTour />
      <DistributedAgents />
    </StudioLayout>
  );
}

export default function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(ocrService.hasApiKey());
  const [apiKeyInput, setApiKeyInput] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.length < 10) {
      alert('유효한 API Key를 입력해주세요.');
      return;
    }
    ocrService.setApiKey(apiKeyInput);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginScreen apiKey={apiKeyInput} onChange={setApiKeyInput} onLogin={handleLogin} />;
  }

  return <App />;
}
