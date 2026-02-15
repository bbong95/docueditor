# 🏗️ Ultimate Antigravity Agent Architecture

사용자님의 비전과 보유한 모든 스킬셋을 분석하여 재설계된 **"최상의 에이전트 조합(Best Combination)"** 아키텍처입니다. 본 구조는 에이전트의 활동 영역을 **'개발 라이프사이클(The Factory)'**과 **'웹 실행 구조(The Runtime - 3D Office)'**로 명확히 이원화하였습니다.

---

## 🏭 Part 1. 개발 라이프사이클 (The Factory)
*소프트웨어를 생산하고 배포하는 공장(Factory) 역할의 에이전트 파이프라인입니다.*

### 1단계: 분석 (Analysis) 🧠
*사용자의 모호한 요구사항을 명확한 기술 명서(Spec)로 변환합니다.*
- **Lead Agent**: **Product Operations Lead** (Gemini 3 Pro)
- **Primary Skills**:
    - `business-analyst`: 비즈니스 요구사항 분석 및 KPI 정의.
    - `product-manager-toolkit`: PRD(Product Requirements Document) 작성 및 우선순위(RICE) 산정.
    - `market-sizing-analysis`: 시장 기회 및 규모 분석 (필요 시).

### 2단계: 설계 (Design) 📐
*분석된 명세서를 바탕으로 시스템 아키텍처와 UI/UX를 설계합니다.*
- **Lead Agent**: **Lead System Architect** (Codex 5.3) + **Experience Director** (Claude Sonnet 4.5)
- **Primary Skills**:
    - `senior-architect` & `c4-architecture`: C4 모델 기반 시스템 아키텍처 설계.
    - `ui-ux-pro-max`: 디자인 시스템(Tailwind, Shadcn) 기반의 고해상도 UI 설계.
    - `database-architect`: 데이터 모델링 및 스키마 설계.

### 3단계: 개발 (Development) 🔨
*설계도에 따라 실제 코드를 작성하고 기능을 구현합니다.*
- **Lead Agent**: **Global Master Orchestrator** (Codex 5.3)
- **Primary Skills**:
    - `senior-fullstack`: React 19, Node.js 기반의 풀스택 개발 주도.
    - `clean-code`: 유지보수 가능한 클린 코드 원칙 준수.
    - `tdd-orchestrator`: 테스트 주도 개발(TDD) 사이클 관리.
    - `react-modernization`: 최신 React 패턴(Hooks, Server Components) 적용.

### 4단계: 테스트 (Testing) 🧪
*구현된 기능이 의도대로 동작하는지 검증합니다.*
- **Lead Agent**: **Superior QA & Validator** (Gemini 3 Flash)
- **Primary Skills**:
    - `test-automator`: 단위/통합 테스트 자동 생성 및 실행.
    - `playwright-skill`: E2E(End-to-End) 브라우저 자동화 테스트.
    - `unit-testing-test-generate`: 엣지 케이스를 포함한 테스트 케이스 생성.

### 5단계: QA & 보안 (Quality Assurance) 🛡️
*제품의 품질과 보안 취약점을 최종 점검합니다.*
- **Lead Agent**: **Elite Security Officer** (Codex 5.3)
- **Primary Skills**:
    - `qa-agent`: 품질 보증 및 버그 추적.
    - `security-auditor`: 코드 보안 감사 및 취약점 분석.
    - `web-performance-optimization`: 성능 병목 구간 탐지 및 최적화.

### 6단계: 배포 (Deployment) 🚀
*검증된 코드를 프로덕션 환경에 배포하고 모니터링합니다.*
- **Lead Agent**: **Performance & Cost Optimizer** (Gemini 3 Flash)
- **Primary Skills**:
    - `cicd-automation`: GitHub Actions 등 CI/CD 파이프라인 자동화.
    - `vercel-deployment`: Vercel 배포 및 환경 설정 관리.
    - `observability-engineer`: 배포 후 모니터링 및 로깅 체계 구축.

---

## 🌐 Part 2. 웹 실행 구조 (The Runtime: 3D Agent Office)
*사용자가 웹상에서 상호작용하는 **'3D 오피스'** 런타임 환경입니다. 실제 에이전트들이 아바타로 시각화되어 상주합니다.*

### 🖥️ 3D Office Core Engine
- **Engine**: **React 19** + **Three.js** (`@react-three/fiber`)
- **Physics**: `use-cannon` (물리 엔진) + `framer-motion` (애니메이션)
- **Lead Agent**: **Experience Director** (Claude Sonnet 4.5 Fallback: Gemini 3 Pro)
- **Key Skill**: `3d-web-experience` - 3D 씬 구성, 카메라 워크, 조명 및 쉐이딩 처리.

### 🤖 Intelligent Avatars (Lego Agents)
*3D 오피스 내의 레고 아바타들은 단순한 모델링이 아닌, 실제 에이전트와 연동됩니다.*
1.  **Architect (Lead)**: 시스템 설계를 담당하는 아바타. (`AgentOffice3D.tsx` 내 'businessman' 타입)
2.  **Frontend (UI/UX)**: 디자인 및 퍼블리싱 담당. ('casual' 타입)
3.  **Engineer (Core)**: 백엔드 및 코어 로직 담당. ('spacesuit' 타입)
4.  **Analyst (Data)**: 데이터 분석 및 인사이트 제공. ('detective' 타입)

### 🧠 Runtime Intelligence
- **Orchestration**: `agent-orchestration` 스킬을 통해 3D 아바타들의 상태(Working, Thinking, Idle)를 실시간 에이전트 작업 상태와 동기화.
- **Interaction**: 사용자가 3D 오피스의 아바타를 클릭하면, 해당 역할의 에이전트와 대화하거나 작업을 지시하는 인터페이스(Chat Panel) 활성화.

---

## 📝 Summary
이 아키텍처는 **Code (Factory)**와 **Visual (Runtime/Office)**을 완벽하게 연결합니다. 
팩토리에서 생성된 결과물은 런타임인 3D 오피스에 즉시 반영되며, 3D 오피스에서의 사용자 상호작용은 다시 팩토리의 새로운 작업 트리거가 됩니다. 이는 **Gemini 3.0**과 **Codex 5.3**의 강력한 추론 능력을 바탕으로, **Zero-Cost** 정책 하에 운영되는 가장 효율적이고 진보된 에이전트 시스템입니다.
