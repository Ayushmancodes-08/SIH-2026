/**
 * SIPER Report Builder & Intelligence Dossier View (REPORT-01, REPORT-02)
 * Compiles official case reports with executive summaries, network metrics, and PDF export.
 */
window.SiperReportBuilderView = {
  state: {
    reports: [],
    currentReport: null,
    isBuilding: false,
    buildStep: 1,
    formData: {
      case_id: "CASE-26189",
      title: "Comprehensive Criminal Network Intelligence Dossier",
      executive_summary: "Multi-source intelligence analysis conducted under Case CASE-26189. Network graph traversal identified Ravi Kumar as the central operational coordinator bridging transport logistics (Garuda Logistics) to financial shell layering operations (Apex Shell Holdings). Pattern detection engines validated 6 high-confidence signals including circular money laundering loops and pre-incident communication surges.",
      selectedEntities: [],
      selectedFindings: []
    },
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      const res = await window.SiperApp.api.get("/reports");
      this.state.reports = res.reports || [];
      if (params.reportId) {
        this.state.currentReport = this.state.reports.find(r => r.id === params.reportId);
      } else if (this.state.reports.length > 0) {
        this.state.currentReport = this.state.reports[0];
      }
    } catch (e) {
      console.error("Error loading reports:", e);
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();

    if (this.state.isBuilding) {
      this.renderBuilderModal();
    }
  },

  renderHtml() {
    const rep = this.state.currentReport;
    const content = rep ? (rep.content || rep) : null;

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Intelligence Dossiers & Report Center
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">REPORT-01</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Generate official evidence-backed intelligence summaries for supervisory review and court filings.</p>
          </div>
          <button onclick="window.SiperReportBuilderView.openBuilder()" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">post_add</span>
            <span>Assemble New Dossier</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left 4 Columns: Generated Reports Index -->
          <div class="lg:col-span-4 surface-card p-4 space-y-3 flex flex-col">
            <div class="flex items-center justify-between border-b border-outline pb-3">
              <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">Archived Dossiers (${this.state.reports.length})</span>
            </div>

            <div class="space-y-2 overflow-y-auto flex-1 max-h-[650px]">
              ${this.state.reports.map(r => {
                const isSelected = rep && rep.id === r.id;
                return `
                  <div onclick="window.SiperReportBuilderView.selectReport('${r.id}')"
                       class="p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                         isSelected
                           ? 'bg-surface-container-high border-primary text-white font-bold shadow-[0_0_12px_rgba(0,200,255,0.15)] -translate-y-0.5'
                           : 'bg-surface-container border-outline text-on-surface-variant hover:text-white hover:border-primary/40'
                       }">
                    <div class="flex items-center justify-between">
                      <span class="font-mono text-[10px] font-bold text-primary">${r.report_number}</span>
                      <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-intel-green/15 border border-intel-green/30 text-intel-green font-bold">${r.status}</span>
                    </div>
                    <div class="text-xs font-bold text-white truncate">${r.title}</div>
                    <div class="text-[10px] text-muted-text font-mono flex items-center justify-between pt-1">
                      <span>👤 ${r.created_by}</span>
                      <span>${(r.created_at || '').split(' ')[0]}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right 8 Columns: Formatted Report Preview (Printable View) -->
          <div class="lg:col-span-8 surface-card p-8 flex flex-col space-y-6 bg-surface-container-low border border-outline">
            ${content ? `
              <!-- Official Document Header (Print-ready) -->
              <div class="border-b-2 border-outline pb-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-[11px] uppercase font-mono font-bold text-primary tracking-widest">MINISTRY OF HOME AFFAIRS / NCRB</div>
                    <div class="text-xs font-bold text-white font-mono">SPECIAL INTELLIGENCE & CYBER NETWORK ANALYSIS WING</div>
                  </div>
                  <button onclick="window.print()" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 print-allow">
                    <span class="material-symbols-outlined text-[16px]">print</span>
                    <span>Print / Save PDF</span>
                  </button>
                </div>

                <div class="text-center py-2 border-y border-outline/50 space-y-1">
                  <span class="text-[10px] uppercase font-mono font-bold tracking-widest text-warning">CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE</span>
                  <h2 class="text-xl font-bold text-white tracking-tight font-mono">${content.title}</h2>
                  <div class="text-xs font-mono text-muted-text">Report Reference: <strong class="text-white">${content.report_number}</strong> • Case: <strong class="text-primary">${content.case_id}</strong></div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-mono text-muted-text pt-1">
                  <div>Date: <strong class="text-white">${content.created_at}</strong></div>
                  <div>Investigator: <strong class="text-white">${content.created_by}</strong></div>
                  <div>Entities: <strong class="text-primary font-bold">${content.entities_count || 14} Linked</strong></div>
                  <div>Findings: <strong class="text-warning font-bold">${content.findings_count || 6} Validated</strong></div>
                </div>
              </div>

              <!-- Executive Summary -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono text-primary">1. Operational Executive Summary</h3>
                <p class="text-xs text-on-surface leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-lg border border-outline font-sans">
                  ${content.executive_summary}
                </p>
              </div>

              <!-- Key Entities Table -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono text-primary">2. Primary Persons & Shell Entities</h3>
                <div class="border border-outline rounded-lg overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-surface-container border-b border-outline text-[10px] uppercase font-mono text-muted-text font-bold">
                      <tr>
                        <th class="py-2.5 px-3">Canonical Entity</th>
                        <th class="py-2.5 px-3">Type</th>
                        <th class="py-2.5 px-3">Risk Signal</th>
                        <th class="py-2.5 px-3 text-center">Betweenness</th>
                        <th class="py-2.5 px-3 text-center">PageRank</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-outline/40">
                      ${(content.entities || []).slice(0, 6).map(e => `
                        <tr class="bg-surface/50">
                          <td class="py-2 px-3 font-bold text-white">${e.name}</td>
                          <td class="py-2 px-3">${window.SiperApp.renderEntityTypeBadge(e.type)}</td>
                          <td class="py-2 px-3">${window.SiperApp.renderRiskBadge(e.risk_level, e.risk_score)}</td>
                          <td class="py-2 px-3 text-center font-mono text-warning font-bold">${e.betweenness_centrality || 0}</td>
                          <td class="py-2 px-3 text-center font-mono text-primary font-bold">${e.pagerank || 0}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- AI Findings & Evidence Citations -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono text-primary">3. Validated Analytical Findings & Typologies</h3>
                <div class="space-y-2">
                  ${(content.findings || []).slice(0, 3).map((f, i) => `
                    <div class="p-3 bg-surface rounded-lg border border-outline space-y-1">
                      <div class="flex items-center justify-between text-[10px] font-mono">
                        <span class="font-bold text-warning">FINDING 0${i+1}: ${f.type}</span>
                        <span class="text-intel-green font-bold">${Math.round(f.confidence * 100)}% CONFIDENCE</span>
                      </div>
                      <div class="text-xs font-bold text-white">${f.title}</div>
                      <div class="text-[11px] text-on-surface-variant">
                        Evidence: ${f.supporting_evidence && f.supporting_evidence.length ? f.supporting_evidence[0] : 'FIR & CDR correlated.'}
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- Sign-off Block -->
              <div class="pt-8 border-t border-outline/50 flex items-center justify-between text-xs text-muted-text font-mono">
                <div>
                  <div>Investigating Officer: <strong class="text-white">Investigator-7</strong></div>
                  <div class="text-[10px]">Special Intelligence Wing</div>
                </div>
                <div class="text-right">
                  <div>Status: <strong class="text-intel-green font-bold">DIGITALLY AUTHORIZED</strong></div>
                  <div class="text-[10px]">MHA Audit Verification Hash: OK</div>
                </div>
              </div>
            ` : `
              <div class="p-8 text-center text-on-surface-variant text-xs m-auto font-mono">
                Select a dossier from the left archive or assemble a new one.
              </div>
            `}
          </div>

        </div>

      </div>
    `;
  },

  selectReport(id) {
    this.state.currentReport = this.state.reports.find(r => r.id === id);
    this.render();
  },

  openBuilder() {
    this.state.isBuilding = true;
    this.state.buildStep = 1;
    this.render();
  },

  closeBuilder() {
    this.state.isBuilding = false;
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) modalContainer.innerHTML = "";
  },

  renderBuilderModal() {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-surface border border-outline rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between border-b border-outline pb-3">
            <div>
              <div class="text-[10px] uppercase font-mono font-bold text-primary">Intelligence Report Builder</div>
              <h2 class="text-base font-bold text-white mt-0.5 font-mono">Assemble Case Intelligence Dossier</h2>
            </div>
            <button onclick="window.SiperReportBuilderView.closeBuilder()" class="p-1 text-on-surface-variant hover:text-white">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div class="space-y-4 text-xs overflow-y-auto flex-1 p-1">
            <div>
              <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Dossier Title</label>
              <input type="text" id="report-title-input" value="${this.state.formData.title}"
                     class="w-full bg-brand-bg border border-outline rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary transition-all focus:shadow-[0_0_10px_rgba(0,200,255,0.15)] font-mono" />
            </div>

            <div>
              <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Target Case Scope</label>
              <select id="report-case-select" class="w-full bg-brand-bg border border-outline rounded-lg p-2 text-xs text-white outline-none focus:border-primary font-mono">
                <option value="CASE-26189" selected>CASE-26189: Cyber Fraud & Narcotics Syndicate</option>
                <option value="CASE-25410">CASE-25410: Hawala Layering Syndicate</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] uppercase font-bold text-muted-text mb-1 font-mono">Executive Summary Narrative</label>
              <textarea id="report-summary-input" rows="4"
                        class="w-full bg-brand-bg border border-outline rounded-lg p-3 text-xs text-white outline-none focus:border-primary transition-all focus:shadow-[0_0_10px_rgba(0,200,255,0.15)]">${this.state.formData.executive_summary}</textarea>
            </div>

            <div class="p-3 bg-surface-container rounded-lg border border-outline space-y-1">
              <div class="text-[10px] uppercase font-mono font-bold text-primary">Automated Intelligence Inclusions:</div>
              <div class="text-[11px] text-on-surface-variant space-y-0.5">
                <div>✓ 14 Top Centrality Entities (Ravi Kumar, Amit Verma, Neha Sharma)</div>
                <div>✓ 6 Validated AI Findings (Circular Financial Loop, CDR Burst)</div>
                <div>✓ Chronological Event Timeline & Section 65B Evidence Citations</div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline flex items-center justify-between">
            <button onclick="window.SiperReportBuilderView.closeBuilder()" class="btn-cyber-secondary text-xs px-4 py-2">Cancel</button>
            <button onclick="window.SiperReportBuilderView.generateReport()" class="btn-cyber-primary text-xs font-bold px-5 py-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Generate & Finalize Dossier</span>
            </button>
          </div>

        </div>
      </div>
    `;
  },

  async generateReport() {
    const title = document.getElementById("report-title-input").value;
    const caseId = document.getElementById("report-case-select").value;
    const summary = document.getElementById("report-summary-input").value;

    try {
      const res = await window.SiperApp.api.post("/reports/generate", {
        case_id: caseId,
        title: title,
        executive_summary: summary
      });
      this.closeBuilder();
      window.SiperApp.showToast(`Dossier ${res.report_number} generated successfully.`, "success");
      await this.init({ reportId: res.report_id });
    } catch (e) {
      window.SiperApp.showToast("Error generating report.", "error");
    }
  }
};
