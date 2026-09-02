/**
 * SIPER Main Application Orchestrator
 * Coordinates routing, authentication state, API communication, and UI rendering.
 */
window.SiperApp = {
  state: {
    token: localStorage.getItem("siper_token") || null,
    user: null,
    activeView: "dashboard",
    viewParams: {}
  },

  // API HTTP Client
  api: {
    async request(method, path, data = null) {
      const headers = { "Content-Type": "application/json" };
      if (window.SiperApp.state.token) {
        headers["Authorization"] = `Bearer ${window.SiperApp.state.token}`;
      }

      const options = { method, headers };
      if (data && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`/api/v1${path}`, options);
      if (response.status === 401 && !path.startsWith("/auth/login")) {
        window.SiperApp.logout();
        throw new Error("Session expired");
      }

      return await response.json();
    },

    get(path) {
      return this.request("GET", path);
    },

    post(path, data) {
      return this.request("POST", path, data);
    },

    put(path, data) {
      return this.request("PUT", path, data);
    },

    delete(path) {
      return this.request("DELETE", path);
    }
  },

  async init() {
    this.setupGlobalKeyboardShortcuts();

    // Check existing session
    if (this.state.token) {
      try {
        const res = await this.api.get("/auth/me");
        if (res.user) {
          this.state.user = res.user;
        } else {
          this.state.token = null;
          localStorage.removeItem("siper_token");
        }
      } catch (e) {
        this.state.token = null;
        localStorage.removeItem("siper_token");
      }
    }

    // Read URL hash if present
    const hash = window.location.hash.replace("#", "");
    if (hash && this.state.token) {
      this.state.activeView = hash;
    }

    this.render();
  },

  render() {
    const appEl = document.getElementById("app");
    if (!appEl) return;

    if (!this.state.token || !this.state.user) {
      appEl.innerHTML = window.SiperLoginView.render();
      return;
    }

    // Render Shell Layout
    appEl.innerHTML = window.SiperAppShell.render(
      this.state.activeView,
      this.state.user,
      this.navigate.bind(this),
      this.switchRole.bind(this),
      this.logout.bind(this),
      this.openSearch.bind(this)
    );

    // Initialize active view content
    this.mountActiveView();
  },

  mountActiveView() {
    const view = this.state.activeView;
    const params = this.state.viewParams;

    if (view === "dashboard") {
      window.SiperDashboardView.init(params);
    } else if (view === "cases" || view === "case-detail") {
      window.SiperCasesView.init(params);
    } else if (view === "entities") {
      window.SiperEntitySearchView.init(params);
    } else if (view === "entity-profile") {
      window.SiperEntityProfileView.init(params);
    } else if (view === "graph") {
      window.SiperGraphExplorerView.init(params);
    } else if (view === "ingestion") {
      window.SiperDataIngestionView.init(params);
    } else if (view === "findings") {
      window.SiperAiFindingsView.init(params);
    } else if (view === "evidence") {
      window.SiperEvidenceWorkspaceView.init(params);
    } else if (view === "reports") {
      window.SiperReportBuilderView.init(params);
    } else if (view === "audit") {
      window.SiperAuditLogView.init(params);
    } else if (view === "settings") {
      window.SiperSettingsView.init(params);
    } else {
      window.SiperDashboardView.init(params);
    }
  },

  navigate(viewId, params = {}) {
    this.state.activeView = viewId;
    this.state.viewParams = params;
    window.location.hash = viewId;
    this.render();
  },

  setAuth(token, user) {
    this.state.token = token;
    this.state.user = user;
    localStorage.setItem("siper_token", token);
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem("siper_token");
    this.showToast("Signed out from operational terminal.", "info");
    this.render();
  },

  async switchRole(newRole) {
    try {
      const res = await this.api.post("/auth/switch-role", { role: newRole });
      if (res.success && res.token) {
        this.setAuth(res.token, res.user);
        this.showToast(`Switched active terminal role to ${newRole}.`, "success");
        this.render();
      }
    } catch (e) {
      this.showToast("Failed to switch role.", "error");
    }
  },

  openSearch() {
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
      modalContainer.innerHTML = window.SiperGlobalSearchModal.render();
      const input = document.getElementById("global-search-input");
      if (input) input.focus();
    }
  },

  setupGlobalKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // ⌘K / Ctrl+K for Global Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.openSearch();
      }
      // Escape closes modal
      if (e.key === "Escape") {
        const modalContainer = document.getElementById("modal-container");
        if (modalContainer) modalContainer.innerHTML = "";
      }
    });
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toastId = "toast_" + Date.now();
    const colors = {
      success: "bg-surface-container border-intel-green text-intel-green shadow-[0_0_20px_rgba(0,229,160,0.2)]",
      error: "bg-surface-container border-critical text-critical shadow-[0_0_20px_rgba(255,77,103,0.2)]",
      warning: "bg-surface-container border-warning text-warning shadow-[0_0_20px_rgba(255,176,32,0.2)]",
      info: "bg-surface-container border-primary text-primary shadow-[0_0_20px_rgba(0,200,255,0.2)]"
    };

    const icons = {
      success: "check_circle",
      error: "error",
      warning: "warning",
      info: "info"
    };

    const toastEl = document.createElement("div");
    toastEl.id = toastId;
    toastEl.className = `p-3 rounded-lg border backdrop-blur-md flex items-center gap-2.5 text-xs pointer-events-auto transition-all transform duration-200 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toastEl.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">${icons[type] || 'info'}</span>
      <span class="text-on-surface font-medium">${message}</span>
    `;

    container.appendChild(toastEl);

    requestAnimationFrame(() => {
      toastEl.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toastEl.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toastEl.remove(), 200);
    }, 3500);
  },

  // Badge Render Helpers conforming to Cyber-Intelligence System
  renderEntityTypeBadge(type) {
    const classMap = {
      Person: "badge-person",
      Phone: "badge-phone",
      Vehicle: "badge-vehicle",
      Location: "badge-location",
      Organization: "badge-organization",
      FinancialAccount: "badge-financial",
      Incident: "badge-incident"
    };
    const c = classMap[type] || "bg-surface-container text-on-surface-variant border border-outline";
    return `<span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${c}">${type}</span>`;
  },

  renderRiskBadge(level, score) {
    const isHigh = level === "HIGH" || level === "CRITICAL";
    const isMed = level === "MEDIUM" || level === "ELEVATED";
    const cls = isHigh ? "risk-badge-high" : isMed ? "risk-badge-medium" : "risk-badge-low";
    const label = isHigh ? "HIGH RISK" : isMed ? "ELEVATED" : "LOW RISK";
    return `
      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${cls}">
        <span>${score ? score + ' · ' : ''}${label}</span>
      </span>
    `;
  },

  renderStatusIndicator(status) {
    const s = (status || "").toUpperCase();
    if (s === "ACTIVE") {
      return `<span class="status-pill status-active"><span class="status-dot"></span>ACTIVE</span>`;
    } else if (s === "UNDER INVESTIGATION" || s === "UNDER_REVIEW" || s === "MONITORING") {
      return `<span class="status-pill status-monitoring"><span class="status-dot"></span>${s === 'UNDER INVESTIGATION' ? 'UNDER INVESTIGATION' : 'UNDER REVIEW'}</span>`;
    } else if (s === "WARNING" || s === "ELEVATED" || s === "MEDIUM") {
      return `<span class="status-pill status-warning"><span class="status-dot"></span>${s}</span>`;
    } else if (s === "HIGH" || s === "HIGH_RISK") {
      return `<span class="status-pill status-high"><span class="status-dot"></span>HIGH</span>`;
    } else if (s === "CRITICAL") {
      return `<span class="status-pill status-critical"><span class="status-dot"></span>CRITICAL</span>`;
    } else if (s === "CLOSED") {
      return `<span class="status-pill bg-slate-800/80 text-slate-400 border border-slate-700/60"><span class="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block mr-1"></span>CLOSED</span>`;
    } else if (s === "ARCHIVED") {
      return `<span class="status-pill bg-purple-950/40 text-purple-300 border border-purple-800/40"><span class="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mr-1"></span>ARCHIVED</span>`;
    } else if (s === "LOW") {
      return `<span class="status-pill status-active"><span class="status-dot"></span>LOW</span>`;
    }
    return `<span class="status-pill status-monitoring"><span class="status-dot"></span>${status}</span>`;
  }
};

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.SiperApp.init();
});
