# 🔗 Integration Test Plan

## 1. Objective
Verify that interacting modules work together seamlessly, specifically the data flow between UI, Store, and Agents.

## 2. Scope
- **User Flows**: Upload -> Edit -> Export.
- **Agent Triggers**: State change in Store -> Visual change in Agent.
- **PDF Export**: Canvas data -> jsPDF -> File Download.

## 3. Test Scenarios

### 3.1 The "Upload Flow"
1. **User Action**: Drops a PDF file into `StudioLayout`.
2. **System**:
   - `handleFileUpload` triggers `setIsUploading(true)`.
   - **Integration Check**: `DistributedAgents` receives `true` and Developer Agent starts `jump-spin`.
   - `pdfUtils` converts PDF -> Images.
   - Store updates `pages`.
   - `setIsUploading(false)`.
   - **Integration Check**: Developer Agent stops animation.
   - UI renders page thumbnails.

### 3.2 The "Export Flow"
1. **User Action**: Clicks "Download PDF".
2. **System**:
   - `triggerExport` updates store.
   - `SlideEditor` detects trigger, sets `setIsExporting(true)`.
   - **Integration Check**: `DistributedAgents` receives `true`, Analyst Agent starts `jump-spin`.
   - PDF Generation (jsPDF) executes.
   - `setIsExporting(false)`.
   - **Integration Check**: Analyst stops animation.
   - **Integration Check**: `AnalystReportModal` appears (New Feature).

## 4. Tools & Environment
- **Environment**: Local Dev (`npm run dev`) / Staging (Vercel).
- **Manual Verification**: User Checklist.
- **Automated**: Cypress / Playwright (Future Scope).
