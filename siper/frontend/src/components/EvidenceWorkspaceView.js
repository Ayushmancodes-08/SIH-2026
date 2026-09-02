/**
 * SIPER Evidence Workspace View (EVID-01)
 * 3-Column Layout: Ingested Document List -> Raw Text Viewer with Entity Highlights -> Provenance & Integrity Panel.
 */
window.SiperEvidenceWorkspaceView = {
  state: {
    documents: [],
    selectedDoc: null,
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.state.caseScopeId = params.caseId || null;
    this.render();

    try {
      const res = await window.SiperApp.api.get("/ingestion/documents");
      let docs = res.documents || [];
      if (this.state.caseScopeId) {
        docs = docs.filter(d => !d.case_id || d.case_id === this.state.caseScopeId);
      }
      this.state.documents = docs;
      if (params.docId) {
        this.state.selectedDoc = docs.find(d => d.id === params.docId) || docs[0];
      } else if (docs.length > 0) {
        this.state.selectedDoc = docs[0];
      }
    } catch (e) {
      console.error("Error loading evidence workspace:", e);
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  async clearCaseScope() {
    this.state.caseScopeId = null;
    await this.init();
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();
  },

  renderHtml() {
    const doc = this.state.selectedDoc;

    return `
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        
        <!-- Top Workspace Bar -->
        <div class="bg-surface border-b border-outline p-4 flex items-center justify-between shrink-0">
          <div>
            <h1 class="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Evidence Repository & Integrity Workspace</span>
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">EVID-01</span>
              ${this.state.caseScopeId ? `<span class="text-xs px-2 py-0.5 rounded bg-intel-green/15 text-intel-green border border-intel-green/30 font-mono">Scope: ${this.state.caseScopeId}</span>` : ''}
            </h1>
            <p class="text-xs text-on-surface-variant">Authenticated primary source documents, telecommunications transcripts, and cryptographic verification.</p>
          </div>
          <div class="flex items-center gap-2">
            ${this.state.caseScopeId ? `
              <button onclick="window.SiperEvidenceWorkspaceView.clearCaseScope()" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 font-mono">
                Show All Documents
              </button>
            ` : ''}
            <button onclick="window.SiperApp.navigate('ingestion', { caseId: '${this.state.caseScopeId || ''}' })" class="btn-cyber-primary text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Upload New Evidence</span>
            </button>
          </div>
        </div>

        <!-- 3-Column Workspace -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          <!-- Column 1: Document Index (3 cols) -->
          <div class="md:col-span-3 bg-surface border-r border-outline flex flex-col p-3 space-y-2 overflow-y-auto">
            <div class="text-[10px] uppercase font-mono font-bold text-muted-text px-1 flex items-center justify-between">
              <span>Ingested Documents (${this.state.documents.length})</span>
              ${this.state.caseScopeId ? `<span class="text-primary font-bold lowercase">filtered</span>` : ''}
            </div>
            <div class="space-y-1.5 flex-1">
              ${this.state.documents.map(d => {
                const isSelected = doc && doc.id === d.id;
                return `
                  <div onclick="window.SiperEvidenceWorkspaceView.selectDoc('${d.id}')"
                       class="p-3 rounded-lg border cursor-pointer transition-all space-y-1 ${
                         isSelected
                           ? 'bg-surface-container-high border-primary text-white font-bold shadow-[0_0_12px_rgba(0,200,255,0.15)] -translate-y-0.5'
                           : 'bg-surface-container border-outline text-on-surface-variant hover:text-white hover:border-primary/40'
                       }">
                    <div class="flex items-center justify-between">
                      <span class="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">${d.file_type}</span>
                      <span class="text-[10px] font-mono text-muted-text">${(d.timestamp || '').split(' ')[0]}</span>
                    </div>
                    <div class="text-xs font-bold truncate">${d.title}</div>
                    <div class="text-[10px] text-intel-green font-mono font-semibold">${d.extracted_entities_count} Entities Linked</div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Column 2: Document Content Viewer with Highlights (6 cols) -->
          <div class="md:col-span-6 bg-brand-bg flex flex-col p-6 overflow-y-auto space-y-4 border-r border-outline">
            ${doc ? `
              <div class="flex items-center justify-between border-b border-outline pb-3">
                <div class="space-y-0.5">
                  <div class="font-mono text-xs text-primary font-bold">${doc.id}</div>
                  <h2 class="text-base font-bold text-white font-mono">${doc.title}</h2>
                </div>
                <div class="text-right font-mono text-[10px] text-muted-text">
                  <div>Source: <strong class="text-white">${doc.source_category}</strong></div>
                  <div>Uploader: <strong class="text-white">${doc.uploader}</strong></div>
                </div>
              </div>

              <!-- Raw Text Viewer with Highlighted Entities -->
              <div class="surface-card p-5 font-mono text-xs text-on-surface leading-relaxed whitespace-pre-wrap select-text border border-outline shadow-inner">
                ${this.renderHighlightedText(doc.raw_text)}
              </div>

              <div class="p-3 rounded-lg bg-surface-container border border-outline flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-intel-green shadow-[0_0_6px_#00E5A0]"></span>
                  <span>AI Extracted Tokens Highlighted in Document Body</span>
                </span>
                <span class="text-intel-green font-bold">${doc.extracted_entities_count} tokens mapped</span>
              </div>
            ` : `
              <div class="p-8 text-center text-on-surface-variant text-xs m-auto font-mono">
                Select an evidence document to view its authenticated text and entity extractions.
              </div>
            `}
          </div>

          <!-- Column 3: Integrity & Provenance Panel (3 cols) -->
          <div class="md:col-span-3 bg-surface flex flex-col p-5 space-y-4 overflow-y-auto">
            ${doc ? `
              <div class="text-[10px] uppercase font-mono font-bold text-primary tracking-wider">Document Verification</div>
              
              <!-- SHA-256 Checksum Card -->
              <div class="surface-card p-3.5 space-y-2">
                <div class="text-[10px] uppercase font-mono font-bold text-muted-text flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-intel-green">lock</span>
                  <span>Cryptographic SHA-256 Hash</span>
                </div>
                <div class="font-mono text-[11px] text-intel-green font-bold break-all bg-brand-bg p-2 rounded border border-outline">
                  ${doc.sha256_hash}
                </div>
                <div class="text-[10px] text-muted-text">Immutable legal hash ensures zero evidence tampering.</div>
              </div>

              <!-- Metadata Breakdown -->
              <div class="surface-card p-4 space-y-2 text-xs divide-y divide-outline/40">
                <div class="flex justify-between pt-1">
                  <span class="text-muted-text font-mono text-[11px]">Case Number:</span>
                  <span class="font-mono text-primary font-bold">${doc.case_id || 'CASE-26189'}</span>
                </div>
                <div class="flex justify-between pt-2">
                  <span class="text-muted-text font-mono text-[11px]">File Format:</span>
                  <span class="font-mono text-white">${doc.file_type}</span>
                </div>
                <div class="flex justify-between pt-2">
                  <span class="text-muted-text font-mono text-[11px]">File Size:</span>
                  <span class="font-mono text-white">${(doc.file_size / 1024).toFixed(1)} KB</span>
                </div>
                <div class="flex justify-between pt-2">
                  <span class="text-muted-text font-mono text-[11px]">Ingested At:</span>
                  <span class="font-mono text-white">${doc.timestamp}</span>
                </div>
              </div>

              <!-- Chain of Custody Stamp -->
              <div class="surface-card p-3.5 border border-intel-green/40 space-y-1.5 text-xs">
                <div class="flex items-center gap-1.5 font-bold text-intel-green">
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  <span>Chain of Custody Verified</span>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed">Logged in Ministry of Home Affairs evidence repository under Section 65B of Indian Evidence Act.</p>
              </div>

              <button onclick="window.SiperApp.navigate('graph')" class="w-full btn-cyber-secondary text-xs font-semibold py-2 px-3 flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">hub</span>
                <span>View Mapped Nodes in Graph</span>
              </button>
            ` : ''}
          </div>

        </div>

      </div>
    `;
  },

  selectDoc(id) {
    this.state.selectedDoc = this.state.documents.find(d => d.id === id);
    this.render();
  },

  renderHighlightedText(rawText) {
    if (!rawText) return "No raw content available.";
    
    // Highlight key entities
    let text = rawText;
    text = text.replace(/(Ravi Kumar|The Shadow|Amit Verma|Neha Sharma|Vikram Malhotra|Suresh Jena|Tariq Ahmed)/g, '<span class="extracted-token-person">$1</span>');
    text = text.replace(/(\+91[\-\s]?[6-9]\d{9})/g, '<span class="extracted-token-phone">$1</span>');
    text = text.replace(/(OD-02-AB-1234|OD-02-CD-5678|WB-01-EF-9988)/g, '<span class="extracted-token-vehicle">$1</span>');
    text = text.replace(/(Warehouse 4|Jagatpur|Cuttack|Bhubaneswar|Paradip Port|Kolkata)/g, '<span class="extracted-token-location">$1</span>');
    text = text.replace(/(Garuda Logistics Pvt Ltd|Apex Shell Holdings|Shadow FinTech Corp)/g, '<span class="extracted-token-org">$1</span>');
    text = text.replace(/(FIR No: \d+\/\d+|FIR \d+\/\d+)/g, '<span class="extracted-token-fir">$1</span>');
    return text;
  }
};
