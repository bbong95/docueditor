import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - handling Vite/Webpack environments
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const convertPdfToImage = async (file: File, onProgress?: (progress: number) => void): Promise<string[]> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (pdf.numPages === 0) {
            throw new Error('PDF has no pages');
        }

        const imageUrls: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better quality

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas context not available');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas
            }).promise;

            const blobUrl = await new Promise<string>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error(`Canvas to Blob failed for page ${i}`));
                    }
                }, 'image/png');
            });

            imageUrls.push(blobUrl);

            // Update progress
            if (onProgress) {
                const percent = Math.round((i / pdf.numPages) * 100);
                onProgress(percent);
            }
        }

        return imageUrls;
    } catch (error) {
        console.error('PDF to Image conversion failed:', error);
        throw error;
    }
};
