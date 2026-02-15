# 🔌 인터페이스 정의서 (API Specification)
**문서 번호:** API-v49.0 | **작성일:** 2026-02-14 | **버전:** 1.0

## 1. 개요 (Overview)
**DocuEditor**가 외부 서비스와 통신하거나 내부 모듈 간 데이터를 교환하기 위한 인터페이스 명세입니다. 주요 외부 인터페이스로는 **OCR 엔진**과 **AI 모델(Gemini)**이 있습니다.

## 2. 외부 인터페이스 (External APIs)

### 2.1 OCR Service (Tesseract.js)
이미지에서 텍스트를 추출하기 위한 비동기 워커 인터페이스입니다.

*   **Endpoint**: `Client-Side Worker`
*   **Method**: `recognize()`
*   **Input**:
    ```json
    {
      "image": "Blob | File",
      "lang": "kor+eng"
    }
    ```
*   **Output**:
    ```json
    {
      "data": {
        "text": "추출된 전체 텍스트",
        "lines": [
          { "text": "라인별 텍스트", "bbox": { "x0": 10, "y0": 10, "x1": 100, "y1": 20 } }
        ]
      }
    }
    ```

### 2.2 AI Assistance (Gemini API)
텍스트 스타일 보정 및 번역을 위한 Google Gemini API 인터페이스입니다.

*   **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
*   **Method**: `POST`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `x-goog-api-key`: `{{USER_API_KEY}}`
*   **Request Body**:
    ```json
    {
      "contents": [{
        "parts": [{ "text": "다음 텍스트의 폰트 스타일을 CSS 포맷으로 추정해줘: '안녕하세요'" }]
      }]
    }
    ```
*   **Response**:
    ```json
    {
      "candidates": [{
        "content": {
          "parts": [{ "text": "{\"fontFamily\": \"Pretendard\", \"fontWeight\": \"700\"}" }]
        }
      }]
    }
    ```

## 3. 내부 모듈 인터페이스 (Internal APIs)

### 3.1 PPTGen Bridge
PPTX 생성을 담당하는 `pptxgenjs` 래퍼 함수입니다.

*   **Function**: `exportToPPTX(pages: Page[])`
*   **Process**:
    1.  Master Slide 설정 (16:9)
    2.  배경 이미지 삽입
    3.  TextBox 요소를 Shape 객체로 변환하여 배치
    4.  Blob 생성 및 다운로드 트리거

### 3.2 PDF Renderer
PDF 파일을 캔버스 이미지로 변환하는 유틸리티입니다.

*   **Function**: `renderPdfPage(pdfData, pageNumber)`
*   **Return**: `Promise<HTMLCanvasElement>`

---
> [!WARNING]
> Gemini API 호출 시 **API Key**가 노출되지 않도록 Client-Side Proxy 또는 환경 변수 설정을 엄격히 관리해야 합니다. 현재 버전에서는 사용자 입력을 통해 세션 메모리에만 저장합니다.
