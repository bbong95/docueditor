import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 📦 텍스트 박스 (TextBox)
 * 
 * OCR 분석 결과로 도출된 개별 텍스트 블록의 데이터 구조입니다.
 * 텍스트 내용뿐만 아니라, 화면상의 좌표(Geometry)와 스타일(Typography) 정보를 포함합니다.
 */
export interface TextBox {
    /** 고유 식별자 (UUID 또는 타임스탬프 기반) */
    id: string;
    /** 인식된 텍스트 내용 */
    text: string;
    /** 페이지 인덱스 (0부터 시작, 멀티 페이지 문서용) */
    pageIndex?: number;
    /** X 좌표 (Canvas 기준) */
    x: number;
    /** Y 좌표 (Canvas 기준) */
    y: number;
    /** 너비 */
    width: number;
    /** 높이 */
    height: number;
    /** 인식 신뢰도 (0~100) */
    confidence: number;
    /** AI에 의해 보정된 텍스트 (옵션) */
    corrected?: string;
    /** 사용자가 수정을 완료하여 캔버스에 적용된 상태 여부 */
    applied?: boolean;

    // --- Typography 속성 ---
    /** 폰트 크기 (px) */
    fontSize?: number;
    /** 폰트 패밀리 (예: 'Pretendard', 'Arial') */
    fontFamily?: string;
    /** 폰트 굵기 (예: 'bold', '700') */
    fontWeight?: string;
    /** 폰트 색상 (Hex 코드) */
    fontColor?: string;
    /** 배경 색상 (Hex 코드) */
    backgroundColor?: string;
    /** 텍스트 정렬 방식 */
    textAlign?: 'left' | 'center' | 'right';
    /** 수직 정렬 방식 */
    verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * 📊 OCR 분석 결과 (OCRResult)
 * 
 * 이미지 분석 후 반환되는 최종 결과 객체입니다.
 */
export interface OCRResult {
    /** 전체 합쳐진 텍스트 */
    text: string;
    /** 평균 신뢰도 */
    confidence: number;
    /** 개별 텍스트 박스 리스트 */
    boxes: TextBox[];
    /** 사용된 분석 엔진 방식 */
    method: 'hybrid-gemini' | 'gemini-native' | 'tesseract-fallback';
}

/**
 * 🧩 Tesseract 원시 데이터 (RawWord)
 * 
 * Tesseract.js 엔진이 반환하는 로우(Low-level) 데이터 형식입니다.
 * 내부적으로 1차 지오메트리 분석에 사용됩니다.
 */
interface RawWord {
    id: number;
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
}

/**
 * 🤖 Gemini 모델 체인 설정
 * 
 * 최신 모델부터 구버전 모델까지 순차적인 폴백(Fallback) 체인을 구성합니다.
 * 3.0 Pro를 우선 시도하고, 실패 시 하위 모델로 전환하여 가용성을 보장합니다.
 */
const GEMINI_MODELS = [
    { name: 'gemini-3.0-pro', apiVersion: 'v1beta' },
    { name: 'gemini-2.5-pro', apiVersion: 'v1beta' },
    { name: 'gemini-2.5-flash', apiVersion: 'v1beta' },
    { name: 'gemini-2.0-pro-exp-02-05', apiVersion: 'v1beta' },
    { name: 'gemini-1.5-pro', apiVersion: 'v1beta' },
];

/**
 * 🧠 OCR 서비스 (OCRService)
 * 
 * Tesseract.js(로컬)와 Google Gemini(클라우드)를 결합한 하이브리드 OCR 엔진입니다.
 * Singleton 패턴으로 구현되어 애플리케이션 전역에서 하나의 인스턴스만 유지됩니다.
 */
export class OCRService {
    private static instance: OCRService;
    private apiKey: string | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.apiKey = localStorage.getItem('gemini_api_key');
        }
    }

    /**
     * Singleton 인스턴스 반환
     */
    public static getInstance(): OCRService {
        if (!OCRService.instance) {
            OCRService.instance = new OCRService();
        }
        return OCRService.instance;
    }

    /**
     * Gemini API 키 설정 및 로컬 스토리지 저장
     * @param key 사용자 입력 API 키
     */
    public setApiKey(key: string): void {
        this.apiKey = key;
        if (typeof window !== 'undefined') {
            localStorage.setItem('gemini_api_key', key);
        }
        console.log('[OCR] Gemini API Key가 저장되었습니다.');
    }

    /**
     * API 키 제거 (로그아웃 시 사용)
     */
    public clearApiKey(): void {
        this.apiKey = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('gemini_api_key');
        }
        console.log('[OCR] Gemini API Key가 삭제되었습니다.');
    }

    public hasApiKey(): boolean {
        return !!this.apiKey && this.apiKey.length > 10;
    }

    /**
     * 🚀 하이브리드 OCR 분석 실행 (v6.1 Strategy)
     * 
     * 1. **Tesseract (v5)**: 1차적으로 이미지의 지오메트리(좌표, 텍스트 위치)를 빠르게 분석합니다.
     * 2. **Gemini Hybrid**: Tesseract의 좌표 정보와 원본 이미지를 함께 AI에 전달하여 텍스트를 보정하고 의미 단위로 그룹핑합니다.
     * 3. **Fallback**: AI 분석 실패 시 Tesseract 원시 결과를 반환하거나, Tesseract 실패 시 Native Gemini 분석을 시도합니다.
     * 
     * @param imageSource 분석할 이미지 URL 또는 파일 객체
     */
    public async recognizeWithBoxes(imageSource: string | File): Promise<OCRResult> {
        let imageUrl = typeof imageSource === 'string' ? imageSource : '';

        // 🛡️ [Validation] Check for empty input (TDD Green)
        if (typeof imageSource === 'string' && !imageSource.trim()) {
            throw new Error('Invalid image source');
        }

        if (imageSource instanceof File) {
            imageUrl = await this.fileToDataUrl(imageSource);
        }

        console.log('[OCR-v6.1] 분석 파이프라인 시작...');

        // 1. 지오메트리 추출 (Tesseract) - 기초 공사
        let rawWords: RawWord[] = [];
        try {
            rawWords = await this.runTesseractGeometry(imageUrl);
            console.log(`[OCR-v6.1] Tesseract가 ${rawWords.length}개의 텍스트 단위를 검출했습니다.`);
        } catch (e) {
            console.error('[OCR-v6.1] 치명적 오류: Tesseract 실행 실패.', e);
            // Tesseract 실패 시 즉시 Native AI로 전환
            if (this.hasApiKey()) {
                return await this.runGeminiNative(imageUrl);
            }
            throw e;
        }

        // 2. 의미론적 보정 (Hybrid Intelligence)
        if (this.hasApiKey()) {
            if (rawWords.length > 0) {
                try {
                    console.log('[OCR-v6.1] 하이브리드 인텔리전스로 업그레이드 중...');
                    return await this.runGeminiHybrid(imageUrl, rawWords);
                } catch (error) {
                    console.warn('[OCR-v6.1] 하이브리드 분석 실패, Native 모드로 전환합니다:', error);
                }
            } else {
                console.warn('[OCR-v6.1] Tesseract가 텍스트를 찾지 못했습니다. Native Gemini로 복구를 시도합니다...');
            }

            // Fallback: Gemini Native (Hybrid 실패 혹은 Tesseract 결과 없음)
            try {
                return await this.runGeminiNative(imageUrl);
            } catch (nativeError) {
                console.warn('[OCR-v6.1] Gemini Native 분석도 실패했습니다. Tesseract 원시 결과를 반환합니다.', nativeError);
            }
        }

        // 3. 최종 Fallback: Tesseract 원시 결과 반환
        return this.formatTesseractResult(rawWords);
    }

    // ── 엔진 1: Tesseract.js (지오메트리 분석) ──

    private async runTesseractGeometry(imageSource: string): Promise<RawWord[]> {
        // WASM 에러 방지를 위해 v5.1.0 Stable CDN 사용
        const workerOptions = {
            workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/worker.min.js',
            corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core.wasm.js',
            logger: (m: unknown) => {
                const message = m as { status: string; progress: number };
                if (message.status === 'recognizing text') console.log(`[Tesseract] 진행률: ${Math.round(message.progress * 100)}%`);
            }
        };

        // 25초 타임아웃 설정 (무한 로딩 방지)
        const workerPromise = createWorker('kor+eng', 1, workerOptions);
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Tesseract 초기화 시간 초과')), 25000)
        );

        const worker = await Promise.race([workerPromise, timeoutPromise]);

        try {
            // "blocks: true" 옵션은 상세한 단어 단위 좌표 추출에 필수적임
            const { data } = await worker.recognize(imageSource, { rotateAuto: true }, { blocks: true, text: true });
            await worker.terminate();

            const words: RawWord[] = [];
            let idCounter = 0;

            if (data.blocks) {
                data.blocks.forEach(block => {
                    block.paragraphs?.forEach(p => {
                        p.lines?.forEach(line => {
                            line.words?.forEach(w => {
                                const text = w.text.trim();
                                const width = w.bbox.x1 - w.bbox.x0;
                                const height = w.bbox.y1 - w.bbox.y0;
                                // 너무 작은 노이즈 제거 (4px 미만)
                                if (text.length > 0 && width > 4 && height > 4) {
                                    words.push({
                                        id: idCounter++,
                                        text: text,
                                        bbox: w.bbox,
                                        confidence: w.confidence
                                    });
                                }
                            });
                        });
                    });
                });
            }
            return words;
        } catch (e) {
            await worker.terminate();
            throw e;
        }
    }

    // ── 엔진 2: Gemini (상세 분석 및 스타일 추출) ──

    /**
     * 🎯 부분 영역 정밀 분석 (NotebookLM 스타일)
     * 
     * 사용자가 선택한 특정 영역(Snippet)을 고해상도로 분석하여,
     * 정확한 텍스트와 폰트 스타일(크기, 굵기, 색상)을 추정합니다.
     */
    public async recognizeSnippetWithStyle(snippetDataUrl: string): Promise<Partial<TextBox>> {
        console.log('[OCR-Snippet] 하이브리드 스타일 분석 시작...');

        // 1. 로컬 1차 추출 (비상용)
        let localText = "";
        try {
            const rawWords = await this.runTesseractGeometry(snippetDataUrl);
            localText = rawWords.map(w => w.text).join(' ');
            console.log(`[OCR-Snippet] Tesseract 예비 분석 결과: "${localText}"`);
        } catch (te) {
            console.warn('[OCR-Snippet] Tesseract 실패, 순수 AI 분석에 의존합니다:', te);
        }

        // API 키가 없으면 로컬 결과 즉시 반환
        if (!this.hasApiKey()) {
            return { text: localText || "인식 실패" };
        }

        const genAI = new GoogleGenerativeAI(this.apiKey!);

        const prompt = `
            Analyze this image snippet.
            1. Identify the EXACT Korean or English text. (Reference text: "${localText}")
            2. Estimate:
               - fontSize: Numeric pixels.
               - fontWeight: "thin", "normal", "medium", "bold", "extra-bold".
               - fontColor: CSS Hex.
               - backgroundColor: CSS Hex of background.
            
            Return ONLY valid JSON:
            {
                "text": "text",
                "fontSize": 24,
                "fontWeight": "bold",
                "fontColor": "#333333",
                "backgroundColor": "#F0F0F0"
            }
        `;

        // 모델 체인을 순회하며 시도
        for (const modelConfig of GEMINI_MODELS) {
            try {
                console.log(`[OCR-Snippet] ${modelConfig.name} 모델로 시도 중...`);
                const model = genAI.getGenerativeModel({ model: modelConfig.name }, { apiVersion: modelConfig.apiVersion });

                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data: snippetDataUrl.split(',')[1], mimeType: 'image/png' } }
                ]);
                const response = await result.response;
                const resText = response.text();

                const jsonMatch = resText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (error) {
                console.warn(`[OCR-Snippet] ${modelConfig.name} 분석 실패:`, error);
                // 실패 시 다음 모델로 폴백
            }
        }
        // 3. 최종 실패 시: 안전한 기본값 반환
        return {
            text: localText || "인식 불가",
            fontSize: 20,
            fontWeight: 'normal',
            fontColor: '#FFFFFF',
            backgroundColor: '#0B1120'
        };
    }

    private async runGeminiHybrid(imageUrl: string, rawWords: RawWord[]): Promise<OCRResult> {
        const genAI = new GoogleGenerativeAI(this.apiKey!);
        const { base64, mimeType } = await this.urlToBase64(imageUrl);

        // 컨텍스트 토큰 압축 (토큰 절약)
        const tokenList = rawWords.map(w =>
            `T${w.id}:"${w.text}"`
        ).join(' '); // 포맷: T0:"안녕" T1:"하세요"

        const hybridPrompt = `
You are the world's most advanced OCR Correction Engine (Hybrid Mode).
I will provide:
1. An IMAGE of a slide/document.
2. A list of NOISY text tokens extracted by Tesseract (Format: T{id}:"{text}").

YOUR MISSION:
1. Read the image to understand the *real* text and semantic grouping (sentences).
2. Map the real text back to the Tesseract token IDs.
3. Group tokens that belong to the same line/sentence.
4. Correct the text (e.g., "2zo" -> "2주", "bo-an" -> "보안").

INPUT TOKENS:
${tokenList.slice(0, 30000)}

OUTPUT FORMAT (JSON ONLY):
{
  "blocks": [
    { "text": "2주 완성! 보안 솔루션", "ids": [0, 1, 2, 4] },
    { "text": "전문가 로드맵", "ids": [5, 6] }
  ]
}
RULES:
- 'ids': Must match input "T{id}".
- 'text': The perfect Korean/English text visible in the image.
- Combine split words into natural phrases.
`;

        for (const { name, apiVersion } of GEMINI_MODELS) {
            try {
                console.log(`[Gemini-Hybrid] ${name} 모델로 분석 시도...`);
                const model = genAI.getGenerativeModel({ model: name }, { apiVersion });
                const result = await model.generateContent([
                    hybridPrompt,
                    { inlineData: { data: base64, mimeType } }
                ]);

                const responseText = result.response.text().replace(/```json|```/g, '').trim();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.blocks && parsed.blocks.length > 0) {
                        const finalBoxes: TextBox[] = [];

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        parsed.blocks.forEach((b: any, idx: number) => {
                            if (!b.ids || !Array.isArray(b.ids)) return;

                            // ID에 해당하는 원본 박스들을 찾음
                            const constituents = b.ids
                                .map((id: number) => rawWords.find(rw => rw.id === id))
                                .filter((w: RawWord | undefined): w is RawWord => !!w);

                            if (constituents.length === 0) return;

                            // 통합 박스(Union Box) 좌표 계산
                            const x0 = Math.min(...constituents.map((c: RawWord) => c.bbox.x0));
                            const y0 = Math.min(...constituents.map((c: RawWord) => c.bbox.y0));
                            const x1 = Math.max(...constituents.map((c: RawWord) => c.bbox.x1));
                            const y1 = Math.max(...constituents.map((c: RawWord) => c.bbox.y1));

                            finalBoxes.push({
                                id: `hybrid-${idx}`,
                                text: b.text,
                                x: x0,
                                y: y0,
                                width: x1 - x0,
                                height: y1 - y0,
                                confidence: 95
                            });
                        });

                        return {
                            text: finalBoxes.map(b => b.text).join(' '),
                            confidence: 95,
                            boxes: finalBoxes,
                            method: 'hybrid-gemini'
                        };
                    }
                }
            } catch (e) {
                console.warn(`[Gemini-Hybrid] ${name} 분석 실패:`, e);
            }
        }
        throw new Error('하이브리드 보정 실패');
    }

    // ── 엔진 3: Gemini Native (최후의 보루) ──

    private async runGeminiNative(imageUrl: string): Promise<OCRResult> {
        const genAI = new GoogleGenerativeAI(this.apiKey!);
        const { base64, mimeType } = await this.urlToBase64(imageUrl);
        const dims = await this.getImageDimensions(imageUrl);

        const nativePrompt = `
Extract ALL text. Use 0-10000 grid coordinates.
Output JSON: { "blocks": [{ "text": "...", "x": 0, "y": 0, "w": 0, "h": 0 }] }
`

        // 가장 성능 좋은(첫 번째) 모델로 시도
        try {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODELS[0].name }, { apiVersion: GEMINI_MODELS[0].apiVersion });
            const result = await model.generateContent([nativePrompt, { inlineData: { data: base64, mimeType } }]);
            const txt = result.response.text().replace(/```json|```/g, '').trim();
            const json = JSON.parse(txt.match(/\{[\s\S]*\}/)?.[0] || '{}');

            if (json.blocks) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const boxes = json.blocks.map((b: any, i: number) => ({
                    id: `native-${i}`,
                    text: b.text,
                    x: Math.round((b.x / 10000) * dims.width),
                    y: Math.round((b.y / 10000) * dims.height),
                    width: Math.round((b.w / 10000) * dims.width),
                    height: Math.round((b.h / 10000) * dims.height),
                    confidence: 85
                }));
                return { text: 'Native Fallback', confidence: 85, boxes, method: 'gemini-native' };
            }
        } catch (e) { console.error(e); }

        throw new Error('모든 OCR 엔진이 실패했습니다.');
    }

    private formatTesseractResult(rawWords: RawWord[]): OCRResult {
        return {
            text: rawWords.map(w => w.text).join(' '),
            confidence: 70,
            boxes: rawWords.map(w => ({
                id: `tess-${w.id}`,
                text: w.text,
                x: w.bbox.x0,
                y: w.bbox.y0,
                width: w.bbox.x1 - w.bbox.x0,
                height: w.bbox.y1 - w.bbox.y0,
                confidence: w.confidence
            })),
            method: 'tesseract-fallback'
        };
    }

    // ── 유틸리티 함수 ──

    private getImageDimensions(url: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error('이미지 크기 감지 실패'));
            img.src = url;
        });
    }

    private fileToDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private async urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
        if (url.startsWith('data:')) {
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) return { mimeType: match[1], base64: match[2] };
        }
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const res = reader.result as string;
                resolve({ base64: res.split(',')[1], mimeType: blob.type });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}
