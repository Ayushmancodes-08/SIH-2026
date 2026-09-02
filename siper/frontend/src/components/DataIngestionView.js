/**
 * SIPER Data Ingestion Center & AI Processing Pipeline View (ING-01 & ING-02)
 * Supports file uploading, sample dataset injection, and real-time 8-stage animated processing pipeline.
 */
window.SiperDataIngestionView = {
  state: {
    documents: [],
    isProcessing: false,
    currentStage: 0,
    processingResult: null,
    sampleCategory: "FIR",
    customText: "",
    loading: true
  },

  stages: [
    { id: 1, label: "Document Ingestion & Checksum", icon: "upload_file", desc: "Computing cryptographic SHA-256 hash for chain of custody" },
    { id: 2, label: "Structural Validation", icon: "verified", desc: "Validating file integrity and text encodings" },
    { id: 3, label: "Text Normalization", icon: "spellcheck", desc: "Phonetic cleansing of Indian names, phones & vehicle plates" },
    { id: 4, label: "Named Entity Extraction (NER)", icon: "psychology", desc: "Extracting persons, phones, locations, organizations, and amounts" },
    { id: 5, label: "Relationship Link Extraction", icon: "alt_route", desc: "Deriving multi-source interactions and co-occurrences" },
    { id: 6, label: "Entity Resolution & Deduplication", icon: "merge_type", desc: "Cross-referencing against existing suspect repository" },
    { id: 7, label: "Graph Topology Integration", icon: "hub", desc: "Updating NetworkX graph centrality and community metrics" },
    { id: 8, label: "Analytical Pattern Detection", icon: "insights", desc: "Scanning for communication bursts and financial cycles" }
  ],

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      const res = await window.SiperApp.api.get("/ingestion/documents");
      this.state.documents = res.documents || [];
    } catch (e) {
      console.error("Error loading documents:", e);
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();
  },

  renderHtml() {
    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Data Ingestion & AI Processing Center
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">ING-01 / ING-02</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Multi-source intelligence parser transforming raw police FIRs, CDR logs, and financial records into explainable graph networks.</p>
          </div>
        </div>

        ${this.state.isProcessing ? this.renderProcessingPipeline() : `
          <!-- Main Ingestion Workspace -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Left 7 Columns: Upload & Input Area -->
            <div class="lg:col-span-7 space-y-5">
              
              <!-- Quick Sample Preset Buttons -->
              <div class="surface-card p-4 space-y-2.5">
                <div class="text-[10px] uppercase font-mono font-bold text-muted-text">Load Synthetic Test Evidence (SIH PS 26189)</div>
                <div class="flex flex-wrap gap-2">
                  <button onclick="window.SiperDataIngestionView.loadSample('FIR_PARADIP')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-critical">local_police</span>
                    <span>FIR 105/2026 (Paradip Port)</span>
                  </button>
                  <button onclick="window.SiperDataIngestionView.loadSample('FIR_CYBER')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-primary">lock</span>
                    <span>FIR 042/2026 (Cyber Hub)</span>
                  </button>
                  <button onclick="window.SiperDataIngestionView.loadSample('CDR')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-sky-400">call</span>
                    <span>Telecom CDR Intercept Log</span>
                  </button>
                  <button onclick="window.SiperDataIngestionView.loadSample('FINANCIAL')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-warning">account_balance</span>
                    <span>Bank Statement (SBI/HDFC)</span>
                  </button>
                  <button onclick="window.SiperDataIngestionView.loadSample('SURVEILLANCE')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-intel-green">visibility</span>
                    <span>Tactical Surveillance Log</span>
                  </button>
                </div>
              </div>

              <!-- Document Input Form & Drag-and-Drop Area -->
              <div class="surface-card p-5 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Document Metadata & File Ingestion</h3>
                  <span class="text-[10px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/30">CASE-26189 SCOPE</span>
                </div>

                <!-- Drag & Drop Zone -->
                <div class="p-5 border-2 border-dashed border-outline hover:border-primary rounded-xl text-center bg-brand-bg cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,200,255,0.1)] relative group"
                     onclick="document.getElementById('file-upload-input').click()">
                  <input type="file" id="file-upload-input" class="hidden" onchange="window.SiperDataIngestionView.handleFileSelect(event)" />
                  <span class="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform block mb-1">upload_file</span>
                  <div class="text-xs font-bold text-white">Click or drag local file to auto-populate</div>
                  <div class="text-[10px] text-muted-text mt-0.5">Supports TXT, CSV, PDF transcripts, and JSON logs</div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Document Title / Reference</label>
                    <input type="text" id="doc-title-input" value="${this.state.docTitle || 'FIR_105_2026_Maritime_Consignment.txt'}" class="w-full bg-brand-bg border border-outline rounded-lg p-2 text-xs text-white outline-none focus:border-primary transition-all focus:shadow-[0_0_10px_rgba(0,200,255,0.15)] font-mono" />
                  </div>
                  <div>
                    <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Intelligence Category</label>
                    <select id="doc-category-select" class="w-full bg-brand-bg border border-outline rounded-lg p-2 text-xs text-white outline-none focus:border-primary font-mono">
                      <option value="FIR" ${this.state.docCategory === 'FIR' ? 'selected' : ''}>FIR / Police Report</option>
                      <option value="CDR" ${this.state.docCategory === 'CDR' ? 'selected' : ''}>CDR / Telecommunications Log</option>
                      <option value="Financial" ${this.state.docCategory === 'Financial' ? 'selected' : ''}>Financial Statement / Hawala Record</option>
                      <option value="Surveillance" ${this.state.docCategory === 'Surveillance' ? 'selected' : ''}>Physical Surveillance Log</option>
                      <option value="Intel" ${this.state.docCategory === 'Intel' ? 'selected' : ''}>Intelligence Briefing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Document Content / Text Extract</label>
                  <textarea id="doc-content-input" rows="8" placeholder="Paste police report text, CDR rows, or interrogation transcripts..."
                            class="w-full bg-brand-bg border border-outline rounded-lg p-3 text-xs text-white font-mono outline-none focus:border-primary transition-all focus:shadow-[0_0_10px_rgba(0,200,255,0.15)]">${this.state.customText || `FIRST INFORMATION REPORT
Police Station: Paradip Port PS. FIR No: 105/2026. Date: 28/08/2026.
Accused: Tariq Ahmed (Maritime Transporter), Vikram Malhotra (Syndicate Beneficiary), Amit Verma (Logistics Manager).
Acts: Customs Act Sec 132, NDPS Act Sec 23.
Summary: Intercepted freight container WB-01-EF-9988 at Paradip Port Terminal 2 falsely manifested under Garuda Logistics Pvt Ltd. Driver Suresh Jena contacted suspect Ravi Kumar (+91-9876543210) multiple times prior to clearance. Proceeds of ₹1,85,00,000 wired to SBI Account 38291049281.`}</textarea>
                </div>

                <button onclick="window.SiperDataIngestionView.startIngestionPipeline()"
                        class="w-full btn-cyber-primary text-xs font-bold py-3 px-4 flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Execute 8-Stage AI Extraction & Graph Ingestion Pipeline</span>
                </button>
              </div>
            </div>

            <!-- Right 5 Columns: Ingested Documents History -->
            <div class="lg:col-span-5 surface-card p-5 flex flex-col space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Ingested Repository</h3>
                <span class="text-[10px] font-mono text-intel-green font-bold">${this.state.documents.length} Records</span>
              </div>

              <div class="space-y-2.5 overflow-y-auto flex-1 max-h-[520px]">
                ${this.state.documents.map(d => `
                  <div class="p-3 rounded-lg bg-surface-container border border-outline hover:border-primary/40 transition-all space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-white text-xs">${d.title}</span>
                      <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">${d.file_type}</span>
                    </div>
                    <div class="text-[11px] text-on-surface-variant line-clamp-1">${d.raw_text || ''}</div>
                    <div class="pt-1.5 border-t border-outline/50 flex items-center justify-between text-[10px] font-mono text-muted-text">
                      <span>SHA: ${d.sha256_hash.substring(0, 10)}...</span>
                      <span class="text-intel-green font-bold">${d.extracted_entities_count} Entities Linked</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

          </div>
        `}

      </div>
    `;
  },

  renderProcessingPipeline() {
    return `
      <div class="surface-card p-8 space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-200">
        <div class="text-center space-y-1">
          <div class="text-[10px] font-mono uppercase font-bold text-primary tracking-wider">SIPER AI Processing Center</div>
          <h2 class="text-xl font-bold text-white font-mono">Extracting Multi-Source Intelligence</h2>
          <p class="text-xs text-on-surface-variant">Real-time execution of NLP extraction, entity resolution, and NetworkX graph analytics.</p>
        </div>

        <!-- 8-Stage Progress List -->
        <div class="space-y-3 pt-4">
          ${this.stages.map((st, idx) => {
            const isDone = this.state.currentStage > idx + 1;
            const isCurrent = this.state.currentStage === idx + 1;
            return `
              <div class="p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                isDone ? 'bg-surface-container border-intel-green/40 text-white shadow-[0_0_10px_rgba(0,229,160,0.1)]' :
                isCurrent ? 'bg-surface-container-high border-primary shadow-[0_0_15px_rgba(0,200,255,0.2)] text-white' :
                'bg-surface-container border-outline text-muted-text opacity-40'
              }">
                <div class="flex items-center gap-3.5">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDone ? 'bg-intel-green text-[#031018] font-bold shadow-[0_0_8px_#00E5A0]' :
                    isCurrent ? 'bg-primary text-[#031018] font-bold animate-spin shadow-[0_0_8px_#00C8FF]' :
                    'bg-surface-container-high text-muted-text'
                  }">
                    <span class="material-symbols-outlined text-[18px]">
                      ${isDone ? 'check' : isCurrent ? 'sync' : st.icon}
                    </span>
                  </div>
                  <div>
                    <div class="text-xs font-bold font-mono">${st.id}. ${st.label}</div>
                    <div class="text-[11px] ${isCurrent ? 'text-primary font-semibold' : 'text-on-surface-variant'}">${st.desc}</div>
                  </div>
                </div>
                <div class="text-[10px] font-mono font-semibold">
                  ${isDone ? '<span class="text-intel-green font-bold">COMPLETE</span>' : isCurrent ? '<span class="text-primary font-bold animate-pulse">PROCESSING...</span>' : 'PENDING'}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        ${this.state.processingResult ? `
          <div class="p-4 rounded-xl bg-surface-container border border-intel-green/40 space-y-3 animate-in fade-in duration-200">
            <div class="flex items-center justify-between text-intel-green font-bold text-xs font-mono">
              <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px]">check_circle</span> Ingestion & Analysis Successful</span>
              <span>SHA-256: ${this.state.processingResult.sha256_hash.substring(0, 16)}...</span>
            </div>
            <div class="text-xs text-white">
              Successfully extracted and integrated <strong class="text-primary font-mono">${this.state.processingResult.extracted_count} entities</strong> into Case PS-26189 network graph.
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button onclick="window.SiperDataIngestionView.resetIngestion()" class="btn-cyber-secondary text-xs font-semibold px-4 py-2">
                Ingest Another Document
              </button>
              <button onclick="window.SiperApp.navigate('graph')" class="btn-cyber-primary text-xs font-bold px-5 py-2">
                View Updated Graph Explorer →
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.state.docTitle = file.name;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') this.state.docCategory = 'CDR';
    else if (file.name.toLowerCase().includes('fir')) this.state.docCategory = 'FIR';
    else if (file.name.toLowerCase().includes('bank') || file.name.toLowerCase().includes('fiu')) this.state.docCategory = 'Financial';
    else this.state.docCategory = 'Intel';

    const reader = new FileReader();
    reader.onload = (event) => {
      this.state.customText = event.target.result;
      this.render();
      window.SiperApp.showToast(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Ready for AI processing.`, "success");
    };
    reader.readAsText(file);
  },

  loadSample(type) {
    if (type === 'FIR_PARADIP') {
      this.state.docTitle = "FIR_105_2026_Paradip_Port_Interception.txt";
      this.state.docCategory = "FIR";
      this.state.customText = `FIRST INFORMATION REPORT (Section 154 Cr.P.C.)
PS: Paradip Port Marine PS. FIR No: 105/2026. Date: 28/08/2026.
Accused: Tariq Ahmed (Maritime Freight Master), Vikram Malhotra (Consignment Beneficiary), Amit Verma (Logistics Manager).
Acts: Customs Act Sec 132, NDPS Act Sec 23.
Summary: Intercepted freight container WB-01-EF-9988 at Paradip Port Terminal 2 falsely manifested under Garuda Logistics Pvt Ltd. Driver Suresh Jena contacted suspect Ravi Kumar (+91-9876543210) multiple times prior to clearance. Proceeds of ₹1,85,00,000 wired to SBI Account 38291049281.`;
    } else if (type === 'FIR_CYBER') {
      this.state.docTitle = "FIR_042_2026_Cyber_Phishing_Syndicate.txt";
      this.state.docCategory = "FIR";
      this.state.customText = `FIRST INFORMATION REPORT (Section 66D IT Act)
PS: Cyber Crime Police Station, Bhubaneswar. FIR No: 042/2026. Date: 27/08/2026.
Accused: Neha Sharma (Managing Director, Apex Shell Holdings), Kabir Singhania (Hawala Broker).
Summary: Massive phishing attack targeting corporate treasury accounts. Stolen funds totaling ₹3,40,00,000 transferred via automated mule accounts into Shadow FinTech Corp before final conversion into maritime shipments.`;
    } else if (type === 'CDR') {
      this.state.docTitle = "CDR_Telecom_Surge_Cuttack_Kolkata.csv";
      this.state.docCategory = "CDR";
      this.state.customText = `TELECOM CDR LOG EXTRACT
MSISDN: +91-9876543210 (Ravi Kumar)
Target: +91-9876543211 (Amit Verma, 34 calls)
Target: +91-9876543213 (Vikram Malhotra, 14 calls)
Location: Sector 5 Industrial Area Cuttack Tower 4.
Timestamp Burst: 2026-08-28 22:00:00 to 2026-08-29 04:30:00
Triangulated Coordinates: 20.4820° N, 85.8830° E`;
    } else if (type === 'FINANCIAL') {
      this.state.docTitle = "Bank_Statement_Garuda_Apex_Layering.csv";
      this.state.docCategory = "Financial";
      this.state.customText = `BANK STATEMENT TRANSACTION RECORD
Account: Garuda Logistics Pvt Ltd (SBI A/C 38291049281)
Debit: ₹1,85,00,000 to Apex Shell Holdings (HDFC A/C 99182736451)
Credit: ₹1,75,00,000 from Shadow FinTech Corp (ICICI A/C 77665544332)
Typology: Circular layered structuring to disguise narcotics revenue origins.`;
    } else if (type === 'SURVEILLANCE') {
      this.state.docTitle = "Surveillance_Stakeout_Sector5_Warehouse.txt";
      this.state.docCategory = "Surveillance";
      this.state.customText = `TACTICAL SURVEILLANCE LOG (Confidential)
Location: Warehouse 4, Sector 5 Industrial Estate, Cuttack.
Date: 2026-08-29 01:15:00 IST.
Observation: Subject Ravi Kumar observed arriving in Black Scorpio OD-02-AB-1234. Met with Tariq Ahmed and driver Suresh Jena. Cargo pallets transferred into covered container WB-01-EF-9988 prior to departure towards NH-16.`;
    }
    this.render();
  },

  async startIngestionPipeline() {
    const title = document.getElementById("doc-title-input").value;
    const category = document.getElementById("doc-category-select").value;
    const content = document.getElementById("doc-content-input").value;

    this.state.isProcessing = true;
    this.state.currentStage = 1;
    this.state.processingResult = null;
    this.render();

    // Animate stages smoothly for demonstrability
    for (let i = 1; i <= 8; i++) {
      this.state.currentStage = i;
      this.render();
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const res = await window.SiperApp.api.post("/ingestion/upload", {
        filename: title,
        category: category,
        content: content
      });
      this.state.processingResult = res;
      this.state.currentStage = 9; // complete
      window.SiperApp.showToast("Intelligence document ingested and indexed into graph.", "success");
    } catch (e) {
      window.SiperApp.showToast("Ingestion error.", "error");
      this.state.isProcessing = false;
    }
    this.render();
  },

  resetIngestion() {
    this.state.isProcessing = false;
    this.state.currentStage = 0;
    this.state.processingResult = null;
    this.init();
  }
};
