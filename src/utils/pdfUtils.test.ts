import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertPdfToImage } from './pdfUtils';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => {
    return {
        getDocument: vi.fn(() => ({
            promise: Promise.resolve({
                numPages: 2,
                getPage: vi.fn(() => Promise.resolve({
                    getViewport: () => ({ width: 100, height: 100 }),
                    render: () => ({
                        promise: Promise.resolve()
                    })
                }))
            })
        })),
        GlobalWorkerOptions: {
            workerSrc: ''
        },
        version: '1.0.0'
    };
});

// Mock HTMLCanvasElement and its context
describe('pdfUtils', () => {
    beforeEach(() => {
        // Basic JSDOM setup for Canvas - normally provided by vitest-environment-jsdom
    });

    it('should convert a multi-page PDF into an array of image URLs', async () => {
        // Mock File object
        const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

        // Mock URL.createObjectURL
        const createObjectURL = vi.fn(() => 'blob:test-url');
        const revokeObjectURL = vi.fn();

        vi.stubGlobal('URL', {
            createObjectURL,
            revokeObjectURL
        });

        // Mock Canvas toDataURL
        const originalCreateElement = document.createElement;
        document.createElement = vi.fn((tagName) => {
            if (tagName === 'canvas') {
                return {
                    getContext: () => ({
                        renderItem: vi.fn()
                    }),
                    toBlob: (callback: BlobCallback) => callback(new Blob(['img'], { type: 'image/png' })),
                    width: 0,
                    height: 0,
                    toDataURL: () => 'data:image/png;base64,dummy'
                } as unknown as HTMLCanvasElement;
            }
            return originalCreateElement.call(document, tagName);
        });

        const result = await convertPdfToImage(mockFile);

        expect(result).toHaveLength(2); // From numPages: 2 mock
        expect(result[0]).toContain('blob:');
        expect(result[1]).toContain('blob:');

        // Cleanup
        document.createElement = originalCreateElement;
    });
});
