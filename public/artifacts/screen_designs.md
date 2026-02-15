# 📱 Screen Design Specifications (DocuEditor v2.0)

> [!NOTE]
> This document defines the high-fidelity UI/UX specifications for the DocuEditor platform, focusing on the new "Distributed Agent" layout and the "Analyst Quality Report" dashboard.

## 1. Global Layout (The Stage)
The application adopts a **"Cinema Stage"** layout where the content is the protagonist and agents are the supporting cast.

### 1.1 Header Area (The Agent Loft)
- **Height**: `68px`
- **Background**: Glassmorphism (`bg-white/80`, `backdrop-blur-md`)
- **Logo**: Left-aligned, `240px` width reserved.
- **Agent Squad**:
  - **Position**: Absolute `top: 4px`.
  - **Arrangement**: Left-aligned cluster starting at `500px` (Right of Logo space).
  - **Members**:
    1. **[Architect]** (`left: 500px`): The Leader. Always active (`jump-spin`).
    2. **[Designer]** (`left: 600px`): The Artist. Active on `isDesigning`.
    3. **[Developer]** (`left: 700px`): The Builder. Active on `isUploading`.
    4. **[Analyst]** (`left: 800px`): The Inspector. Active on `isExporting`.
- **Action Area**: Right-aligned. "Upload", "Save Image", "Download PDF" buttons.

### 1.2 Main Workspace (The Canvas)
- **Padding**: `40px` (Generous breathing room).
- **Background**: Warm Paper Texture (`#F9F9F7` / `hsla(var(--color-bg-base), 0.5)`).
- **Shadows**: Soft, diffused shadows (`0 20px 40px -12px rgba(0,0,0,0.1)`).
- **Page Layout**: Vertical column flow for multi-page documents.

---

## 2. Analyst's Quality Report (The Dashboard)
A modal dashboard that appears upon specific triggers to showcase project statistics and quality metrics.

### 2.1 Trigger Mechanics
- **Automatic**: Immediately after "PDF Download" completes (Analyst finishes `jump-spin`).
- **Manual**: Clicking the **[Analyst]** agent in the header.

### 2.2 UI Structure (Modal)
- **Dimensions**: `800px x 600px` (Fixed Centered).
- **Header**:
  - **Title**: "Quality Inspection Report"
  - **Inspector**: Agent Analyst Avatar + "Verified by QA" badge.
- **Body (Grid Layout)**:
  - **Block A (Summary)**: "Success! 12 Pages Processed."
  - **Block B (Changes)**:
    - Detected Text Boxes: **42**
    - User Edits: **15**
    - Style Matches: **98%**
  - **Block C (Sanity Check)**:
    - [x] Font Compatibility (Paperlogy)
    - [x] Layout Integrity
    - [x] Image Resolution (High-Res)
- **Footer**:
  - **Primary Action**: "Download Certified PDF" (Large Blue Button).
  - **Secondary**: "View Detailed Log".

---

## 3. Micro-Interactions
- **Agent Hover**: Scale up `1.1x` with bouncing effect.
- **Text Box Focus**:
  - Border becomes `2px solid Primary`.
  - Background tint appears.
  - "Pop" animation on selection.
- **Toast Notifications**:
  - Bottom-right stacking.
  - Minimalist design with Lucide icons.

## 4. Color Palette (Semantic)
| Role | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Indigo | `#3b82f6` | Architect, Primary Buttons, Active States |
| **Secondary** | Pink | `#ec4899` | Designer, Selection Highlights |
| **Tertiary** | Orange | `#f97316` | Developer, Warnings, System Alerts |
| **Quaternary** | Violet | `#8b5cf6` | Analyst, Success States, Reports |
| **Base** | Paper | `#F9F9F7` | Canvas Background |
| **Surface** | White | `#FFFFFF` | Panels, Cards, Modals |

---

*Verified by Agent Designer* 🎨
