# 🛠️ 시스템 운영 매뉴얼 (Operations Manual)
**문서 번호:** OPS-v49.0 | **작성일:** 2026-02-14 | **버전:** 1.0

## 1. 시스템 구성 (System Configuration)

### 1.1 하드웨어 및 소프트웨어 요구사항
*   **Client PC**:
    *   CPU: Core i3 이상 (권장 i5 이상)
    *   RAM: 4GB 이상 (권장 8GB 이상, Tesseract OCR 메모리 사용량 고려)
    *   Browser: Chrome 90+, Edge 90+, Safari 14+
*   **Hosting Server**:
    *   Type: Static Web Hosting (Vercel, Netlify, AWS S3+CloudFront)
    *   Runtime: Node.js 불필요 (빌드 결과물만 배포)

## 2. 배포 절차 (Deployment Process)

### 2.1 빌드 (Build)
프로덕션 환경 배포를 위한 정적 파일을 생성합니다.
```bash
# 의존성 설치
npm install

# 프로덕션 빌드 (Type Check 포함)
npm run build
# 결과물: /dist 디렉토리에 생성됨
```

### 2.2 배포 (Deploy)
Vercel을 사용한 자동 배포 예시입니다.
1.  GitHub Repository에 코드를 Push합니다 (`main` branch).
2.  Vercel Dashboard에서 프로젝트를 Import합니다.
3.  Build Command를 `npm run build`로, Output Directory를 `dist`로 설정합니다.
4.  Deploy 버튼을 클릭합니다.

## 3. 모니터링 및 장애 대응 (Monitoring & Troubleshooting)

### 3.1 주요 에러 및 조치 가이드

| 에러 메시지 | 원인 | 조치 방법 |
|:---|:---|:---|
| **"Memory Access Out of Bounds"** | Tesseract.js가 대용량 이미지 처리 중 메모리 초과 발생 | 브라우저 캐시 삭제 후 재시도, 저해상도 이미지 사용 권장 |
| **"API Key Invalid"** | Gemini API Key가 만료되었거나 잘못 입력됨 | Google AI Studio에서 새 Key 발급 후 로그인 화면 재입력 |
| **"Export Failed"** | PPTX 생성 중 폰트 리소스 로드 실패 | 네트워크 연결 확인 및 기본 폰트(Arial) 사용 옵션 선택 |

### 3.2 백업 정책
본 시스템은 **Stateless Client** 구조이므로 서버 측 DB 백업이 불필요합니다. 단, 사용자에게 **"작업 중 JSON 내보내기"** 기능을 통해 로컬 백업을 주기적으로 수행하도록 안내합니다.

---
> [!TIP]
> 새로운 버전 배포 시, 사용자 브라우저의 캐시 문제로 구버전이 로드될 수 있습니다. `Cache-Control: no-cache` 헤더 설정 또는 파일명 해싱(Vite 기본값)을 확인하세요.
