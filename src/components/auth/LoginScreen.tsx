import React from 'react';
import { Key, LogIn, ExternalLink } from 'lucide-react';

interface LoginScreenProps {
    apiKey: string;
    onChange: (v: string) => void;
    onLogin: (e: React.FormEvent) => void;
}

export default function LoginScreen({ apiKey, onChange, onLogin }: LoginScreenProps) {
    return (
        <div style={{
            height: '100vh', width: '100vw',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8FAFC' // Matching typical logo background
        }}>
            <div className="fade-in" style={{
                width: '100%', maxWidth: '460px', padding: '2.6rem',
                background: '#ffffff', borderRadius: '1.5rem',
                border: '1px solid hsl(var(--color-border))', boxShadow: 'var(--shadow-premium)',
                textAlign: 'center'
            }}>
                <span className="eyebrow">private atelier</span>
                <style>
                    {`
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-12px); }
                            100% { transform: translateY(0px); }
                        }
                    `}
                </style>
                <div style={{
                    width: '240px', height: 'auto', margin: '0 auto 1.5rem',
                    animation: 'float 6s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <img
                        src="/assets/logo_transparent.png"
                        alt="Slide Editor Pro Logo"
                        style={{
                            width: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                <h1 style={{
                    fontSize: '2.4rem', marginBottom: '0.75rem',
                    fontFamily: 'Paperlogy, sans-serif', fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, hsl(var(--color-ink)) 0%, hsl(var(--color-primary)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Slide Editor Pro
                </h1>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    AI 기반의 텍스트 교체 기능을 사용하려면<br />
                    Gemini API Key가 필요합니다.
                </p>

                <form onSubmit={onLogin} style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--text-dim))', marginBottom: '0.5rem', display: 'block' }}>
                        GEMINI API KEY
                    </label>
                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <Key size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-dim))' }} />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="AIzaSy..."
                            style={{
                                width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'hsl(var(--color-bg-base))',
                                border: '1px solid hsl(var(--color-border))', borderRadius: '1rem',
                                color: 'hsl(var(--text-main))', fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>

                    <button className="btn-pill primary" style={{ width: '100%', padding: '1.2rem', justifyContent: 'center', fontSize: '1rem', marginBottom: '1.5rem' }}>
                        <LogIn size={20} />
                        서비스 시작하기
                    </button>
                </form>

                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', color: 'hsl(var(--color-primary))', textDecoration: 'none',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}
                >
                    API Key 발급받기 <ExternalLink size={12} />
                </a>
            </div>
        </div>
    );
}
