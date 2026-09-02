/**
 * SIPER Entity Profile Dossier View (ENTITY-01)
 * Displays deep entity intelligence, network centrality, timeline, financial ledger, and AI Insights.
 */
window.SiperEntityProfileView = {
  state: {
    entityId: null,
    profileData: null,
    activeSubTab: "connections", // connections | timeline | financial | documents
    loading: true
  },

  async init(params = {}) {
    this.state.entityId = params.entityId || "ent_p_001";
    this.state.activeSubTab = params.subTab || "connections";
    this.state.loading = true;
    this.render();

    try {
      const res = await window.SiperApp.api.get(`/entities/${this.state.entityId}/profile`);
      this.state.profileData = res;
    } catch (e) {
      console.error("Error loading entity profile:", e);
    } finally {
      this.state.loading = false;
      this.render();
      if (this.state.activeSubTab === "connections") {
        this.initSubNetworkCanvas();
      }
    }
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();
  },

  renderHtml() {
    if (this.state.loading || !this.state.profileData) {
      return `
        <div class="p-8 flex items-center justify-center h-full">
          <div class="text-center space-y-3">
            <span class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
            <div class="text-xs text-on-surface-variant font-mono">Loading Entity Intelligence Dossier...</div>
          </div>
        </div>
      `;
    }

    const { entity, connections, timeline, ai_insights, financial_records, source_documents } = this.state.profileData;
    const identifiers = entity.identifiers || {};
    const subTab = this.state.activeSubTab;

    return `
      <div class="p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        <!-- Navigation Back -->
        <div class="flex items-center justify-between">
          <button onclick="window.SiperApp.navigate('entities')" class="text-xs text-on-surface-variant hover:text-white flex items-center gap-1.5 transition-colors font-mono">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Entity Repository</span>
          </button>
          <div class="flex items-center gap-2">
            <button onclick="window.SiperApp.navigate('graph', { entityId: '${entity.id}' })" class="btn-cyber-secondary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">hub</span>
              <span>Open in Graph Explorer</span>
            </button>
            <button onclick="window.print()" class="btn-cyber-primary text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">print</span>
              <span>Export Dossier (PDF)</span>
            </button>
          </div>
        </div>

        <!-- Entity Dossier Hero Banner -->
        <div class="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-primary/40">
          <div class="flex items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-surface-container-highest border border-outline overflow-hidden shrink-0 shadow-lg relative">
              ${entity.primary_photo ? `
                <img src="${entity.primary_photo}" alt="${entity.canonical_name}" class="w-full h-full object-cover" />
              ` : `
                <div class="w-full h-full flex items-center justify-center text-primary text-3xl font-black font-mono shadow-inner">
                  ${entity.canonical_name.substring(0, 2).toUpperCase()}
                </div>
              `}
              <span class="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-intel-green border-2 border-surface shadow-[0_0_6px_#00E5A0]"></span>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-bold text-white tracking-tight font-mono">${entity.canonical_name}</h1>
                ${window.SiperApp.renderEntityTypeBadge(entity.type)}
                ${window.SiperApp.renderRiskBadge(entity.risk_level, entity.risk_score)}
              </div>

              ${entity.aliases && entity.aliases.length ? `
                <div class="text-xs text-on-surface-variant flex items-center gap-2 font-mono">
                  <span class="font-semibold text-white">Known Aliases:</span>
                  <span class="text-primary font-bold">${entity.aliases.join(", ")}</span>
                </div>
              ` : ''}

              <div class="text-xs text-on-surface-variant flex flex-wrap items-center gap-4 pt-1 font-mono">
                ${identifiers.phone ? `<span>📞 +91-${identifiers.phone}</span>` : ''}
                ${identifiers.vehicle_plate ? `<span>🚗 ${identifiers.vehicle_plate}</span>` : ''}
                ${identifiers.role ? `<span class="text-white">🏷️ ${identifiers.role}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Quick Metrics Badges (Section 6 & 14 Compliance) -->
          <div class="grid grid-cols-3 gap-3 shrink-0">
            <div class="p-3 rounded-xl bg-surface-container border border-outline text-center hover:border-warning/50 transition-colors">
              <div class="text-[9px] uppercase font-mono font-bold text-muted-text">Brokerage</div>
              <div class="text-lg font-black text-warning mt-0.5 font-mono">${entity.betweenness_centrality || 0}</div>
            </div>
            <div class="p-3 rounded-xl bg-surface-container border border-outline text-center hover:border-primary/50 transition-colors">
              <div class="text-[9px] uppercase font-mono font-bold text-muted-text">PageRank</div>
              <div class="text-lg font-black text-primary mt-0.5 font-mono">${entity.pagerank || 0}</div>
            </div>
            <div class="p-3 rounded-xl bg-surface-container border border-outline text-center hover:border-intel-green/50 transition-colors">
              <div class="text-[9px] uppercase font-mono font-bold text-muted-text">Connections</div>
              <div class="text-lg font-black text-white mt-0.5 font-mono">${connections.length}</div>
            </div>
          </div>
        </div>

        <!-- 2-Column Main Dossier Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left 4 Columns: Detailed Attributes & AI Insights -->
          <div class="lg:col-span-4 space-y-6">
            
            <!-- Identifiers & Attributes -->
            <div class="surface-card p-5 space-y-3">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">Identified Attributes</h3>
              <div class="space-y-2 text-xs divide-y divide-outline/40">
                ${Object.entries(identifiers).map(([k, v]) => `
                  <div class="pt-2 flex justify-between gap-2">
                    <span class="text-on-surface-variant capitalize font-mono text-[11px]">${k.replace(/_/g, " ")}:</span>
                    <span class="font-medium text-white text-right break-all">${v}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- AI Explainability Findings (Section 10 Compliance) -->
            <div class="surface-card p-5 border border-primary/40 space-y-3">
              <div class="flex items-center justify-between text-primary font-mono">
                <div class="flex items-center gap-1.5 font-bold text-xs">
                  <span class="material-symbols-outlined text-[18px]">psychology</span>
                  <span>AI ANALYSIS SIGNALS</span>
                </div>
                <span class="text-[10px] text-intel-green font-bold">${ai_insights.length} Signals</span>
              </div>

              <div class="space-y-2.5">
                ${ai_insights.map(ins => `
                  <div class="finding-card p-3 rounded-lg bg-surface-container border border-outline hover:border-primary/40 transition-all space-y-1.5 cursor-pointer">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ai-tag-pattern">${ins.type}</span>
                      <span class="text-[10px] text-intel-green font-mono font-bold">${Math.round(ins.confidence * 100)}% CONF.</span>
                    </div>
                    <div class="text-xs font-bold text-white">${ins.title}</div>
                    <div class="text-[11px] text-on-surface-variant">${ins.investigator_notes || ''}</div>
                  </div>
                `).join("")}
              </div>
            </div>

          </div>

          <!-- Right 8 Columns: Tabbed Deep Exploration Workspace -->
          <div class="lg:col-span-8 surface-card flex flex-col overflow-hidden">
            
            <!-- Sub-Tabs Bar -->
            <div class="bg-surface-container border-b border-outline p-2 flex items-center gap-1 overflow-x-auto">
              <button onclick="window.SiperEntityProfileView.switchSubTab('connections')" class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${subTab === 'connections' ? 'bg-primary/15 text-white font-bold border border-primary/40 shadow-[0_0_10px_rgba(0,200,255,0.15)]' : 'text-on-surface-variant hover:text-white'}">
                <span class="material-symbols-outlined text-[16px] ${subTab === 'connections' ? 'text-primary' : 'text-muted-text'}">hub</span>
                <span>Connections (${connections.length})</span>
              </button>
              <button onclick="window.SiperEntityProfileView.switchSubTab('timeline')" class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${subTab === 'timeline' ? 'bg-primary/15 text-white font-bold border border-primary/40 shadow-[0_0_10px_rgba(0,200,255,0.15)]' : 'text-on-surface-variant hover:text-white'}">
                <span class="material-symbols-outlined text-[16px] ${subTab === 'timeline' ? 'text-primary' : 'text-muted-text'}">timeline</span>
                <span>Chronological Events (${timeline.length})</span>
              </button>
              <button onclick="window.SiperEntityProfileView.switchSubTab('financial')" class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${subTab === 'financial' ? 'bg-primary/15 text-white font-bold border border-primary/40 shadow-[0_0_10px_rgba(0,200,255,0.15)]' : 'text-on-surface-variant hover:text-white'}">
                <span class="material-symbols-outlined text-[16px] ${subTab === 'financial' ? 'text-primary' : 'text-muted-text'}">account_balance</span>
                <span>Financial Ledger (${financial_records.length})</span>
              </button>
              <button onclick="window.SiperEntityProfileView.switchSubTab('documents')" class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${subTab === 'documents' ? 'bg-primary/15 text-white font-bold border border-primary/40 shadow-[0_0_10px_rgba(0,200,255,0.15)]' : 'text-on-surface-variant hover:text-white'}">
                <span class="material-symbols-outlined text-[16px] ${subTab === 'documents' ? 'text-primary' : 'text-muted-text'}">description</span>
                <span>Source Records (${source_documents.length})</span>
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-5 flex-1 overflow-y-auto">
              ${this.renderSubTabContent(subTab, { connections, timeline, financial_records, source_documents })}
            </div>

          </div>

        </div>

      </div>
    `;
  },

  renderSubTabContent(subTab, { connections, timeline, financial_records, source_documents }) {
    if (subTab === "connections") {
      return `
        <div class="space-y-4">
          <div class="h-64 w-full bg-brand-bg rounded-lg border border-outline relative overflow-hidden graph-grid-bg">
            <canvas id="sub-network-canvas" class="w-full h-full cursor-grab"></canvas>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">Direct Relationship Links</h4>
            <div class="divide-y divide-outline/40 border border-outline rounded-lg overflow-hidden">
              ${connections.map(c => `
                <div class="p-3 bg-surface-container flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-white">${c.target_name}</span>
                      ${window.SiperApp.renderEntityTypeBadge(c.target_type)}
                    </div>
                    <div class="text-[11px] text-on-surface-variant">${c.explanation || ''}</div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="font-mono text-xs font-bold text-primary">${c.type}</div>
                    <div class="text-[10px] font-mono text-emerald-400 font-semibold">${Math.round(c.confidence * 100)}% Confidence</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    } else if (subTab === "timeline") {
      return `
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Chronological Intelligence Feed</h4>
          <div class="relative pl-6 border-l-2 border-outline space-y-6">
            ${timeline.map(t => `
              <div class="relative space-y-1">
                <span class="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface"></span>
                <div class="text-[10px] font-mono text-primary font-bold">${t.timestamp}</div>
                <div class="text-xs font-bold text-white">${t.title}</div>
                <div class="text-[11px] text-on-surface-variant">${t.description || ''}</div>
                <div class="text-[10px] text-on-surface-variant font-mono">Source: <strong>${t.source}</strong></div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else if (subTab === "financial") {
      return `
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Bank & Wire Transactions</h4>
          <div class="divide-y divide-outline/40 border border-outline rounded-lg overflow-hidden text-xs">
            ${financial_records.map(tx => `
              <div class="p-3 bg-surface-container flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white">${tx.sender_name} → ${tx.receiver_name}</div>
                  <div class="text-[10px] text-on-surface-variant font-mono">${tx.timestamp} • ${tx.transaction_type}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-amber-400 font-mono">₹${(tx.amount || 0).toLocaleString()}</div>
                  ${tx.suspicious ? '<span class="text-[9px] uppercase font-bold text-danger">Suspicious Flow</span>' : ''}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else if (subTab === "documents") {
      return `
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Cited Evidence Documents</h4>
          <div class="space-y-2">
            ${source_documents.map(d => `
              <div class="p-3 rounded-lg bg-surface-container border border-outline space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white">${d.title}</span>
                  <span class="text-[10px] font-mono text-on-surface-variant">${d.timestamp}</span>
                </div>
                <div class="text-[11px] text-on-surface-variant">${d.raw_text ? d.raw_text.substring(0, 150) + '...' : ''}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }
  },

  switchSubTab(subTab) {
    this.state.activeSubTab = subTab;
    this.render();
    if (subTab === "connections") {
      this.initSubNetworkCanvas();
    }
  },

  initSubNetworkCanvas() {
    const canvas = document.getElementById("sub-network-canvas");
    if (!canvas || !this.state.profileData) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const connections = this.state.profileData.connections || [];
    const centerEntity = this.state.profileData.entity;

    const typeColors = {
      Person: "#00C8FF",
      Phone: "#38BDF8",
      Vehicle: "#FF8A3D",
      Location: "#00E5A0",
      Organization: "#2DD4BF",
      FinancialAccount: "#FFB020",
      Incident: "#FF4D67"
    };

    // Draw central node + orbiting connections
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Draw links & orbiting nodes
    connections.forEach((c, i) => {
      const angle = (i / Math.max(1, connections.length)) * 2 * Math.PI;
      const dist = 90;
      const nx = cx + Math.cos(angle) * dist;
      const ny = cy + Math.sin(angle) * dist;

      ctx.strokeStyle = "rgba(27, 52, 77, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Satellite node
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fillStyle = typeColors[c.target_type] || '#00C8FF';
      ctx.fill();
      ctx.strokeStyle = "rgba(230, 241, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = "9px Inter, sans-serif";
      ctx.fillStyle = "#A8BDD1";
      ctx.textAlign = "center";
      ctx.fillText(c.target_name, nx, ny + 15);
    });

    // Central Node Glow
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 200, 255, 0.25)";
    ctx.fill();

    // Central Node
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fillStyle = typeColors[centerEntity.type] || "#00C8FF";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(centerEntity.canonical_name, cx, cy + 24);
  }
};
