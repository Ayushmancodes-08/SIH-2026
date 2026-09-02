/**
 * SIPER Security & RBAC Permissions View (SETTINGS-01)
 * Displays role-based access control matrix, authorized operator directory, and security settings.
 */
window.SiperSettingsView = {
  state: {
    users: [],
    roles: [],
    permissions: {},
    loading: true
  },

  async init(params = {}) {
    this.state.loading = true;
    this.render();

    try {
      const [uRes, rRes] = await Promise.all([
        window.SiperApp.api.get("/settings/users"),
        window.SiperApp.api.get("/settings/roles")
      ]);
      this.state.users = uRes.users || [];
      this.state.roles = rRes.roles || [];
      this.state.permissions = rRes.permissions || {};
    } catch (e) {
      console.error("Error loading settings:", e);
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
              Security & Access Control Settings
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">SETTINGS-01</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Role-Based Access Control (RBAC) permissions matrix, user credentials, and session policies.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left 6 Columns: Role Permissions Matrix -->
          <div class="lg:col-span-6 surface-card p-5 space-y-4 flex flex-col">
            <div class="flex items-center justify-between border-b border-outline pb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">admin_panel_settings</span>
                <h2 class="text-sm font-bold text-white font-mono">RBAC Permissions Matrix</h2>
              </div>
              <span class="text-[10px] font-mono text-intel-green font-bold">5 ENFORCED ROLES</span>
            </div>

            <div class="space-y-3 overflow-y-auto flex-1 max-h-[600px] text-xs">
              ${this.state.roles.map(role => {
                const perms = this.state.permissions[role] || [];
                return `
                  <div class="p-4 rounded-xl bg-surface-container border border-outline hover:border-primary/40 transition-all space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-white text-xs font-mono uppercase text-primary">${role}</span>
                      <span class="text-[10px] text-muted-text font-mono font-semibold">${perms.length} Permissions</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      ${perms.map(p => `
                        <span class="text-[10px] font-mono bg-brand-bg text-on-surface-variant px-2 py-0.5 rounded border border-outline">${p}</span>
                      `).join("")}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right 6 Columns: Authorized Operator Users -->
          <div class="lg:col-span-6 surface-card p-5 space-y-4 flex flex-col">
            <div class="flex items-center justify-between border-b border-outline pb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-intel-green text-[20px]">badge</span>
                <h2 class="text-sm font-bold text-white font-mono">Authorized Operators Directory</h2>
              </div>
              <span class="text-[10px] font-mono text-muted-text">${this.state.users.length} Active Accounts</span>
            </div>

            <div class="space-y-2.5 overflow-y-auto flex-1 max-h-[600px] text-xs">
              ${this.state.users.map(u => `
                <div class="p-3.5 rounded-xl bg-surface-container border border-outline hover:border-primary/40 transition-all flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-surface-container-high border border-outline flex items-center justify-center font-bold text-xs text-primary font-mono shadow-[0_0_8px_rgba(0,200,255,0.15)]">
                      ${u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="font-bold text-white text-xs">${u.name}</div>
                      <div class="text-[11px] text-muted-text font-mono">${u.email}</div>
                      <div class="text-[10px] text-primary font-mono mt-0.5">${u.badge_number} • ${u.unit}</div>
                    </div>
                  </div>
                  <span class="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border bg-surface ${
                    u.role === 'ADMIN' ? 'text-critical border-critical/30' :
                    u.role === 'SUPERVISOR' ? 'text-warning border-warning/30' :
                    'text-primary border-primary/30'
                  }">${u.role}</span>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

      </div>
    `;
  }
};
