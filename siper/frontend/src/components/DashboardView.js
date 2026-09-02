/**
 * SIPER Investigator Dashboard View (DASH-01)
 * Cyber-Intelligence Command Center Overview conforming to SIH PS 26189.
 */
window.SiperDashboardView = {
  data: {
    kpis: [],
    cases: [],
    alerts: [],
    network: { nodes: [], links: [] },
    loading: true
  },

  async init() {
    this.data.loading = true;
    try {
      const [kpisRes, casesRes, alertsRes, networkRes] = await Promise.all([
        window.SiperApp.api.get("/dashboard/kpis"),
        window.SiperApp.api.get("/dashboard/recent-cases"),
        window.SiperApp.api.get("/dashboard/recent-alerts"),
        window.SiperApp.api.get("/dashboard/network-snapshot")
      ]);
      this.data.kpis = kpisRes.kpis || [];
      this.data.cases = casesRes.cases || [];
      this.data.alerts = alertsRes.alerts || [];
      this.data.network = networkRes || { nodes: [], links: [] };
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      this.data.loading = false;
      this.renderView();
      this.initMiniGraphCanvas();
    }
  },

  renderView() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();
  },

  renderHtml() {
    if (this.data.loading) {
      return `
        <div class="p-8 flex items-center justify-center h-full">
          <div class="text-center space-y-3">
            <span class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
            <div class="text-xs text-on-surface-variant font-mono">Connecting to Intelligence Grid...</div>
          </div>
        </div>
      `;
    }

    const kpiColorConfig = {
      active_cases: { accent: "text-primary", border: "border-primary/30", glow: "shadow-[0_0_15px_rgba(0,200,255,0.1)]", iconColor: "text-primary" },
      tracked_entities: { accent: "text-intel-green", border: "border-intel-green/30", glow: "shadow-[0_0_15px_rgba(0,229,160,0.1)]", iconColor: "text-intel-green" },
      high_risk: { accent: "text-critical", border: "border-critical/30", glow: "shadow-[0_0_15px_rgba(255,77,103,0.1)]", iconColor: "text-critical" },
      patterns_detected: { accent: "text-warning", border: "border-warning/30", glow: "shadow-[0_0_15px_rgba(255,176,32,0.1)]", iconColor: "text-warning" }
    };

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Header Banner -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline pb-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Investigator Intelligence Dashboard
              <span class="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono font-bold">PS-26189</span>
            </h1>
            <p class="text-xs text-on-surface-variant mt-1">Multi-source analytical decision support and criminal network tracking overview.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.SiperCasesView.openCreateWizard ? window.SiperCasesView.openCreateWizard() : window.SiperApp.navigate('cases', { create: true })" 
                    class="btn-cyber-primary text-xs font-bold px-4 py-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Initiate New Case</span>
            </button>
            <button onclick="window.SiperApp.navigate('graph')" 
                    class="btn-cyber-secondary text-xs font-semibold px-4 py-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary">hub</span>
              <span>Open Graph Explorer</span>
            </button>
          </div>
        </div>

        <!-- 1. KPI Cards Row (4 Cards conforming to Section 6) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${this.data.kpis.map(kpi => {
            const cfg = kpiColorConfig[kpi.id] || { accent: "text-primary", border: "border-outline", glow: "", iconColor: "text-primary" };
            return `
              <div class="surface-card p-5 relative overflow-hidden group hover:border-primary/50 cursor-pointer transition-all">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-muted-text font-mono">${kpi.label}</span>
                  <span class="material-symbols-outlined text-[22px] ${cfg.iconColor}">${kpi.icon}</span>
                </div>
                <div class="text-3xl font-black text-white tracking-tight mt-2.5 font-mono">${kpi.value}</div>
                <div class="text-[11px] text-on-surface-variant mt-2.5 flex items-center gap-1.5 font-medium">
                  <span class="material-symbols-outlined text-sm ${cfg.accent}">trending_up</span>
                  <span class="${cfg.accent} font-mono font-semibold">${kpi.trend}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- 2. Main Two-Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Column: Active Cases (7 cols) -->
          <div class="lg:col-span-7 surface-card p-5 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">folder_shared</span>
                <h2 class="text-sm font-bold text-white uppercase tracking-wide font-mono">Active Case Operations</h2>
              </div>
              <button onclick="window.SiperApp.navigate('cases')" class="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                <span>View All (${this.data.cases.length})</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div class="space-y-2.5 flex-1">
              ${this.data.cases.map(c => `
                <div onclick="window.SiperApp.navigate('case-detail', { caseId: '${c.id}' })"
                     class="case-card p-3.5 bg-surface-container hover:bg-surface-container-high border border-outline hover:border-primary/40 cursor-pointer transition-all flex items-center justify-between group">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-xs font-bold text-primary">${c.id}</span>
                      <span class="text-xs font-semibold text-white group-hover:text-primary transition-colors">${c.title}</span>
                    </div>
                    <div class="text-[11px] text-on-surface-variant line-clamp-1">${c.description || "No description provided."}</div>
                    <div class="text-[10px] text-muted-text flex items-center gap-3 mt-1 font-mono">
                      <span>👤 ${c.owner}</span>
                      <span>• 🔗 ${c.entity_count} Entities</span>
                      <span>• ⚡ ${c.findings_count} Findings</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-1.5 shrink-0">
                    ${window.SiperApp.renderStatusIndicator(c.priority)}
                    <span class="text-[10px] text-muted-text font-mono">${(c.updated_at || '').split(' ')[0]}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Right Column: Recent AI Alerts & Risk Signals (5 cols) -->
          <div class="lg:col-span-5 surface-card p-5 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-warning text-[20px]">insights</span>
                <h2 class="text-sm font-bold text-white uppercase tracking-wide font-mono">Recent AI Risk Signals</h2>
              </div>
              <button onclick="window.SiperApp.navigate('findings')" class="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                <span>All Findings</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div class="space-y-3 flex-1">
              ${this.data.alerts.slice(0, 4).map(alert => `
                <div class="finding-card p-3.5 rounded-lg bg-surface-container border border-outline hover:border-warning/40 transition-all space-y-2 cursor-pointer"
                     onclick="window.SiperApp.navigate('findings', { findingId: '${alert.id}' })">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ai-tag-pattern">
                      PATTERN DETECTED
                    </span>
                    <span class="text-[10px] font-mono text-intel-green font-bold">${Math.round(alert.confidence * 100)}% CONFIDENCE</span>
                  </div>
                  <div class="text-xs font-semibold text-white">${alert.title}</div>
                  <div class="text-[11px] text-on-surface-variant line-clamp-2">
                    ${alert.supporting_evidence && alert.supporting_evidence.length ? alert.supporting_evidence[0] : alert.investigator_notes || ''}
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-outline/50 text-[10px]">
                    <span class="text-muted-text">Affected: <strong class="text-on-surface">${alert.affected_entities.slice(0, 2).join(", ")}</strong></span>
                    <button class="text-primary hover:underline font-semibold flex items-center gap-0.5">
                      <span>Review Finding</span>
                      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

        <!-- 3. Bottom Section: Mini Network Snapshot Canvas -->
        <div class="surface-card p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">hub</span>
                <h2 class="text-sm font-bold text-white uppercase tracking-wide font-mono">Active Network Topology Snapshot</h2>
              </div>
              <p class="text-xs text-on-surface-variant mt-0.5">Interactive structural topology highlighting high-betweenness bridge entities.</p>
            </div>
            <button onclick="window.SiperApp.navigate('graph')" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-2">
              <span>Full Interactive Graph Workspace</span>
              <span class="material-symbols-outlined text-[16px] text-primary">open_in_new</span>
            </button>
          </div>

          <div class="h-64 w-full bg-brand-bg rounded-lg border border-outline relative overflow-hidden graph-grid-bg">
            <canvas id="mini-graph-canvas" class="w-full h-full cursor-grab"></canvas>
            
            <!-- Quick Overlay Legend -->
            <div class="absolute bottom-3 left-3 bg-surface/90 backdrop-blur border border-outline rounded-lg px-3 py-1.5 flex items-center gap-3 text-[10px] font-mono">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#00C8FF] shadow-[0_0_4px_#00C8FF]"></span> Person</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_4px_#38BDF8]"></span> Phone</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#FF8A3D] shadow-[0_0_4px_#FF8A3D]"></span> Vehicle</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#2DD4BF] shadow-[0_0_4px_#2DD4BF]"></span> Org</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#FFB020] shadow-[0_0_4px_#FFB020]"></span> Account</span>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  initMiniGraphCanvas() {
    const canvas = document.getElementById("mini-graph-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const nodes = this.data.network.nodes || [];
    const links = this.data.network.links || [];

    if (nodes.length === 0) return;

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const typeColorMap = {
      Person: "#00C8FF",
      Phone: "#38BDF8",
      Vehicle: "#FF8A3D",
      Location: "#00E5A0",
      Organization: "#2DD4BF",
      FinancialAccount: "#FFB020",
      Incident: "#FF4D67"
    };

    const nodePositions = {};
    nodes.forEach((n, i) => {
      if (n.label === "Ravi Kumar" || i === 0) {
        nodePositions[n.id] = { x: centerX, y: centerY };
      } else {
        const angle = (i / (nodes.length - 1)) * 2 * Math.PI;
        const dist = 80 + (i % 3) * 35;
        nodePositions[n.id] = {
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist
        };
      }
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw links
      ctx.strokeStyle = "rgba(27, 52, 77, 0.8)";
      ctx.lineWidth = 1.5;
      links.forEach(l => {
        const u = nodePositions[l.source];
        const v = nodePositions[l.target];
        if (u && v) {
          ctx.beginPath();
          ctx.moveTo(u.x, u.y);
          ctx.lineTo(v.x, v.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(n => {
        const pos = nodePositions[n.id];
        if (!pos) return;

        const isCentral = n.label === "Ravi Kumar";
        const radius = isCentral ? 14 : 7;
        const color = typeColorMap[n.type] || n.color || "#00C8FF";

        if (isCentral) {
          // Cyber glow effect
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 200, 255, 0.25)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 241, 255, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node text label
        ctx.font = isCentral ? "bold 11px Inter, sans-serif" : "9px Inter, sans-serif";
        ctx.fillStyle = isCentral ? "#FFFFFF" : "#A8BDD1";
        ctx.textAlign = "center";
        ctx.fillText(n.label, pos.x, pos.y + radius + 12);
      });
    };

    render();
  }
};
