import { Send, Sparkles, Paperclip, Mic } from 'lucide-react';
import { useState } from 'react';

export default function ChatPanel() {
    const [prompt, setPrompt] = useState('');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '1.5rem', borderBottom: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))' }}>
                    Studio Chat
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '10px', padding: '0.2rem 0.5rem', background: 'hsla(var(--color-primary), 0.1)', color: 'hsl(var(--color-primary))', borderRadius: '4px', fontWeight: 700 }}>Gemini 1.5 Pro</span>
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ChatMessage role="ai" text="소스 파일이 로드되었습니다. 어떤 애플리케이션을 빌드할까요? 간단한 설명만으로도 시작할 수 있습니다." />
                <ChatMessage role="user" text="업로드한 PDF를 기반으로 교육용 퀴즈 앱을 만들어줘." />
                <ChatMessage role="ai" text="네, 교육용 퀴즈 앱 구조를 설계했습니다. 메인 화면과 퀴즈 인터페이스를 생성합니다..." />
            </div>

            <div style={{ padding: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1rem', position: 'relative' }}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your app..."
                        style={{
                            width: '100%', background: 'transparent', border: 'none', color: 'white',
                            fontSize: '14px', resize: 'none', height: '60px', outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                            <Paperclip size={16} className="hover:text-white cursor-pointer" />
                            <Mic size={16} className="hover:text-white cursor-pointer" />
                        </div>
                        <button style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'var(--grad-premium)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatMessage({ role, text }: { role: 'user' | 'ai', text: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: role === 'user' ? 'flex-end' : 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {role === 'ai' && <Sparkles size={12} className="text-gold" />}
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{role === 'ai' ? 'DESIGNER' : 'YOU'}</span>
            </div>
            <div style={{
                maxWidth: '90%',
                padding: '1rem',
                borderRadius: '1rem',
                borderTopLeftRadius: role === 'ai' ? '0' : '1rem',
                borderTopRightRadius: role === 'user' ? '0' : '1rem',
                fontSize: '13px',
                lineHeight: 1.6,
                background: role === 'user' ? 'hsla(var(--color-primary), 0.2)' : 'hsla(0,0%,100%,0.05)',
                border: '1px solid hsla(0,0%,100%,0.05)',
                color: 'hsl(var(--text-main))'
            }}>
                {text}
            </div>
        </div>
    );
}
