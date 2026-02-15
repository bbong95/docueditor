import { describe, it, expect } from 'vitest';
import { OCRService } from '../ocrService';

describe('OCRService', () => {
    it('should be a singleton', () => {
        const instance1 = OCRService.getInstance();
        const instance2 = OCRService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should initially have no API key', () => {
        const service = OCRService.getInstance();
        service.clearApiKey();
        expect(service.hasApiKey()).toBe(false);
    });

    it('should store API key', () => {
        const service = OCRService.getInstance();
        service.setApiKey('test-api-key-1234567890');
        expect(service.hasApiKey()).toBe(true);
    });

    // 🔴 RED: Failing Test
    // 이 테스트는 아직 구현되지 않은(혹은 수정 필요한) 로직을 검증합니다.
    // 예: 빈 이미지 입력 시 적절한 에러 처리가 되는지 확인
    it('should throw error for empty image input', async () => {
        const service = OCRService.getInstance();
        await expect(service.recognizeWithBoxes('')).rejects.toThrow('Invalid image source');
    });
});
