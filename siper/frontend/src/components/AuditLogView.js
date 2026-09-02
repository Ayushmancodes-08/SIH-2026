/**
 * SIPER Immutable Audit Log View (AUDIT-01)
 * High-density compliance table tracking all searches, profile accesses, graph expansions, and exports.
 */
window.SiperAuditLogView = {
  state: {
    events: [],
    actionFilter: "ALL",
    userFilter: "",
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      let url = "/audit-events?limit=100&";
      if (this.state.actionFilter !== "ALL") url += `action=${this.state.actionFilter}&`;
      if (this.state.userFilter) url += `user=${encodeURIComponent(this.state.userFilter)}&`;

      const res = await window.SiperApp.api.get(url);
      this.state.events = res.audit_events || [];
    } catch (e) {
      console.error("Error loading audit log:", e);
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
    const actionTypes = [
      "ALL", "CREATE_CASE", "CHANGE_CASE_STATUS", "UPDATE_CASE", "ARCHIVE_CASE",
      "VIEW_CASE", "VIEW_ENTITY_PROFILE", "SEARCH_ENTITIES",
      "EXPAND_GRAPH", "SHORTEST_PATH_ANALYSIS", "RUN_AI_PATTERN_PIPELINE",
      "RESOLVE_ENTITY_IDENTITY", "INGEST_DOCUMENT", "GENERATE_REPORT", "SWITCH_ROLE", "LOGIN_SUCCESS"
    ];

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Immutable Investigative Audit Log
              <span class="text-xs px-2 py-0.5 rounded bg-intel-green/15 text-intel-green border border-intel-green/30 font-mono font-bold">AUDIT-01</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Section 65B compliance ledger recording all investigator queries, entity views, graph expansions, and data exports.</p>
          </div>
          <button onclick="window.SiperAuditLogView.exportCSV()" class="btn-cyber-secondary text-xs font-semibold px-4 py-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="surface-card p-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3 text-xs flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-muted-text text-[10px] uppercase font-bold font-mono">Action Type:</span>
              <select onchange="window.SiperAuditLogView.handleActionChange(this.value)" class="bg-brand-bg border border-outline rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary font-mono">
                ${actionTypes.map(at => `<option value="${at}" ${this.state.actionFilter === at ? 'selected' : ''}>${at}</option>`).join("")}
              </select>
            </div>

            <div class="relative max-w-xs w-full">
              <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text text-[16px]">person</span>
              <input type="text"
                     value="${this.state.userFilter}"
                     placeholder="Filter by operator name/ID..."
                     oninput="window.SiperAuditLogView.handleUserFilter(this.value)"
                     class="w-full bg-brand-bg border border-outline rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-muted-text outline-none focus:border-primary transition-all focus:shadow-[0_0_10px_rgba(0,200,255,0.15)] font-mono" />
            </div>
          </div>

          <div class="text-[11px] text-muted-text font-mono">
            Showing <strong class="text-intel-green font-bold">${this.state.events.length}</strong> immutable events
          </div>
        </div>

        <!-- Audit Table -->
        <div class="surface-card overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-container border-b border-outline text-[10px] uppercase tracking-wider text-muted-text font-bold font-mono">
              <tr>
                <th class="py-3 px-4">Timestamp (UTC)</th>
                <th class="py-3 px-4">Operator</th>
                <th class="py-3 px-4">Role</th>
                <th class="py-3 px-4">Action</th>
                <th class="py-3 px-4">Resource Target</th>
                <th class="py-3 px-4 text-center">Result</th>
                <th class="py-3 px-4 text-right">Terminal IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/40 font-mono">
              ${this.state.events.map(ev => `
                <tr class="hover:bg-surface-container-high transition-colors">
                  <td class="py-2.5 px-4 text-muted-text text-[11px]">${ev.timestamp}</td>
                  <td class="py-2.5 px-4 font-bold text-white">${ev.user_name}</td>
                  <td class="py-2.5 px-4">
                    <span class="text-[9px] uppercase px-1.5 py-0.5 rounded border bg-surface ${
                      ev.role === 'ADMIN' ? 'text-critical border-critical/30' :
                      ev.role === 'SUPERVISOR' ? 'text-warning border-warning/30' :
                      ev.role === 'AUDITOR' ? 'text-intel-green border-intel-green/30' :
                      'text-primary border-primary/30'
                    }">${ev.role}</span>
                  </td>
                  <td class="py-2.5 px-4 text-white font-semibold">${ev.action}</td>
                  <td class="py-2.5 px-4 text-on-surface-variant text-[11px]">
                    ${ev.case_id ? `<span class="text-primary font-bold">${ev.case_id}</span> • ` : ''}
                    <span>${ev.resource || 'SYSTEM'}</span>
                  </td>
                  <td class="py-2.5 px-4 text-center">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-intel-green/15 text-intel-green border border-intel-green/30">
                      ${ev.result}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-right text-muted-text text-[11px]">${ev.ip_address || '127.0.0.1'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

      </div>
    `;
  },

  handleActionChange(val) {
    this.state.actionFilter = val;
    this.init();
  },

  handleUserFilter(val) {
    this.state.userFilter = val;
    this.init();
  },

  exportCSV() {
    const rows = [
      ["Timestamp", "Operator", "Role", "Action", "CaseID", "Resource", "Result", "IPAddress"],
      ...this.state.events.map(e => [
        e.timestamp, e.user_name, e.role, e.action, e.case_id || "", e.resource || "", e.result, e.ip_address || ""
      ])
    ];

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIPER_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.SiperApp.showToast("Audit log CSV exported successfully.", "success");
  }
};
