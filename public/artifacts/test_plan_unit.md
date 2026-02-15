# 🧪 Unit Test Plan

## 1. Objective
Ensure individual components and utility functions operate correctly in isolation, verifying logic, state updates, and rendering behavior.

## 2. Scope
- **Utils**: `pdfUtils`, `colorUtils`, `mathUtils`.
- **Services**: `OCRService` (mocked).
- **Store**: `useEditorStore` (state transitions).
- **Components**: `DistributedAgents`, `SlideEditor` (rendering only).

## 3. Test Cases

### 3.1 Utils Testing
| Module | Test Case | Input | Expected Output |
| :--- | :--- | :--- | :--- |
| `pdfUtils` | `convertPdfToImage` | Valid PDF File | Array of Blob URLs |
| `pdfUtils` | `convertPdfToImage` | Invalid File | Error / Empty Array |
| `colorUtils` | `hexToRgb` | `#FFFFFF` | `{r:255, g:255, b:255}` |

### 3.2 Store Testing (`useEditorStore`)
| Action | Test Scenario | Initial State | Result State |
| :--- | :--- | :--- | :--- |
| `setPages` | Add new pages | `pages: []` | `pages: ['url1', 'url2']` |
| `updateBox` | Edit text content | `box[0].text: 'A'` | `box[0].text: 'B'` |
| `setIsExporting` | Trigger export | `isExporting: false` | `isExporting: true` |

### 3.3 Component Testing (Vitest + RTL)
- **`DistributedAgents`**: 
  - Verify 4 anchors are rendered.
  - Verify canvas is present.
  - Check `isArchitectWorking` prop logic.
- **`SlideEditor`**:
  - Verify `ConfigurableCanvas` renders for each page.
  - Verify text boxes appear at correct coordinates.

## 4. Tools
- **Framework**: Vitest
- **Library**: React Testing Library
- **Mocking**: `vi.fn()`, `vi.mock()` for `ocrService`.
