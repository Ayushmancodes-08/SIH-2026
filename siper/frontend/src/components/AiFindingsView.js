/**
 * SIPER AI Findings & Pattern Detection View (FIND-01)
 * Highlights explainable risk signals: Circular Financial Cycles, Communication Bursts, and Bridge Intermediaries.
 */
window.SiperAiFindingsView = {
  state: {
    findings: [],
    selectedFinding: null,
    statusFilter: "ALL",
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      const res = await window.SiperApp.api.get("/findings");
      this.state.findings = res.findings || [];
      if (params.findingId) {
        this.state.selectedFinding = this.state.findings.find(f => f.id === params.findingId);
      } else if (this.state.findings.length > 0) {
        this.state.selectedFinding = this.state.findings[0];
      }
    } catch (e) {
      console.error("Error loading findings:", e);
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
    const filtered = this.state.findings.filter(f => {
      return this.state.statusFilter === "ALL" || f.status === this.state.statusFilter;
    });

    const selected = this.state.selectedFinding;

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              AI Analytical Findings & Risk Signals
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">FIND-01</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Algorithmic pattern recognition surfacing communication bursts, circular financial flows, and structural bridge nodes.</p>
          </div>
          <button onclick="window.SiperAiFindingsView.rerunDetection()" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">psychology</span>
            <span>Re-run Graph Analytics Pipeline</span>
          </button>
        </div>

        <!-- Main 2-Column Split: Findings List (5 cols) & Finding Detail (7 cols) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left 5 Columns: Findings Feed -->
          <div class="lg:col-span-5 surface-card p-4 flex flex-col space-y-3">
            <div class="flex items-center justify-between border-b border-outline pb-3">
              <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">Detected Signals (${filtered.length})</span>
              <div class="flex items-center gap-1 text-[11px]">
                <button onclick="window.SiperAiFindingsView.filterStatus('ALL')" class="px-2.5 py-1 rounded-md font-mono text-xs transition-all ${this.state.statusFilter === 'ALL' ? 'bg-primary text-[#031018] font-bold shadow-[0_0_8px_rgba(0,200,255,0.3)]' : 'text-on-surface-variant hover:text-white'}">All</button>
                <button onclick="window.SiperAiFindingsView.filterStatus('NEW')" class="px-2.5 py-1 rounded-md font-mono text-xs transition-all ${this.state.statusFilter === 'NEW' ? 'bg-primary text-[#031018] font-bold shadow-[0_0_8px_rgba(0,200,255,0.3)]' : 'text-on-surface-variant hover:text-white'}">New</button>
                <button onclick="window.SiperAiFindingsView.filterStatus('VERIFIED')" class="px-2.5 py-1 rounded-md font-mono text-xs transition-all ${this.state.statusFilter === 'VERIFIED' ? 'bg-primary text-[#031018] font-bold shadow-[0_0_8px_rgba(0,200,255,0.3)]' : 'text-on-surface-variant hover:text-white'}">Verified</button>
              </div>
            </div>

            <div class="space-y-2.5 overflow-y-auto flex-1 max-h-[650px]">
              ${filtered.map(f => {
                const isSelected = selected && selected.id === f.id;
                return `
                  <div onclick="window.SiperAiFindingsView.selectFinding('${f.id}')"
                       class="finding-card p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                         isSelected
                           ? 'bg-surface-container-high border-primary shadow-[0_0_15px_rgba(0,200,255,0.15)] -translate-y-1'
                           : 'bg-surface-container border-outline hover:border-primary/40'
                       }">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ai-tag-pattern uppercase">
                        ${f.type.replace(/_/g, " ")}
                      </span>
                      <span class="text-[10px] font-mono text-intel-green font-bold">${Math.round(f.confidence * 100)}% CONF.</span>
                    </div>
                    <div class="text-xs font-bold text-white">${f.title}</div>
                    <div class="text-[11px] text-on-surface-variant line-clamp-2">
                      ${f.supporting_evidence && f.supporting_evidence.length ? f.supporting_evidence[0] : f.investigator_notes || ''}
                    </div>
                    <div class="flex items-center justify-between pt-1.5 border-t border-outline/40 text-[10px]">
                      <span class="text-muted-text font-mono">Status: <strong class="text-white">${f.status}</strong></span>
                      <span class="text-muted-text font-mono">${(f.timestamp || '').split(' ')[0]}</span>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right 7 Columns: Selected Finding Detail Workspace -->
          <div class="lg:col-span-7 surface-card p-6 flex flex-col space-y-5">
            ${selected ? `
              <!-- Header Details -->
              <div class="border-b border-outline pb-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded ai-tag-pattern">
                    ${selected.type}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-intel-green bg-intel-green/10 border border-intel-green/30 px-2.5 py-0.5 rounded">
                      ${Math.round(selected.confidence * 100)}% EVIDENCE CONFIDENCE
                    </span>
                    <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-surface-container border border-outline text-white">
                      ${selected.status}
                    </span>
                  </div>
                </div>

                <h2 class="text-lg font-bold text-white tracking-tight font-mono">${selected.title}</h2>
                <div class="text-[11px] text-muted-text font-mono">Case Scope: CASE-26189 • Logged at: ${selected.timestamp}</div>
              </div>

              <!-- Why SIPER Flagged This (Explainability Card - Section 10) -->
              <div class="surface-card p-4 border border-primary/40 space-y-2 relative">
                <div class="text-[10px] uppercase font-mono font-bold text-primary flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">psychology</span>
                  <span>AI EXPLAINABILITY ANALYSIS</span>
                </div>
                <p class="text-xs text-white leading-relaxed">
                  ${selected.investigator_notes || 'Algorithmic pattern recognition identified a high-confidence structural or transactional anomaly deviating from baseline network traffic.'}
                </p>
                
                <div class="pt-2">
                  <div class="text-[10px] uppercase font-mono font-bold text-muted-text mb-1 font-mono">Reason Codes:</div>
                  <div class="flex flex-wrap gap-1.5">
                    ${selected.reason_codes.map(rc => `
                      <span class="text-[10px] font-mono bg-surface border border-outline text-on-surface px-2 py-0.5 rounded">${rc}</span>
                    `).join("")}
                  </div>
                </div>
              </div>

              <!-- Involved Entities -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Affected Entities</h3>
                <div class="flex flex-wrap gap-2">
                  ${selected.affected_entities.map(e => `
                    <div class="p-2 rounded-lg bg-surface-container border border-outline flex items-center gap-2 text-xs font-semibold text-white">
                      <span class="w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_#00C8FF]"></span>
                      <span>${e}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- Supporting Evidence Citations -->
              <div class="space-y-2">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Supporting Evidence Documents</h3>
                <div class="space-y-1.5">
                  ${selected.supporting_evidence.map(ev => `
                    <div class="p-2.5 rounded-lg bg-surface-container border border-outline text-xs text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>${ev}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- Investigator Actions -->
              <div class="pt-4 border-t border-outline flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button onclick="window.SiperAiFindingsView.updateStatus('${selected.id}', 'VERIFIED')"
                          class="bg-intel-green hover:brightness-110 text-[#031018] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,160,0.3)] transition-all">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Verify Finding</span>
                  </button>
                  <button onclick="window.SiperAiFindingsView.updateStatus('${selected.id}', 'DISMISSED')"
                          class="btn-cyber-secondary text-critical hover:text-critical border-critical/30 text-xs font-semibold px-4 py-2">
                    Dismiss
                  </button>
                </div>
                <button onclick="window.SiperApp.navigate('reports', { caseId: 'CASE-26189', addFindingId: '${selected.id}' })"
                        class="btn-cyber-secondary text-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">post_add</span>
                  <span>Add to Case Report</span>
                </button>
              </div>
            ` : `
              <div class="p-8 text-center text-on-surface-variant text-xs m-auto font-mono">
                Select a finding from the left list to inspect details and evidence citations.
              </div>
            `}
          </div>

        </div>

      </div>
    `;
  },

  selectFinding(id) {
    this.state.selectedFinding = this.state.findings.find(f => f.id === id);
    this.render();
  },

  filterStatus(status) {
    this.state.statusFilter = status;
    this.render();
  },

  async updateStatus(findingId, newStatus) {
    try {
      await window.SiperApp.api.post(`/findings/${findingId}/update-status`, { status: newStatus });
      window.SiperApp.showToast(`Finding status updated to ${newStatus}.`, "success");
      await this.init({ findingId });
    } catch (e) {
      window.SiperApp.showToast("Failed to update status.", "error");
    }
  },

  async rerunDetection() {
    try {
      window.SiperApp.showToast("Re-running all pattern recognition algorithms...", "info");
      await window.SiperApp.api.post("/analysis/run-pipeline", {});
      window.SiperApp.showToast("Analysis complete. Findings refreshed.", "success");
      await this.init();
    } catch (e) {
      window.SiperApp.showToast("Pattern pipeline error.", "error");
    }
  }
};
