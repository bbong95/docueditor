# 🧪 단위 테스트 계획 (Unit Test Plan)

## 1. 목적
개별 컴포넌트와 유틸리티 함수가 격리된 환경에서 논리, 상태 업데이트, 렌더링 동작을 정확히 수행하는지 검증합니다.

## 2. 범위
- **Utils**: `pdfUtils`, `colorUtils`, `mathUtils`.
- **Services**: `OCRService` (Mocking 처리).
- **Store**: `useEditorStore` (상태 전이 확인).
- **Components**: `DistributedAgents`, `SlideEditor` (단순 렌더링).

## 3. 테스트 케이스

### 3.1 유틸리티 테스트
| 모듈 | 테스트 케이스 | 입력 | 예상 출력 |
| :--- | :--- | :--- | :--- |
| `pdfUtils` | `convertPdfToImage` | 유효한 PDF 파일 | Blob URL 배열 |
| `pdfUtils` | `convertPdfToImage` | 손상된 파일 | 에러 반환 / 빈 배열 |
| `colorUtils` | `hexToRgb` | `#FFFFFF` | `{r:255, g:255, b:255}` |

### 3.2 스토어 테스트 (`useEditorStore`)
| 액션 | 테스트 시나리오 | 초기 상태 | 결과 상태 |
| :--- | :--- | :--- | :--- |
| `setPages` | 새 페이지 추가 | `pages: []` | `pages: ['url1', 'url2']` |
| `updateBox` | 텍스트 내용 수정 | `box[0].text: 'A'` | `box[0].text: 'B'` |
| `setIsExporting` | 내보내기 트리거 | `isExporting: false` | `isExporting: true` |

### 3.3 컴포넌트 테스트 (Vitest + RTL)
- **`DistributedAgents`**: 
  - 4개의 앵커(DOM) 렌더링 확인.
  - Canvas 존재 여부 확인.
  - `isArchitectWorking` props 로직 확인.
- **`SlideEditor`**:
  - 각 페이지별 `ConfigurableCanvas` 렌더링 확인.
  - 텍스트 박스가 올바른 좌표에 표시되는지 확인.

---

# 🔗 통합 테스트 계획 (Integration Test Plan)

## 1. 목적
상호작용하는 모듈(UI, Store, Agents) 간의 데이터 흐름이 매끄럽게 작동하는지 검증합니다.

## 2. 범위
- **사용자 흐름 (User Flows)**: 업로드 -> 편집 -> 내보내기.
- **에이전트 트리거**: 스토어 상태 변경 -> 에이전트 시각적 변화.
- **PDF 내보내기**: Canvas 데이터 -> jsPDF -> 파일 다운로드.

## 3. 테스트 시나리오

### 3.1 "업로드 흐름" (Upload Flow)
1. **사용자 액션**: `StudioLayout`에 PDF 파일 드롭.
2. **시스템**:
   - `handleFileUpload` 실행 -> `setIsUploading(true)`.
   - **통합 확인**: `DistributedAgents`가 `true` 수신 -> Developer 에이전트 `jump-spin` 시작.
   - `pdfUtils`가 PDF -> 이미지 변환.
   - 스토어 `pages` 업데이트.
   - `setIsUploading(false)`.
   - **통합 확인**: Developer 에이전트 애니메이션 중단.
   - UI에 페이지 썸네일 렌더링.

### 3.2 "내보내기 흐름" (Export Flow)
1. **사용자 액션**: "PDF 다운로드" 버튼 클릭.
2. **시스템**:
   - `triggerExport`로 스토어 업데이트.
   - `SlideEditor`가 트리거 감지 -> `setIsExporting(true)`.
   - **통합 확인**: `DistributedAgents`가 `true` 수신 -> Analyst 에이전트 `jump-spin` 시작.
   - PDF 생성 (jsPDF) 실행.
   - `setIsExporting(false)`.
   - **통합 확인**: Analyst 애니메이션 중단.
   - **통합 확인**: `AnalystReportModal` 자동 팝업 (신규 기능).

## 4. 도구 및 환경
- **환경**: 로컬 개발 (`npm run dev`) / 스테이징 (Vercel).
- **수동 검증**: 사용자 체크리스트 활용.
- **자동화**: Cypress / Playwright (향후 도입 예정).
