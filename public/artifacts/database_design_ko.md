# 💾 데이터베이스 설계서 (Database Design / Schema)
**문서 번호:** DB-v49.0 | **작성일:** 2026-02-14 | **버전:** 1.0

## 1. 개요 (Overview)
**DocuEditor**는 **Client-Side Only** 애플리케이션으로, 전통적인 RDBMS(MySQL, Oracle)를 사용하지 않습니다. 대신 **Zustand Store**와 **IndexedDB/LocalStorage**를 활용한 인메모리 및 로컬 데이터 구조를 정의합니다.

## 2. 데이터 모델 (Data Model)

### 2.1 Editor State (Zustand Store)
애플리케이션의 핵심 런타임 상태를 관리하는 객체 구조입니다.

```typescript
interface EditorState {
  pages: Page[];          // 전체 페이지 목록
  boxes: TextBox[];       // 현재 페이지의 텍스트 박스 목록
  selectedBox: string | null; // 선택된 박스 ID
  history: HistoryAction[]; // 실행 취소/다시 실행을 위한 히스토리 스택
}
```

### 2.2 Entity 정의

#### **Page (페이지)**
| 필드명 | 타입 | 설명 | 비고 |
|:---|:---|:---|:---|
| `id` | `string` (UUID) | 페이지 고유 식별자 | PK 역할 |
| `image` | `string` (Base64/BlobUrl) | 원본 배경 이미지 데이터 | |
| `width` | `number` | 이미지 원본 너비 (px) | |
| `height` | `number` | 이미지 원본 높이 (px) | |
| `thumbnail` | `string` | 썸네일 이미지 데이터 | 최적화용 |

#### **TextBox (텍스트 박스)**
| 필드명 | 타입 | 설명 | 비고 |
|:---|:---|:---|:---|
| `id` | `string` (UUID) | 박스 고유 식별자 | PK 역할 |
| `pageId` | `string` | 소속 페이지 ID | FK 역할 |
| `text` | `string` | 사용자가 입력/수정한 텍스트 | |
| `x` | `number` | X 좌표 (Canvas 기준) | |
| `y` | `number` | Y 좌표 (Canvas 기준) | |
| `w` | `number` | 너비 | |
| `h` | `number` | 높이 | |
| `style` | `object` | 폰트, 색상, 크기, 정렬 등 스타일 정보 | JSON 구조 |

## 3. 영구 저장소 (Persistence)

### 3.1 LocalStorage 전략
*   **Key**: `docueditor_v1_snapshot`
*   **Value**: `EditorState` 전체를 JSON 직렬화하여 저장
*   **Trigger**: 사용자 작업(텍스트 변경, 페이지 이동) 발생 시 500ms 디바운스 후 자동 저장.

### 3.2 데이터 보안
*   모든 데이터는 사용자 브라우저 내에만 저장됩니다 (Sandbox).
*   민감한 정보(API Key 등)는 `sessionStorage`에 저장하여 브라우저 종료 시 파기되도록 설계되었습니다.

---
> [!IMPORTANT]
> 대용량 이미지 파일의 경우 LocalStorage 용량 제한(5MB)을 초과할 수으므로, 향후 **IndexedDB**로의 마이그레이션이 계획되어 있습니다.
