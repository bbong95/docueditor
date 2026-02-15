import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ThreeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[3D-Error] Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-[4rem] p-10 text-center">
                    <div className="mb-4 text-amber-500">
                        <AlertTriangle size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">3D 엔진 가동 중 브릭 충돌 발생</h2>
                    <p className="text-slate-500 text-sm mb-4">{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors"
                    >
                        엔진 재가동
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ThreeErrorBoundary;
