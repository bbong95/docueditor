# 🏗️ 정보 구조 (IA) 정의서

## 1. 사이트 구조 (Sitemap)

### 1.1 루트 (`/`)
- **초기 상태 (Landing)**: "Drag & Drop" 영역이 있는 빈 상태.
- **활성 상태 (Active)**: 스튜디오 인터페이스.

### 1.2 스튜디오 (The Studio)
- **헤더 (`StudioHeader`)**
  - 브랜드 로고
  - **에이전트 존 (Agent Zone)**: 4명의 분산 에이전트.
  - **액션 툴바**: 업로드, 초기화, 이미지 저장, PDF 다운로드.
- **좌측 사이드바 (`SidebarNav`)**
  - **내비게이션**: 페이지, 히스토리, 설정.
  - **패널**:
    - `PageThumbnailPanel`: 다중 페이지 탐색.
    - `HistoryPanel`: 실행 취소/다시 실행(Undo/Redo) 로그.
- **중앙 스테이지 (`Canvas`)**
  - 뷰포트 (팬/줌 기능).
  - **텍스트 레이어**: 이미지 위에 오버레이된 편집 가능한 텍스트 박스.
  - **선택 HUD**: 선택된 항목에 대한 컨텍스트 메뉴.
- **우측 사이드바 (`PropertiesPanel`)**
  - **텍스트 속성**: 폰트, 크기, 색상, 정렬.
  - **레이아웃 속성**: 위치 (X/Y), 크기 (W/H).
- **오버레이 (Overlays)**
  - **AnalystReportModal**: 품질 보증 요약 리포트.
  - **OnboardingTour**: 신규 사용자를 위한 가이드.

---

## 2. 데이터 모델 (State Architecture)
`zustand` (`useEditorStore`)를 통해 관리됩니다.

### 2.1 EditorState
```typescript
interface EditorState {
  // 콘텐츠 데이터
  pages: string[];        // 이미지 Blob URL 배열
  boxes: TextBox[];       // 모든 텍스트 박스의 플랫 하이퍼 배열
  
  // 선택 및 상호작용
  selectedBox: TextBox | null;
  activePageIndex: number;
  zoomLevel: number;
  
  // 시스템 상태
  isUploading: boolean;   // Developer 에이전트 트리거
  isExporting: boolean;   // Analyst 에이전트 트리거
  isHistoryOpen: boolean;
}
```

### 2.2 TextBox 엔티티
```typescript
interface TextBox {
  id: string;
  pageIndex: number;      // 소속 페이지 인덱스
  text: string;
  x: number; y: number;
  width: number; height: number;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    ...
  }
}
```
