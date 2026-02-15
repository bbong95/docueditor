import { useState, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, Type, Download, X, ArrowRight, Sparkles, BoxSelect, ArrowLeft } from 'lucide-react';

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenTour');
        if (!hasSeen) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const steps = [
        {
            icon: ImageIcon,
            title: "DocuEditor에 오신 것을 환영합니다",
            desc: "AI 기반의 문서 편집기로 PDF와 이미지를 손쉽게 변환하고 수정해보세요.",
            color: "hsl(var(--color-primary))"
        },
        {
            icon: UploadCloud,
            title: "간편한 파일 업로드",
            desc: "PDF나 이미지 파일을 화면에 드래그 앤 드롭하거나, 상단의 업로드 버튼을 눌러 시작하세요.",
            color: "#3b82f6"
        },
        {
            icon: BoxSelect,
            title: "자유로운 영역 지정",
            desc: "수정이 필요한 텍스트가 있다면, 마우스로 드래그하여 직접 편집 영역을 지정할 수 있습니다.",
            color: "#8b5cf6"
        },
        {
            icon: Type,
            title: "지능형 텍스트 편집",
            desc: "인식된 텍스트 박스를 클릭하면 AI가 원본 스타일을 유지하며 내용을 수정해줍니다.",
            color: "#ec4899"
        },
        {
            icon: Download,
            title: "다양한 포맷 내보내기",
            desc: "작업이 완료되면 고해상도 이미지나 멀티 페이지 PDF로 문서를 다운로드할 수 있습니다.",
            color: "#f59e0b"
        }
    ];

    if (!isVisible) return null;

    const CurrentIcon = steps[step].icon;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} className="fade-in">
            <div style={{
                width: '420px', background: 'white', borderRadius: '1.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden', position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={handleComplete}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'hsl(var(--text-dim))', padding: '0.5rem',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    className="hover:bg-slate-100 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div style={{ padding: '3rem 2rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: `${steps[step].color}1A`, // 10% opacity
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.5rem', color: steps[step].color
                    }} className="animate-pop">
                        <CurrentIcon size={40} strokeWidth={1.5} />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'hsl(var(--color-ink))' }}>
                        {steps[step].title}
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-muted))', lineHeight: 1.6, marginBottom: '2.5rem', minHeight: '3rem' }}>
                        {steps[step].desc}
                    </p>

                    {/* Progress Dots */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: idx === step ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'grid', gridTemplateColumns: step > 0 ? '1fr 2fr' : '1fr', gap: '0.8rem', width: '100%' }}>
                        {step > 0 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="btn-pill"
                                style={{
                                    justifyContent: 'center', padding: '1rem',
                                    fontSize: '1rem', borderRadius: '1rem',
                                    color: 'hsl(var(--text-dim))',
                                    border: '1px solid hsl(var(--color-border))'
                                }}
                            >
                                <ArrowLeft size={18} /> 이전
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (step < steps.length - 1) {
                                    setStep(s => s + 1);
                                } else {
                                    handleComplete();
                                }
                            }}
                            className="btn-pill primary"
                            style={{
                                justifyContent: 'center', padding: '1rem',
                                fontSize: '1rem', borderRadius: '1rem'
                            }}
                        >
                            {step < steps.length - 1 ? (
                                <>다음 <ArrowRight size={18} /></>
                            ) : (
                                <>시작하기 <Sparkles size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
