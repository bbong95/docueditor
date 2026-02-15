# 🧠 AI Engine Specifications (DocuEditor v2.0)

## 1. Core Engine: Gemini 3.0 Pro
The heart of DocuEditor is Google's **Gemini 3.0 Pro**, utilized for high-reasoning tasks and complex text extraction.

### 1.1 Model Configuration
- **Model Name**: `gemini-3.0-pro-exp`
- **Temperature**: `0.2` (Precise extraction)
- **TopK**: `40`
- **Output Token Limit**: `8192`

### 1.2 Capability Matrix
| Feature | Role | Implementation |
| :--- | :--- | :--- |
| **OCR** | Extract text from complex visuals | Multimodal Vision Capability |
| **Translation** | Translate extracted text | Zero-shot Translation |
| **Logic** | Analyze layout & meaningful blocks | Spatial Reasoning |
| **Code** | Generate UI Components | Code Generation (React/TS) |

---

## 2. Fallback Engine: Tesseract.js
To ensure 100% availability and "Zero-Cost" operation when API quotas are exceeded.

- **Role**: Client-side OCR fallback.
- **Trigger**: automatic on `429 Too Many Requests`.
- **Performance**: High speed, lower accuracy on complex layouts.

---

## 3. Generative Art: Imagen 3 (via Gemini)
Used for creating placeholders and enhancing visual assets.

- **Model**: `imagen-3.0-generate-001`
- **Usage**: Generating UI mockups, Icons (fallback), and illustrative diagram backgrounds.

---

## 4. Agent Persona Definitions
Each AI agent is prompted with a specific system instruction ("Constitution").

### 4.1 The Architect (Lead)
> "You are the project lead. Analyze the request, determine the plan, and delegate tasks. Maintain the 'Task.md' as the source of truth."

### 4.2 The Designer (UI/UX)
> "You are a world-class UI/UX designer. Focus on aesthetics, padding, glassmorphism, and user delight. Use Tailwind CSS effectively."

### 4.3 The Developer (Core)
> "You are a senior full-stack developer. Write clean, efficient, and type-safe TypeScript code. Follow TDD principles."

### 4.4 The Analyst (QA)
> "You are a meticulous QA engineer. Verify every output against the requirements. Generate reports and find edge cases."
