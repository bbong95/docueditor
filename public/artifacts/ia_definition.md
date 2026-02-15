# 🏗️ Information Architecture (IA) Definition

## 1. Site Structure (Sitemap)

### 1.1 Root (`/`)
- **Landing State**: Empty State with "Drag & Drop" zone.
- **Active State**: The Studio Interface.

### 1.2 The Studio
- **Header (`StudioHeader`)**
  - Brand Logo
  - **Agent Zone**: 4 Distributed Agents
  - **Action Toolbar**: Upload, Clear, Save, Download
- **Left Sidebar (`SidebarNav`)**
  - **Navigation**: Pages, History, Settings
  - **Panels**:
    - `PageThumbnailPanel`: Multi-page navigation.
    - `HistoryPanel`: Undo/Redo log.
- **Center Stage (`Canvas`)**
  - Pan/Zoom Viewport
  - **Text Layers**: Editable text boxes overlaid on image.
  - **Selection HUD**: Context menu for selected items.
- **Right Sidebar (`PropertiesPanel`)**
  - **Text Properties**: Font, Size, Color, Align.
  - **Layout Properties**: Position (X/Y), Size (W/H).
- **Overlays**
  - **AnalystReportModal**: Quality assurance summary.
  - **OnboardingTour**: Guide for new users.

---

## 2. Data Model (State Architecture)
Managed via `zustand` (`useEditorStore`).

### 2.1 EditorState
```typescript
interface EditorState {
  // Content
  pages: string[];        // Array of blob URLs
  boxes: TextBox[];       // Flat array of all text boxes
  
  // Selection / Interaction
  selectedBox: TextBox | null;
  activePageIndex: number;
  zoomLevel: number;
  
  // System State
  isUploading: boolean;   // Triggers Developer
  isExporting: boolean;   // Triggers Analyst
  isHistoryOpen: boolean;
}
```

### 2.2 TextBox Entity
```typescript
interface TextBox {
  id: string;
  pageIndex: number;      // Belongs to which page?
  text: string;
  x: number; y: number;
  width: number; height: number;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    ...
  }
}
```
