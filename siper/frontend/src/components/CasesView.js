/**
 * SIPER Cases Management & Detail Workspace (CASE-01, CASE-02, CASE-03)
 * Comprehensive Investigator Case Operations conforming to SIH PS-26189.
 * Integrates SQLite persistence, REST APIs, Graph Explorer, AI Findings, Evidence, and Audit Logging.
 */
window.SiperCasesView = {
  state: {
    cases: [],
    summary: {
      active_cases: 0,
      closed_cases: 0,
      high_risk_cases: 0,
      total_cases: 0
    },
    activeCase: null,
    activeTab: "overview", // overview | entities | findings | related | network | evidence | timeline
    entityFilterType: "ALL",
    caseDetailData: null,
    search: "",
    statusFilter: "ALL",
    priorityFilter: "ALL",
    typeFilter: "ALL",
    isCreating: false,
    newCaseForm: {
      case_id: "",
      title: "",
      description: "",
      case_type: "Organized Crime",
      priority: "HIGH",
      assigned_investigator: "Investigator-7",
      location: "National Jurisdiction",
      date: new Date().toISOString().split("T")[0],
      tags: "Active, PS-26189"
    },
    loading: true,
    error: null,
    saving: false
  },

  async init(params = {}) {
    if (params.create) {
      this.openCreateModal();
    }
    if (params.caseId) {
      await this.loadCaseDetail(params.caseId, params.tab || "overview");
      return;
    }

    this.state.activeCase = null;
    await this.loadCases();
  },

  async loadCases() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      let url = "/cases?";
      if (this.state.statusFilter !== "ALL") url += `status=${encodeURIComponent(this.state.statusFilter)}&`;
      if (this.state.priorityFilter !== "ALL") url += `priority=${encodeURIComponent(this.state.priorityFilter)}&`;
      if (this.state.typeFilter !== "ALL") url += `type=${encodeURIComponent(this.state.typeFilter)}&`;
      if (this.state.search) url += `search=${encodeURIComponent(this.state.search)}&`;

      const res = await window.SiperApp.api.get(url);
      this.state.cases = res.cases || [];
      if (res.summary) {
        this.state.summary = res.summary;
      } else {
        this.computeSummaryFromCases();
      }
    } catch (e) {
      console.error("Error loading cases:", e);
      this.state.error = "Unable to load case data. Check backend connection.";
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  computeSummaryFromCases() {
    const list = this.state.cases;
    this.state.summary = {
      active_cases: list.filter(c => c.status === "ACTIVE").length,
      closed_cases: list.filter(c => c.status === "CLOSED").length,
      high_risk_cases: list.filter(c => c.priority === "CRITICAL" || c.priority === "HIGH").length,
      total_cases: list.length
    };
  },

  async loadCaseDetail(caseId, tab = "overview") {
    this.state.loading = true;
    this.state.error = null;
    this.state.activeTab = tab;
    this.render();

    try {
      const res = await window.SiperApp.api.get(`/cases/${encodeURIComponent(caseId)}/${encodeURIComponent(tab)}`);
      this.state.caseDetailData = res;
      this.state.activeCase = res.case || { id: caseId, title: `Case ${caseId}` };
    } catch (e) {
      console.error("Error loading case detail:", e);
      this.state.error = "Unable to load case details. Check backend connection.";
    } finally {
      this.state.loading = false;
      this.render();
    }
  },

  async updateCaseStatus(caseId, newStatus) {
    try {
      const res = await window.SiperApp.api.put(`/cases/${encodeURIComponent(caseId)}`, { status: newStatus });
      if (res.success) {
        window.SiperApp.showToast(`Case ${caseId} status updated to ${newStatus}.`, "success");
        if (this.state.activeCase && this.state.activeCase.id === caseId) {
          this.state.activeCase.status = newStatus;
          if (this.state.caseDetailData && this.state.caseDetailData.case) {
            this.state.caseDetailData.case.status = newStatus;
          }
        }
        await this.loadCases();
      }
    } catch (e) {
      window.SiperApp.showToast("Failed to update case status.", "error");
    }
  },

  async updateCasePriority(caseId, newPriority) {
    try {
      const res = await window.SiperApp.api.put(`/cases/${encodeURIComponent(caseId)}`, { priority: newPriority });
      if (res.success) {
        window.SiperApp.showToast(`Case ${caseId} priority updated to ${newPriority}.`, "success");
        if (this.state.activeCase && this.state.activeCase.id === caseId) {
          this.state.activeCase.priority = newPriority;
          if (this.state.caseDetailData && this.state.caseDetailData.case) {
            this.state.caseDetailData.case.priority = newPriority;
          }
        }
        await this.loadCases();
      }
    } catch (e) {
      window.SiperApp.showToast("Failed to update case priority.", "error");
    }
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;

    if (this.state.activeCase) {
      container.innerHTML = this.renderCaseDetailHtml();
    } else {
      container.innerHTML = this.renderCaseListHtml();
    }

    if (this.state.isCreating) {
      this.renderCreateModal();
    }
  },

  // -------------------------------------------------------------
  // CASES LIST VIEW
  // -------------------------------------------------------------
  renderCaseListHtml() {
    const summary = this.state.summary;

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- HEADER (Section 2) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3 font-mono">
              Cases
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">PS-26189</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Manage investigations, review intelligence findings and monitor case activity.</p>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="window.SiperCasesView.focusSearch()" class="btn-cyber-secondary text-xs font-semibold px-3.5 py-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary">search</span>
              <span>Search Cases</span>
            </button>
            <button onclick="window.SiperCasesView.openCreateModal()" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>+ New Case</span>
            </button>
          </div>
        </div>

        <!-- SUMMARY CARDS (Section 3) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Active Cases -->
          <div class="surface-card p-4 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-text font-mono">Active Cases</span>
              <span class="material-symbols-outlined text-[20px] text-primary">folder_shared</span>
            </div>
            <div class="text-3xl font-black text-white tracking-tight mt-2 font-mono">${summary.active_cases}</div>
            <div class="text-[11px] text-intel-green mt-2 flex items-center gap-1 font-medium font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-intel-green animate-pulse"></span>
              <span>Active operational investigations</span>
            </div>
          </div>

          <!-- Closed Cases -->
          <div class="surface-card p-4 relative overflow-hidden group hover:border-slate-500/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-text font-mono">Closed Cases</span>
              <span class="material-symbols-outlined text-[20px] text-slate-400">task_alt</span>
            </div>
            <div class="text-3xl font-black text-white tracking-tight mt-2 font-mono">${summary.closed_cases}</div>
            <div class="text-[11px] text-muted-text mt-2 flex items-center gap-1 font-medium font-mono">
              <span>Resolved or concluded files</span>
            </div>
          </div>

          <!-- High-Risk Cases -->
          <div class="surface-card p-4 relative overflow-hidden group hover:border-critical/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-text font-mono">High-Risk Cases</span>
              <span class="material-symbols-outlined text-[20px] text-critical">warning</span>
            </div>
            <div class="text-3xl font-black text-critical tracking-tight mt-2 font-mono">${summary.high_risk_cases}</div>
            <div class="text-[11px] text-critical/90 mt-2 flex items-center gap-1 font-medium font-mono">
              <span>Critical or High priority</span>
            </div>
          </div>

          <!-- Total Cases -->
          <div class="surface-card p-4 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-text font-mono">Total Cases</span>
              <span class="material-symbols-outlined text-[20px] text-amber-400">inventory_2</span>
            </div>
            <div class="text-3xl font-black text-white tracking-tight mt-2 font-mono">${summary.total_cases}</div>
            <div class="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1 font-medium font-mono">
              <span>Registered in repository</span>
            </div>
          </div>
        </div>

        <!-- SEARCH AND FILTER CONTROLS (Section 5) -->
        <div class="surface-card p-3.5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Search bar -->
            <div class="relative flex-1 min-w-[260px] max-w-lg">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-[18px]">search</span>
              <input type="text"
                     id="cases-search-input"
                     value="${this.state.search}"
                     placeholder="Search Case ID, title, investigator, type, entity, status..."
                     oninput="window.SiperCasesView.handleSearchInput(this.value)"
                     class="w-full bg-brand-bg border border-outline rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-muted-text outline-none focus:border-primary transition-all focus:shadow-[0_0_12px_rgba(0,200,255,0.15)]" />
              ${this.state.search ? `
                <button onclick="window.SiperCasesView.handleSearchInput('')" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-white">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              ` : ''}
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
              <!-- Status Filter -->
              <div class="flex items-center gap-1.5">
                <span class="text-muted-text text-[10px] uppercase font-bold">Status:</span>
                <select onchange="window.SiperCasesView.handleStatusChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary">
                  <option value="ALL" ${this.state.statusFilter === 'ALL' ? 'selected' : ''}>All</option>
                  <option value="ACTIVE" ${this.state.statusFilter === 'ACTIVE' ? 'selected' : ''}>Active</option>
                  <option value="UNDER INVESTIGATION" ${this.state.statusFilter === 'UNDER INVESTIGATION' ? 'selected' : ''}>Under Investigation</option>
                  <option value="CLOSED" ${this.state.statusFilter === 'CLOSED' ? 'selected' : ''}>Closed</option>
                  <option value="ARCHIVED" ${this.state.statusFilter === 'ARCHIVED' ? 'selected' : ''}>Archived</option>
                </select>
              </div>

              <!-- Priority Filter -->
              <div class="flex items-center gap-1.5">
                <span class="text-muted-text text-[10px] uppercase font-bold">Priority:</span>
                <select onchange="window.SiperCasesView.handlePriorityChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary">
                  <option value="ALL" ${this.state.priorityFilter === 'ALL' ? 'selected' : ''}>All</option>
                  <option value="CRITICAL" ${this.state.priorityFilter === 'CRITICAL' ? 'selected' : ''}>Critical</option>
                  <option value="HIGH" ${this.state.priorityFilter === 'HIGH' ? 'selected' : ''}>High</option>
                  <option value="MEDIUM" ${this.state.priorityFilter === 'MEDIUM' ? 'selected' : ''}>Medium</option>
                  <option value="LOW" ${this.state.priorityFilter === 'LOW' ? 'selected' : ''}>Low</option>
                </select>
              </div>

              <!-- Case Type Filter -->
              <div class="flex items-center gap-1.5">
                <span class="text-muted-text text-[10px] uppercase font-bold">Case Type:</span>
                <select onchange="window.SiperCasesView.handleTypeChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary">
                  <option value="ALL" ${this.state.typeFilter === 'ALL' ? 'selected' : ''}>All</option>
                  <option value="Cyber Crime" ${this.state.typeFilter === 'Cyber Crime' ? 'selected' : ''}>Cyber Crime</option>
                  <option value="Financial Crime" ${this.state.typeFilter === 'Financial Crime' ? 'selected' : ''}>Financial Crime</option>
                  <option value="Drug Distribution" ${this.state.typeFilter === 'Drug Distribution' ? 'selected' : ''}>Drug Distribution</option>
                  <option value="Organized Crime" ${this.state.typeFilter === 'Organized Crime' ? 'selected' : ''}>Organized Crime</option>
                  <option value="Cross-Border Crime" ${this.state.typeFilter === 'Cross-Border Crime' ? 'selected' : ''}>Cross-Border Crime</option>
                  <option value="Other" ${this.state.typeFilter === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>

              ${(this.state.statusFilter !== 'ALL' || this.state.priorityFilter !== 'ALL' || this.state.typeFilter !== 'ALL' || this.state.search) ? `
                <button onclick="window.SiperCasesView.resetFilters()" class="text-xs text-primary hover:underline flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">restart_alt</span>
                  <span>Reset</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- CASES LIST TABLE / CARDS (Section 4 & 13) -->
        ${this.renderCasesBody()}

      </div>
    `;
  },

  renderCasesBody() {
    if (this.state.loading) {
      return `
        <div class="surface-card p-12 text-center space-y-3">
          <span class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
          <div class="text-xs text-on-surface-variant font-mono">Loading cases...</div>
        </div>
      `;
    }

    if (this.state.error) {
      return `
        <div class="surface-card p-10 text-center space-y-3 border-critical/40">
          <span class="material-symbols-outlined text-3xl text-critical">error</span>
          <div class="text-sm font-semibold text-white">${this.state.error}</div>
          <p class="text-xs text-on-surface-variant">Unable to load case data. Check backend connection.</p>
          <button onclick="window.SiperCasesView.loadCases()" class="btn-cyber-primary text-xs font-bold px-4 py-2 inline-flex items-center gap-1.5 mt-2">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retry</span>
          </button>
        </div>
      `;
    }

    if (!this.state.cases || this.state.cases.length === 0) {
      return `
        <div class="surface-card p-12 text-center space-y-4">
          <span class="material-symbols-outlined text-4xl text-muted-text">folder_off</span>
          <div>
            <div class="text-sm font-bold text-white">No cases found.</div>
            <p class="text-xs text-on-surface-variant mt-1">No investigation records match your active search or filter criteria.</p>
          </div>
          <div class="flex items-center justify-center gap-3">
            <button onclick="window.SiperCasesView.resetFilters()" class="btn-cyber-secondary text-xs font-semibold px-4 py-2">
              Clear Filters
            </button>
            <button onclick="window.SiperCasesView.openCreateModal()" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>Initiate Case</span>
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="surface-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs min-w-[950px]">
            <thead class="bg-surface-container border-b border-outline text-[10px] uppercase tracking-wider text-muted-text font-bold font-mono">
              <tr>
                <th class="py-3 px-4">Case ID</th>
                <th class="py-3 px-4">Case Title & Scope</th>
                <th class="py-3 px-4">Case Type</th>
                <th class="py-3 px-4">Priority</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Assigned Investigator</th>
                <th class="py-3 px-4 text-center">Entities</th>
                <th class="py-3 px-4 text-center">Findings</th>
                <th class="py-3 px-4">Last Updated</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/40">
              ${this.state.cases.map(c => `
                <tr class="hover:bg-surface-container-high transition-colors group">
                  <!-- Case ID -->
                  <td class="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                    <button onclick="window.SiperCasesView.loadCaseDetail('${c.id}')" class="hover:underline flex items-center gap-1">
                      <span>${c.id}</span>
                    </button>
                  </td>

                  <!-- Case Title -->
                  <td class="py-3.5 px-4 max-w-xs cursor-pointer" onclick="window.SiperCasesView.loadCaseDetail('${c.id}')">
                    <div class="font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">${c.title}</div>
                    <div class="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">${c.description || ''}</div>
                  </td>

                  <!-- Case Type -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline">
                      ${c.case_type || c.type || 'Organized Crime'}
                    </span>
                  </td>

                  <!-- Priority -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    ${window.SiperApp.renderStatusIndicator(c.priority)}
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    ${window.SiperApp.renderStatusIndicator(c.status)}
                  </td>

                  <!-- Investigator -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-on-surface font-medium">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[14px] text-muted-text">badge</span>
                      <span>${c.investigator || c.owner || 'Investigator-7'}</span>
                    </div>
                  </td>

                  <!-- Entities -->
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      ${c.entity_count ?? c.entities ?? 0}
                    </span>
                  </td>

                  <!-- Findings -->
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-warning whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                      ${c.findings_count ?? c.findings ?? 0}
                    </span>
                  </td>

                  <!-- Last Updated -->
                  <td class="py-3.5 px-4 text-muted-text font-mono text-[11px] whitespace-nowrap">
                    ${(c.updated_at || c.created_at || '').split(' ')[0]}
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <button onclick="window.SiperCasesView.loadCaseDetail('${c.id}')"
                              class="px-2.5 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-medium transition-colors"
                              title="View Case Details">
                        View
                      </button>
                      <button onclick="window.SiperApp.navigate('graph', { caseId: '${c.id}' })"
                              class="p-1 rounded text-muted-text hover:text-white hover:bg-surface-container transition-colors"
                              title="Open in Graph Explorer">
                        <span class="material-symbols-outlined text-[18px]">hub</span>
                      </button>
                      <button onclick="window.SiperCasesView.promptStatusChange('${c.id}', '${c.status}')"
                              class="p-1 rounded text-muted-text hover:text-white hover:bg-surface-container transition-colors"
                              title="Change Status">
                        <span class="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // CASE DETAILS VIEW (Section 7, 8, 9, 10, 11)
  // -------------------------------------------------------------
  renderCaseDetailHtml() {
    const c = this.state.activeCase;
    const tab = this.state.activeTab;
    const data = this.state.caseDetailData || {};

    const tabs = [
      { id: "overview", label: "Overview", icon: "dashboard" },
      { id: "entities", label: `Entities (${c.entity_count || data.entities?.length || 0})`, icon: "person_search" },
      { id: "findings", label: `AI Findings (${c.findings_count || data.findings?.length || 0})`, icon: "insights" },
      { id: "related", label: `Related Cases (${data.related_cases?.length || 0})`, icon: "compare_arrows" },
      { id: "network", label: "Network Graph", icon: "hub" },
      { id: "evidence", label: `Evidence (${data.documents?.length || 0})`, icon: "description" },
      { id: "timeline", label: "Timeline", icon: "timeline" }
    ];

    return `
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        
        <!-- Header Banner (Section 7) -->
        <div class="bg-surface border-b border-outline p-5 shrink-0">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
            
            <div class="space-y-1.5 flex-1">
              <div class="flex flex-wrap items-center gap-2.5">
                <button onclick="window.SiperCasesView.backToList()" class="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline text-on-surface-variant hover:text-white transition-colors" title="Back to Cases List">
                  <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
                <span class="font-mono text-sm font-bold text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded">${c.id}</span>
                <span class="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline">
                  ${c.case_type || c.type || 'Organized Crime'}
                </span>
                ${window.SiperApp.renderStatusIndicator(c.priority)}
                
                <!-- Status Switcher Dropdown (Section 11) -->
                <div class="relative inline-block">
                  <select onchange="window.SiperCasesView.updateCaseStatus('${c.id}', this.value)"
                          class="bg-surface-container border border-outline rounded text-[11px] font-mono font-bold px-2 py-0.5 text-white outline-none cursor-pointer hover:border-primary transition-all">
                    <option value="ACTIVE" ${c.status === 'ACTIVE' ? 'selected' : ''}>STATUS: ACTIVE</option>
                    <option value="UNDER INVESTIGATION" ${c.status === 'UNDER INVESTIGATION' || c.status === 'UNDER_REVIEW' ? 'selected' : ''}>STATUS: UNDER INVESTIGATION</option>
                    <option value="CLOSED" ${c.status === 'CLOSED' ? 'selected' : ''}>STATUS: CLOSED</option>
                    <option value="ARCHIVED" ${c.status === 'ARCHIVED' ? 'selected' : ''}>STATUS: ARCHIVED</option>
                  </select>
                </div>
              </div>

              <h1 class="text-xl font-bold text-white tracking-tight font-mono">${c.title}</h1>
              <p class="text-xs text-on-surface-variant max-w-4xl">${c.description || 'No case description provided.'}</p>

              <!-- Metadata Line -->
              <div class="flex flex-wrap items-center gap-4 text-[11px] text-muted-text font-mono pt-1">
                <span>👤 Lead: <strong class="text-white">${c.investigator || c.owner || 'Investigator-7'}</strong></span>
                <span>📍 Location: <strong class="text-white">${c.location || 'National Jurisdiction'}</strong></span>
                <span>📅 Created: <strong class="text-white">${(c.created_at || '').split(' ')[0]}</strong></span>
                <span>🕒 Last Updated: <strong class="text-white">${(c.updated_at || '').split(' ')[0]}</strong></span>
              </div>
            </div>

            <!-- Top Action Buttons -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button onclick="window.SiperApp.navigate('graph', { caseId: '${c.id}' })"
                      class="btn-cyber-primary text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,200,255,0.25)]">
                <span class="material-symbols-outlined text-[18px]">hub</span>
                <span>Open in Graph Explorer</span>
              </button>
              <button onclick="window.SiperApp.navigate('ingestion', { caseId: '${c.id}' })"
                      class="btn-cyber-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">upload_file</span>
                <span>Add Evidence</span>
              </button>
              <button onclick="window.SiperApp.navigate('reports', { caseId: '${c.id}' })"
                      class="btn-cyber-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">assessment</span>
                <span>Generate Dossier</span>
              </button>
            </div>

          </div>

          <!-- Navigation Tabs -->
          <div class="max-w-7xl mx-auto flex items-center gap-1 mt-5 border-t border-outline/50 pt-3 overflow-x-auto">
            ${tabs.map(t => {
              const isActive = tab === t.id;
              return `
                <button onclick="window.SiperCasesView.switchTab('${t.id}')"
                        class="px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-primary/15 text-white font-bold border border-primary/40 shadow-[0_0_10px_rgba(0,200,255,0.15)]'
                            : 'text-on-surface-variant hover:text-white hover:bg-surface-container'
                        }">
                  <span class="material-symbols-outlined text-[16px] ${isActive ? 'text-primary' : 'text-muted-text'}">${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `;
            }).join("")}
          </div>

        </div>

        <!-- Case Tab Content Area -->
        <div class="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          ${this.renderActiveTabContent(tab, data)}
        </div>

      </div>
    `;
  },

  renderActiveTabContent(tab, data) {
    const c = this.state.activeCase;

    // 1. OVERVIEW TAB
    if (tab === "overview") {
      const entities = data.entities || data.recent_entities || [];
      const findings = data.findings || data.recent_findings || [];
      const docs = data.documents || data.recent_documents || [];
      const related = data.related_cases || [];

      return `
        <div class="space-y-6">
          <!-- Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="surface-card p-4">
              <div class="text-[10px] font-mono uppercase font-bold text-muted-text">Entities Under Watch</div>
              <div class="text-2xl font-black text-white mt-1 font-mono">${entities.length} Nodes</div>
              <div class="text-[11px] text-intel-green mt-1">Cross-referenced in repository</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-[10px] font-mono uppercase font-bold text-muted-text">Validated AI Signals</div>
              <div class="text-2xl font-black text-warning mt-1 font-mono">${findings.length} Signals</div>
              <div class="text-[11px] text-warning mt-1">Algorithmic risk detections</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-[10px] font-mono uppercase font-bold text-muted-text">Evidence Items</div>
              <div class="text-2xl font-black text-white mt-1 font-mono">${docs.length} Items</div>
              <div class="text-[11px] text-primary mt-1">FIR, CDR & Banking records</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-[10px] font-mono uppercase font-bold text-muted-text">Connected Cases</div>
              <div class="text-2xl font-black text-primary mt-1 font-mono">${related.length} Cases</div>
              <div class="text-[11px] text-on-surface-variant mt-1">Linked via shared entities</div>
            </div>
          </div>

          <!-- Network Callout Banner (Section 8) -->
          <div class="surface-card p-5 border border-primary/30 bg-gradient-to-r from-primary/10 via-surface-container to-surface flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-[0_0_15px_rgba(0,200,255,0.2)]">
                <span class="material-symbols-outlined text-[28px]">hub</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white font-mono">Case Criminal Network Graph</h3>
                <p class="text-xs text-on-surface-variant mt-0.5">Explore full force-directed relationship topology, shortest path traversal, and Louvain community clusters for this case.</p>
              </div>
            </div>
            <button onclick="window.SiperApp.navigate('graph', { caseId: '${c.id}' })"
                    class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0">
              <span>Open in Graph Explorer</span>
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>

          <!-- Two Column Grid: Suspects & Findings -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Key Entities Preview -->
            <div class="surface-card p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Key Tracked Entities</h3>
                <button onclick="window.SiperCasesView.switchTab('entities')" class="text-xs text-primary hover:underline font-semibold">
                  View All (${entities.length}) →
                </button>
              </div>
              <div class="space-y-2">
                ${entities.slice(0, 4).map(e => `
                  <div onclick="window.SiperApp.navigate('entity-profile', { entityId: '${e.id}' })"
                       class="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline cursor-pointer flex items-center justify-between transition-colors group">
                    <div class="flex items-center gap-2.5">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${e.color || '#00C8FF'}"></span>
                      <div>
                        <div class="text-xs font-semibold text-white group-hover:text-primary transition-colors">${e.canonical_name}</div>
                        <div class="text-[10px] text-on-surface-variant">${e.type}</div>
                      </div>
                    </div>
                    ${window.SiperApp.renderRiskBadge(e.risk_level, e.risk_score)}
                  </div>
                `).join("")}
                ${entities.length === 0 ? '<div class="text-xs text-muted-text text-center py-4">No entities mapped yet.</div>' : ''}
              </div>
            </div>

            <!-- Findings Preview -->
            <div class="surface-card p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">AI Intelligence Findings</h3>
                <button onclick="window.SiperCasesView.switchTab('findings')" class="text-xs text-primary hover:underline font-semibold">
                  View All (${findings.length}) →
                </button>
              </div>
              <div class="space-y-2">
                ${findings.slice(0, 3).map(f => `
                  <div class="p-3 rounded-lg bg-surface-container border border-outline space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-mono text-warning font-bold uppercase">${f.type}</span>
                      <span class="text-[10px] text-intel-green font-mono font-semibold">${Math.round((f.confidence || 0.9) * 100)}% Conf.</span>
                    </div>
                    <div class="text-xs font-semibold text-white">${f.title}</div>
                    <div class="text-[11px] text-on-surface-variant line-clamp-1">${(f.reason_codes && f.reason_codes[0]) || f.investigator_notes || 'Requires investigator review'}</div>
                  </div>
                `).join("")}
                ${findings.length === 0 ? '<div class="text-xs text-muted-text text-center py-4">No findings detected yet.</div>' : ''}
              </div>
            </div>

          </div>

          <!-- Related Cases Preview (Section 7) -->
          ${related.length > 0 ? `
            <div class="surface-card p-5 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">compare_arrows</span>
                  <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">Connected Cases Through Common Entities</h3>
                </div>
                <button onclick="window.SiperCasesView.switchTab('related')" class="text-xs text-primary hover:underline font-semibold">
                  View All (${related.length}) →
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${related.slice(0, 2).map(rc => `
                  <div onclick="window.SiperCasesView.loadCaseDetail('${rc.id}')"
                       class="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline cursor-pointer transition-colors space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-mono text-xs font-bold text-primary">${rc.id}</span>
                      ${window.SiperApp.renderStatusIndicator(rc.status)}
                    </div>
                    <div class="text-xs font-semibold text-white">${rc.title}</div>
                    <div class="text-[11px] text-intel-green font-mono">
                      🔗 ${rc.shared_count} Shared Entities: ${rc.shared_entities.slice(0, 3).map(e => e.name).join(", ")}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

        </div>
      `;
    }

    // 2. ENTITIES TAB (Section 7)
    if (tab === "entities") {
      const allEntities = data.entities || [];
      const byType = data.entities_by_type || {};
      const activeFilter = this.state.entityFilterType;

      const entityTypes = [
        { id: "ALL", label: `All (${allEntities.length})` },
        { id: "Person", label: `Persons (${byType.Person?.length || 0})` },
        { id: "Phone", label: `Phones (${byType.Phone?.length || 0})` },
        { id: "Vehicle", label: `Vehicles (${byType.Vehicle?.length || 0})` },
        { id: "Organization", label: `Organizations (${byType.Organization?.length || 0})` },
        { id: "Location", label: `Locations (${byType.Location?.length || 0})` },
        { id: "FinancialAccount", label: `Financial Accounts (${byType.FinancialAccount?.length || 0})` }
      ];

      const displayedEntities = activeFilter === "ALL"
        ? allEntities
        : (byType[activeFilter] || []);

      return `
        <div class="space-y-4">
          <!-- Entity Sub-filter Pills -->
          <div class="flex flex-wrap items-center gap-1.5 border-b border-outline pb-3">
            ${entityTypes.map(t => `
              <button onclick="window.SiperCasesView.setEntityFilter('${t.id}')"
                      class="px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        activeFilter === t.id
                          ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                          : 'bg-surface-container text-on-surface-variant hover:text-white border border-outline'
                      }">
                ${t.label}
              </button>
            `).join("")}
          </div>

          <!-- Entities Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${displayedEntities.map(e => `
              <div class="surface-card p-4 space-y-2.5 flex flex-col justify-between hover:border-primary/40 transition-all">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    ${window.SiperApp.renderEntityTypeBadge(e.type)}
                    ${window.SiperApp.renderRiskBadge(e.risk_level, e.risk_score)}
                  </div>
                  <div class="text-sm font-bold text-white font-mono mt-1">${e.canonical_name}</div>
                  
                  ${e.notes ? `<p class="text-[11px] text-on-surface-variant line-clamp-2">${e.notes}</p>` : ''}
                  
                  <!-- Identifiers Preview -->
                  ${e.identifiers && Object.keys(e.identifiers).length > 0 ? `
                    <div class="pt-2 border-t border-outline/40 space-y-0.5 text-[10px] font-mono text-muted-text">
                      ${Object.entries(e.identifiers).slice(0, 2).map(([k, v]) => `
                        <div class="truncate"><span class="text-on-surface-variant font-semibold">${k}:</span> <strong class="text-white">${v}</strong></div>
                      `).join("")}
                    </div>
                  ` : ''}
                </div>

                <div class="pt-2 border-t border-outline/50 flex items-center justify-between text-xs">
                  <span class="font-mono text-[10px] text-muted-text">${e.id}</span>
                  <button onclick="window.SiperApp.navigate('entity-profile', { entityId: '${e.id}' })"
                          class="text-primary hover:underline font-semibold text-xs flex items-center gap-1">
                    <span>Inspect Profile</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          ${displayedEntities.length === 0 ? `
            <div class="surface-card p-12 text-center text-on-surface-variant text-xs font-mono">
              No entities found in category "${activeFilter}".
            </div>
          ` : ''}
        </div>
      `;
    }

    // 3. AI FINDINGS TAB (Section 9)
    if (tab === "findings") {
      const findings = data.findings || [];

      return `
        <div class="space-y-4">
          <!-- Phrasing Notice -->
          <div class="p-3.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
            <div>
              <span class="font-bold text-white">Decision Support System:</span> Findings reflect algorithmic anomaly detections and investigative leads. All items require formal human investigator review prior to evidentiary filing.
            </div>
          </div>

          <!-- Findings Cards -->
          <div class="space-y-3">
            ${findings.map(f => {
              const confidencePct = Math.round((f.confidence || 0.9) * 100);
              const risk = (f.risk_level || f.severity || "HIGH").toUpperCase();
              const riskColor = risk === "CRITICAL" || risk === "HIGH" ? "text-critical border-critical/30 bg-critical/10" : "text-warning border-warning/30 bg-warning/10";

              return `
                <div class="surface-card p-5 space-y-3 border border-outline hover:border-primary/40 transition-all">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/50 pb-2.5">
                    <div class="space-y-0.5">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${riskColor}">
                          ${risk} RISK SIGNAL
                        </span>
                        <span class="text-[10px] font-mono text-intel-green font-bold bg-intel-green/10 border border-intel-green/30 px-2 py-0.5 rounded">
                          ${confidencePct}% CONFIDENCE
                        </span>
                        <span class="text-[10px] font-mono text-muted-text uppercase">${f.type}</span>
                      </div>
                      <h4 class="text-sm font-bold text-white mt-1">${f.title}</h4>
                    </div>
                    <div class="text-[11px] font-mono text-muted-text shrink-0">
                      Detected: ${(f.timestamp || '').split(' ')[0]}
                    </div>
                  </div>

                  <!-- Reason / Lead -->
                  <div class="text-xs text-on-surface-variant space-y-1">
                    <div class="text-[10px] uppercase font-mono font-bold text-muted-text">Investigative Lead / Detected Pattern:</div>
                    <p class="text-white bg-surface-container p-2.5 rounded-lg border border-outline font-mono text-[11px]">
                      ${(f.reason_codes && f.reason_codes[0]) || f.investigator_notes || 'Potential pattern detected requiring investigator review.'}
                    </p>
                  </div>

                  <!-- Affected Entities & Evidence -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <div class="text-[10px] uppercase font-mono font-bold text-muted-text mb-1">Affected Entities:</div>
                      <div class="flex flex-wrap gap-1.5">
                        ${(f.affected_entities || []).map(ae => `
                          <span class="px-2 py-0.5 rounded bg-surface-container text-white font-mono text-[10px] border border-outline">
                            ${ae}
                          </span>
                        `).join("")}
                      </div>
                    </div>
                    <div>
                      <div class="text-[10px] uppercase font-mono font-bold text-muted-text mb-1">Evidence Reference:</div>
                      <div class="flex flex-wrap gap-1.5 font-mono text-[11px] text-primary">
                        ${(f.supporting_evidence || []).map(se => `
                          <span class="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-[10px]">
                            📄 ${se}
                          </span>
                        `).join("")}
                      </div>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-outline/40 flex items-center justify-between text-xs">
                    <span class="text-[11px] text-muted-text font-mono italic">Potential pattern detected · Requires investigator review</span>
                    <button onclick="window.SiperApp.navigate('findings', { findingId: '${f.id}' })" class="text-primary hover:underline font-semibold flex items-center gap-1 text-xs">
                      <span>Open in AI Findings Hub</span>
                      <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>

                </div>
              `;
            }).join("")}

            ${findings.length === 0 ? `
              <div class="surface-card p-12 text-center text-on-surface-variant text-xs font-mono">
                No automated findings associated with this case file.
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 4. RELATED CASES TAB (Section 7)
    if (tab === "related") {
      const related = data.related_cases || [];

      return `
        <div class="space-y-4">
          <div class="p-3.5 rounded-lg bg-surface-container border border-outline flex items-center gap-3 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0">hub</span>
            <div>
              <span class="font-bold text-white">Syndicate Cross-Case Intelligence:</span> Identifies other registered investigations sharing mutual suspects, telecom intercepts, corporate shells, or bank accounts.
            </div>
          </div>

          <div class="space-y-3">
            ${related.map(rc => `
              <div class="surface-card p-5 space-y-3 border border-outline hover:border-primary/40 transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline/50 pb-2.5">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2 font-mono">
                      <span class="font-bold text-primary text-sm">${rc.id}</span>
                      <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline">
                        ${rc.case_type || rc.type}
                      </span>
                      ${window.SiperApp.renderStatusIndicator(rc.status)}
                      ${window.SiperApp.renderStatusIndicator(rc.priority)}
                    </div>
                    <h4 class="text-sm font-bold text-white mt-1">${rc.title}</h4>
                  </div>
                  <button onclick="window.SiperCasesView.loadCaseDetail('${rc.id}')" class="btn-cyber-primary text-xs font-bold px-3 py-1.5 shrink-0 flex items-center gap-1">
                    <span>Inspect Case</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <!-- Shared Entities -->
                <div>
                  <div class="text-[10px] uppercase font-mono font-bold text-muted-text mb-1.5">Common Linked Entities (${rc.shared_count}):</div>
                  <div class="flex flex-wrap gap-2">
                    ${rc.shared_entities.map(se => `
                      <span class="px-2.5 py-1 rounded-lg bg-surface-container border border-outline text-xs flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-primary"></span>
                        <span class="text-white font-semibold">${se.name}</span>
                        <span class="text-[10px] text-muted-text font-mono">(${se.type})</span>
                      </span>
                    `).join("")}
                  </div>
                </div>
              </div>
            `).join("")}

            ${related.length === 0 ? `
              <div class="surface-card p-12 text-center text-on-surface-variant text-xs font-mono">
                No overlapping entity connections discovered with other registered investigations.
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 5. NETWORK GRAPH TAB (Section 8)
    if (tab === "network") {
      return `
        <div class="surface-card p-6 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline pb-4">
            <div>
              <h3 class="text-base font-bold text-white font-mono">Case Investigation Network Topology</h3>
              <p class="text-xs text-on-surface-variant mt-1">Multi-modal graph showing suspect communication bursts, financial transactions, and shared corporate vehicles.</p>
            </div>
            <button onclick="window.SiperApp.navigate('graph', { caseId: '${c.id}' })" class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0">
              <span>Open in Fullscreen Graph Explorer</span>
              <span class="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>

          <div class="p-12 text-center bg-brand-bg rounded-xl border border-outline space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto shadow-[0_0_20px_rgba(0,200,255,0.2)]">
              <span class="material-symbols-outlined text-4xl">hub</span>
            </div>
            <div class="max-w-md mx-auto space-y-1">
              <div class="text-sm font-bold text-white">Full Interactive Force-Directed Canvas Ready</div>
              <p class="text-xs text-on-surface-variant">Click below to launch the 3-pane interactive network graph workspace initialized with Case ${c.id} entities, degree centralities, and link confidence filters.</p>
            </div>
            <button onclick="window.SiperApp.navigate('graph', { caseId: '${c.id}' })"
                    class="btn-cyber-primary text-xs font-bold px-5 py-2.5 inline-flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">hub</span>
              <span>Launch Graph Explorer Scope: ${c.id}</span>
            </button>
          </div>
        </div>
      `;
    }

    // 6. EVIDENCE TAB (Section 10)
    if (tab === "evidence") {
      const docs = data.documents || [];

      return `
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline pb-3">
            <div>
              <h3 class="text-sm font-bold text-white font-mono">Evidentiary Primary Sources</h3>
              <p class="text-xs text-on-surface-variant">Cryptographically signed FIRs, call detail logs, and bank statements.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.SiperApp.navigate('evidence', { caseId: '${c.id}' })" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">visibility</span>
                <span>View in Evidence Workspace</span>
              </button>
              <button onclick="window.SiperApp.navigate('ingestion', { caseId: '${c.id}' })" class="btn-cyber-primary text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Upload Document</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${docs.map(d => `
              <div class="surface-card p-4 space-y-2.5 border border-outline hover:border-primary/40 transition-all flex flex-col justify-between">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">${d.file_type}</span>
                    <span class="text-[10px] text-muted-text font-mono">${(d.timestamp || '').split(' ')[0]}</span>
                  </div>
                  <div class="text-xs font-bold text-white">${d.title}</div>
                  <div class="text-[11px] text-on-surface-variant line-clamp-2">${d.raw_text || 'No text preview.'}</div>
                </div>

                <div class="pt-2 border-t border-outline/50 space-y-1 text-[10px] font-mono text-muted-text">
                  <div class="flex items-center justify-between">
                    <span>SHA-256: ${(d.sha256_hash || 'SHA256HASH').substring(0, 16)}...</span>
                    <span class="text-intel-green font-semibold">${d.extracted_entities_count || 0} Entities</span>
                  </div>
                  <div class="text-right">
                    <button onclick="window.SiperApp.navigate('evidence', { docId: '${d.id}', caseId: '${c.id}' })" class="text-primary hover:underline font-semibold text-[11px]">
                      Open Evidence Inspection →
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>

          ${docs.length === 0 ? `
            <div class="surface-card p-12 text-center space-y-3">
              <span class="material-symbols-outlined text-4xl text-muted-text">description</span>
              <div class="text-xs text-on-surface-variant font-mono">No documents attached to this case file yet.</div>
              <button onclick="window.SiperApp.navigate('ingestion', { caseId: '${c.id}' })" class="btn-cyber-primary text-xs font-bold px-4 py-2 inline-flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Ingest Primary Evidence</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 7. TIMELINE TAB
    if (tab === "timeline") {
      const timeline = data.timeline || [];

      return `
        <div class="surface-card p-6 space-y-6">
          <div class="border-b border-outline pb-3">
            <h3 class="text-sm font-bold text-white font-mono">Chronological Operation Timeline</h3>
            <p class="text-xs text-on-surface-variant">Time-sequenced event trail reconstructed from telecommunications, banking, and field operations.</p>
          </div>

          <div class="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline">
            ${timeline.map(e => `
              <div class="relative group">
                <span class="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-primary ring-4 ring-surface"></span>
                <div class="p-3.5 rounded-lg bg-surface-container border border-outline space-y-1 hover:border-primary/40 transition-colors">
                  <div class="flex items-center justify-between text-[11px] font-mono">
                    <span class="text-primary font-bold">${e.timestamp}</span>
                    <span class="text-[10px] uppercase px-1.5 py-0.2 rounded bg-surface text-muted-text border border-outline">${e.event_type}</span>
                  </div>
                  <div class="text-xs font-bold text-white">${e.title}</div>
                  <div class="text-[11px] text-on-surface-variant">${e.description || ''}</div>
                </div>
              </div>
            `).join("")}

            ${timeline.length === 0 ? `
              <div class="text-xs text-muted-text text-center py-6 font-mono">No timeline events recorded.</div>
            ` : ''}
          </div>
        </div>
      `;
    }

    return `<div class="p-6 text-center text-on-surface-variant text-xs">Viewing ${tab} tab content.</div>`;
  },

  // -------------------------------------------------------------
  // NEW CASE MODAL (Section 6)
  // -------------------------------------------------------------
  openCreateModal() {
    this.state.isCreating = true;
    this.state.newCaseForm = {
      case_id: `CASE-${Math.floor(10000 + Math.random() * 90000)}`,
      title: "",
      description: "",
      case_type: "Organized Crime",
      priority: "HIGH",
      assigned_investigator: (window.SiperApp.state.user && window.SiperApp.state.user.name) || "Investigator-7",
      location: "National Jurisdiction",
      date: new Date().toISOString().split("T")[0],
      tags: "Active, PS-26189"
    };
    this.render();
  },

  closeCreateModal() {
    this.state.isCreating = false;
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) modalContainer.innerHTML = "";
    this.render();
  },

  renderCreateModal() {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;
    const form = this.state.newCaseForm;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-surface border border-outline-strong rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-outline bg-surface-container flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[20px]">add_circle</span>
              </div>
              <div>
                <div class="text-[10px] uppercase font-mono font-bold text-primary tracking-wider">New Investigation Authorization</div>
                <h2 class="text-base font-bold text-white font-mono">Create Case File</h2>
              </div>
            </div>
            <button onclick="window.SiperCasesView.closeCreateModal()" class="p-1 rounded text-on-surface-variant hover:text-white transition-colors">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form id="new-case-form" onsubmit="event.preventDefault(); window.SiperCasesView.submitNewCase();" class="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Case ID -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Case ID <span class="text-primary">*</span>
                </label>
                <input type="text" id="form-case-id" value="${form.case_id}" required
                       class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white font-mono outline-none" />
              </div>

              <!-- Case Type -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Case Type <span class="text-primary">*</span>
                </label>
                <select id="form-case-type" class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none">
                  <option value="Organized Crime" ${form.case_type === 'Organized Crime' ? 'selected' : ''}>Organized Crime</option>
                  <option value="Cyber Crime" ${form.case_type === 'Cyber Crime' ? 'selected' : ''}>Cyber Crime</option>
                  <option value="Financial Crime" ${form.case_type === 'Financial Crime' ? 'selected' : ''}>Financial Crime</option>
                  <option value="Drug Distribution" ${form.case_type === 'Drug Distribution' ? 'selected' : ''}>Drug Distribution</option>
                  <option value="Cross-Border Crime" ${form.case_type === 'Cross-Border Crime' ? 'selected' : ''}>Cross-Border Crime</option>
                  <option value="Other" ${form.case_type === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Priority <span class="text-primary">*</span>
                </label>
                <select id="form-priority" class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none">
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH" selected>High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <!-- Case Title -->
            <div>
              <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Case Title <span class="text-critical">* (Required)</span>
              </label>
              <input type="text" id="form-title" value="${form.title}" placeholder="e.g. Organized Cyber-Financial Fraud & Drug Distribution Syndicate" required
                     class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3.5 py-2 text-xs text-white outline-none" />
            </div>

            <!-- Case Description -->
            <div>
              <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                Case Description <span class="text-critical">* (Required)</span>
              </label>
              <textarea id="form-description" rows="3" placeholder="Describe suspected network topology, known syndicate leads, and investigation scope..." required
                        class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3.5 py-2 text-xs text-white outline-none leading-relaxed">${form.description}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Assigned Investigator -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Assigned Investigator <span class="text-primary">*</span>
                </label>
                <input type="text" id="form-investigator" value="${form.assigned_investigator}" required
                       class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none" />
              </div>

              <!-- Location -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Location / Jurisdiction <span class="text-primary">*</span>
                </label>
                <input type="text" id="form-location" value="${form.location}" placeholder="e.g. Cuttack, Kolkata Corridor" required
                       class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Date -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Date
                </label>
                <input type="date" id="form-date" value="${form.date}"
                       class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none font-mono" />
              </div>

              <!-- Tags -->
              <div>
                <label class="block font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                  Tags (comma separated)
                </label>
                <input type="text" id="form-tags" value="${form.tags}" placeholder="e.g. Narcotics, Cyber Fraud, Hawala"
                       class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg px-3 py-2 text-xs text-white outline-none" />
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="p-4 border-t border-outline bg-surface-container -mx-6 -mb-6 mt-6 flex items-center justify-end gap-3">
              <button type="button" onclick="window.SiperCasesView.closeCreateModal()" class="btn-cyber-secondary px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" ${this.state.saving ? 'disabled' : ''} class="bg-intel-green hover:brightness-110 text-[#031018] text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,160,0.3)] transition-all disabled:opacity-50">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                <span>${this.state.saving ? 'Creating Case...' : 'Create Case'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    `;
  },

  async submitNewCase() {
    const titleEl = document.getElementById("form-title");
    const descEl = document.getElementById("form-description");
    const idEl = document.getElementById("form-case-id");
    const typeEl = document.getElementById("form-case-type");
    const priorityEl = document.getElementById("form-priority");
    const invEl = document.getElementById("form-investigator");
    const locEl = document.getElementById("form-location");
    const dateEl = document.getElementById("form-date");
    const tagsEl = document.getElementById("form-tags");

    const title = (titleEl?.value || "").trim();
    const description = (descEl?.value || "").trim();

    if (!title) {
      window.SiperApp.showToast("Case Title is required.", "error");
      titleEl?.focus();
      return;
    }
    if (!description) {
      window.SiperApp.showToast("Case Description is required.", "error");
      descEl?.focus();
      return;
    }

    const payload = {
      case_id: idEl?.value.trim() || `CASE-${Math.floor(10000 + Math.random() * 90000)}`,
      title,
      description,
      case_type: typeEl?.value || "Organized Crime",
      priority: priorityEl?.value || "HIGH",
      assigned_investigator: invEl?.value.trim() || "Investigator-7",
      location: locEl?.value.trim() || "National Jurisdiction",
      date: dateEl?.value ? `${dateEl.value} 10:00:00` : null,
      tags: tagsEl?.value ? tagsEl.value.split(",").map(t => t.trim()) : ["Active"]
    };

    this.state.saving = true;
    try {
      const res = await window.SiperApp.api.post("/cases", payload);
      if (res.success) {
        this.closeCreateModal();
        window.SiperApp.showToast(`Case ${res.case_id} authorized and saved to database.`, "success");
        await this.loadCases();
      } else {
        window.SiperApp.showToast(res.message || "Failed to create case.", "error");
      }
    } catch (e) {
      console.error("Error creating case:", e);
      window.SiperApp.showToast("Network error creating case.", "error");
    } finally {
      this.state.saving = false;
    }
  },

  promptStatusChange(caseId, currentStatus) {
    const statuses = ["ACTIVE", "UNDER INVESTIGATION", "CLOSED", "ARCHIVED"];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    this.updateCaseStatus(caseId, nextStatus);
  },

  // -------------------------------------------------------------
  // CONTROLS & EVENT HANDLERS
  // -------------------------------------------------------------
  switchTab(tab) {
    if (this.state.activeCase) {
      this.loadCaseDetail(this.state.activeCase.id, tab);
    }
  },

  setEntityFilter(type) {
    this.state.entityFilterType = type;
    this.render();
  },

  backToList() {
    this.state.activeCase = null;
    this.loadCases();
  },

  focusSearch() {
    const input = document.getElementById("cases-search-input");
    if (input) {
      input.focus();
      input.select();
    }
  },

  handleSearchInput(val) {
    this.state.search = val;
    this.loadCases();
  },

  handleStatusChange(val) {
    this.state.statusFilter = val;
    this.loadCases();
  },

  handlePriorityChange(val) {
    this.state.priorityFilter = val;
    this.loadCases();
  },

  handleTypeChange(val) {
    this.state.typeFilter = val;
    this.loadCases();
  },

  resetFilters() {
    this.state.search = "";
    this.state.statusFilter = "ALL";
    this.state.priorityFilter = "ALL";
    this.state.typeFilter = "ALL";
    this.loadCases();
  }
};
