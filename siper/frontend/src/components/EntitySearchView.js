/**
 * SIPER Entity Search & Identity Resolution View (SEARCH-01 & SEARCH-02)
 * Comprehensive entity directory with multi-stage entity resolution review modal.
 */
window.SiperEntitySearchView = {
  state: {
    entities: [],
    candidates: [],
    search: "",
    typeFilter: "ALL",
    riskFilter: "ALL",
    selectedCandidate: null,
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      const [entRes, candRes] = await Promise.all([
        window.SiperApp.api.get("/entities/search"),
        window.SiperApp.api.get("/entities/resolution/candidates")
      ]);
      this.state.entities = entRes.entities || [];
      this.state.candidates = candRes.candidates || [];
    } catch (e) {
      console.error("Error loading entities:", e);
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();

    if (this.state.selectedCandidate) {
      this.renderResolutionModal();
    }
  },

  renderHtml() {
    const filteredEntities = this.state.entities.filter(e => {
      const matchSearch = !this.state.search ||
        e.canonical_name.toLowerCase().includes(this.state.search.toLowerCase()) ||
        (e.aliases && e.aliases.some(a => a.toLowerCase().includes(this.state.search.toLowerCase())));
      const matchType = this.state.typeFilter === "ALL" || e.type === this.state.typeFilter;
      const matchRisk = this.state.riskFilter === "ALL" || e.risk_level === this.state.riskFilter;
      return matchSearch && matchType && matchRisk;
    });

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Entity Intelligence Repository
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">PS-26189</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Unified directory of suspects, phone numbers, vehicles, shell companies, and accounts.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.SiperEntitySearchView.triggerResolutionScan()" class="btn-cyber-secondary text-xs font-semibold px-4 py-2 flex items-center gap-2 text-warning hover:text-warning border-warning/40">
              <span class="material-symbols-outlined text-[18px]">fingerprint</span>
              <span>Run Identity Resolution Scan</span>
            </button>
            <button onclick="window.SiperApp.navigate('graph')" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">hub</span>
              <span>Launch Graph Canvas</span>
            </button>
          </div>
        </div>

        <!-- Pending Identity Resolution Candidate Banner (SEARCH-02) -->
        ${this.state.candidates.length > 0 ? `
          <div class="p-4 rounded-xl bg-surface-container border border-warning/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-warning/20 text-warning flex items-center justify-center font-bold shadow-[0_0_10px_rgba(255,176,32,0.2)]">
                <span class="material-symbols-outlined text-[22px]">merge_type</span>
              </div>
              <div>
                <div class="text-xs font-bold text-white flex items-center gap-2">
                  <span>${this.state.candidates.length} Candidate Identity Match Detected</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-mono font-bold border border-warning/30">${Math.round(this.state.candidates[0].match_confidence * 100)}% Match Confidence</span>
                </div>
                <div class="text-[11px] text-on-surface-variant mt-0.5">
                  High similarity detected between <strong class="text-white">${this.state.candidates[0].candidate_a.name}</strong> and <strong class="text-white">${this.state.candidates[0].candidate_b.name}</strong> (Shared phone & vehicle).
                </div>
              </div>
            </div>
            <button onclick="window.SiperEntitySearchView.openCandidateModal('${this.state.candidates[0].id}')"
                    class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 shrink-0">
              <span>Review Proposal</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        ` : ''}

        <!-- Filter & Search Controls -->
        <div class="surface-card p-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-[18px]">search</span>
              <input type="text"
                     value="${this.state.search}"
                     placeholder="Search entity by name, alias, identifier..."
                     oninput="window.SiperEntitySearchView.handleSearch(this.value)"
                     class="w-full bg-brand-bg border border-outline rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-muted-text outline-none focus:border-primary transition-all focus:shadow-[0_0_12px_rgba(0,200,255,0.15)]" />
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs font-mono">
            <div class="flex items-center gap-1.5">
              <span class="text-muted-text text-[10px] uppercase font-bold">Type:</span>
              <select onchange="window.SiperEntitySearchView.handleTypeChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary">
                <option value="ALL">All Types</option>
                <option value="Person">Person</option>
                <option value="Phone">Phone</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Location">Location</option>
                <option value="Organization">Organization</option>
                <option value="FinancialAccount">Financial Account</option>
                <option value="Incident">Incident</option>
              </select>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-muted-text text-[10px] uppercase font-bold">Risk:</span>
              <select onchange="window.SiperEntitySearchView.handleRiskChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary">
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Review Required</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Entity Table with Lift Rows -->
        <div class="surface-card overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-container border-b border-outline text-[10px] uppercase tracking-wider text-muted-text font-bold font-mono">
              <tr>
                <th class="py-3 px-4">Entity Canonical Name</th>
                <th class="py-3 px-4">Entity Type</th>
                <th class="py-3 px-4">Risk Level</th>
                <th class="py-3 px-4 text-center">Brokerage (Betweenness)</th>
                <th class="py-3 px-4 text-center">Influence (PageRank)</th>
                <th class="py-3 px-4">Known Identifiers</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/40">
              ${filteredEntities.map(e => `
                <tr class="hover:bg-surface-container-high cursor-pointer transition-colors group" onclick="window.SiperApp.navigate('entity-profile', { entityId: '${e.id}' })">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      <span>${e.canonical_name}</span>
                      ${e.aliases && e.aliases.length ? `<span class="text-[10px] font-mono text-muted-text font-normal">(aka ${e.aliases[0]})</span>` : ''}
                    </div>
                  </td>
                  <td class="py-3.5 px-4">${window.SiperApp.renderEntityTypeBadge(e.type)}</td>
                  <td class="py-3.5 px-4">${window.SiperApp.renderRiskBadge(e.risk_level, e.risk_score)}</td>
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-warning">${e.betweenness_centrality || 0}</td>
                  <td class="py-3.5 px-4 text-center font-mono text-primary font-bold">${e.pagerank || 0}</td>
                  <td class="py-3.5 px-4 text-on-surface-variant font-mono text-[11px]">
                    ${Object.entries(e.identifiers || {}).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" • ") || "None"}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button class="text-primary hover:underline font-semibold text-[11px] font-mono">Inspect Profile →</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

      </div>
    `;
  },

  openCandidateModal(candidateId) {
    this.state.selectedCandidate = this.state.candidates.find(c => c.id === candidateId);
    this.render();
  },

  closeCandidateModal() {
    this.state.selectedCandidate = null;
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) modalContainer.innerHTML = "";
  },

  renderResolutionModal() {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer || !this.state.selectedCandidate) return;

    const cand = this.state.selectedCandidate;
    const a = cand.candidate_a;
    const b = cand.candidate_b;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-surface border border-outline-strong rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-outline pb-4">
            <div>
              <div class="text-[10px] uppercase font-mono font-bold text-amber-400">Entity Resolution Candidate Proposal</div>
              <h2 class="text-base font-bold text-white mt-0.5">Potential Identity Match Detected</h2>
            </div>
            <span class="text-xs font-mono font-bold px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ${Math.round(cand.match_confidence * 100)}% MATCH CONFIDENCE
            </span>
          </div>

          <!-- Side-by-Side Comparison Columns -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Candidate A -->
            <div class="p-4 rounded-xl bg-surface-container border border-outline space-y-2">
              <div class="text-[10px] font-mono text-primary font-bold uppercase">Record A (Canonical Primary)</div>
              <div class="font-bold text-white text-sm">${a.name}</div>
              <div class="text-xs text-on-surface-variant font-mono space-y-1">
                <div>📞 Phone: ${a.identifiers.phone ? '+91-' + a.identifiers.phone : 'N/A'}</div>
                <div>🚗 Plate: ${a.identifiers.vehicle_plate || 'N/A'}</div>
                <div>📍 Address: ${a.identifiers.address || 'N/A'}</div>
              </div>
            </div>

            <!-- Candidate B -->
            <div class="p-4 rounded-xl bg-surface-container border border-outline space-y-2">
              <div class="text-[10px] font-mono text-amber-400 font-bold uppercase">Record B (Candidate Secondary)</div>
              <div class="font-bold text-white text-sm">${b.name}</div>
              <div class="text-xs text-on-surface-variant font-mono space-y-1">
                <div>📞 Phone: ${b.identifiers.phone ? '+91-' + b.identifiers.phone : 'N/A'}</div>
                <div>🚗 Plate: ${b.identifiers.vehicle_plate || 'N/A'}</div>
                <div>📍 Address: ${b.identifiers.address || 'N/A'}</div>
              </div>
            </div>
          </div>

          <!-- Match Factors Checklist -->
          <div class="p-3.5 rounded-lg bg-brand-bg border border-outline space-y-2">
            <div class="text-[10px] uppercase font-mono font-bold text-on-surface-variant">Validated Algorithmic Match Factors:</div>
            <div class="space-y-1 text-xs text-emerald-400 font-medium">
              ${cand.match_factors.map(f => `
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>${f}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-2 flex items-center justify-between border-t border-outline">
            <button onclick="window.SiperEntitySearchView.closeCandidateModal()" class="btn-cyber-secondary px-4 py-2 text-xs">
              Cancel / Review Later
            </button>
            <div class="flex items-center gap-2">
              <button onclick="window.SiperEntitySearchView.resolveDecision('${cand.id}', 'KEEP_SEPARATE')" class="btn-cyber-secondary text-xs font-semibold px-4 py-2">
                Keep Separate Entities
              </button>
              <button onclick="window.SiperEntitySearchView.resolveDecision('${cand.id}', 'MERGE')" class="btn-cyber-primary text-xs font-bold px-5 py-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">merge</span>
                <span>Confirm Identity Merge</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  async resolveDecision(candidateId, decision) {
    try {
      const res = await window.SiperApp.api.post("/entities/resolution/resolve", {
        candidate_id: candidateId,
        decision: decision
      });
      this.closeCandidateModal();
      window.SiperApp.showToast(decision === 'MERGE' ? "Entities successfully unified in graph." : "Entities marked as separate.", "success");
      await this.init();
    } catch (e) {
      window.SiperApp.showToast("Error processing entity resolution.", "error");
    }
  },

  async triggerResolutionScan() {
    try {
      window.SiperApp.showToast("Running deterministic & phonetic entity resolution scan...", "info");
      const res = await window.SiperApp.api.post("/entities/resolution/scan", {});
      window.SiperApp.showToast(`Scan Complete: ${res.proposals_found} identity proposals evaluated.`, "success");
      await this.init();
    } catch (e) {
      window.SiperApp.showToast("Scan failed.", "error");
    }
  },

  handleSearch(val) {
    this.state.search = val;
    this.render();
  },

  handleTypeChange(val) {
    this.state.typeFilter = val;
    this.render();
  },

  handleRiskChange(val) {
    this.state.riskFilter = val;
    this.render();
  }
};
