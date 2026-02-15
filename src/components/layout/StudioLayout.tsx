import type { ReactNode } from 'react';
import StudioHeader from './StudioHeader';
import SidebarNav from './SidebarNav';
import HistoryPanel from './HistoryPanel';
import PropertiesPanel from './PropertiesPanel';
import AnalystReportModal from '../AnalystReportModal';
import { useEditorStore } from '../../store/useEditorStore';

interface StudioLayoutProps {
    children: ReactNode;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

/**
 * 🏛️ 스튜디오 레이아웃 (Studio Layout)
 * 
 * 애플리케이션의 전체적인 골격을 담당하는 레이아웃 컴포넌트입니다.
 * 헤더, 사이드바, 히스토리 패널, 속성 패널 등 고정된 UI 요소를 배치하고
 * 중앙 콘텐츠 영역(Main Canvas)을 `children`으로 받아 렌더링합니다.
 * 
 * @component
 * @param {ReactNode} children - 메인 캔버스 영역에 들어갈 콘텐츠
 * @param {Function} onDragOver - 파일 드래그 오버 이벤트 핸들러
 * @param {Function} onDragLeave - 파일 드래그 리브 이벤트 핸들러
 * @param {Function} onDrop - 파일 드롭 이벤트 핸들러
 */
export default function StudioLayout({ children, onDragOver, onDragLeave, onDrop }: StudioLayoutProps) {
    const isHistoryOpen = useEditorStore((state) => state.isHistoryOpen);

    return (
        <>
            <StudioHeader />
            <div
                className="studio-layout"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <SidebarNav />
                {isHistoryOpen && <HistoryPanel />}

                {/* Main Content Area */}
                {children}

                <PropertiesPanel />
                <AnalystReportModal />
            </div>
        </>
    );
}
