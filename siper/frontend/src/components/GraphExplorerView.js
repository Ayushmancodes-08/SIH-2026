/**
 * SIPER Flagship Graph Explorer Workspace (GRAPH-01)
 * 3-Pane Layout with Interactive Canvas Graph, Dynamic Centrality Sizing, Edge Confidence,
 * Louvain Community Clustering, Timeline Scrubber, Shortest Path, Neighborhood Expansion, and Provenance Drawer.
 */
window.SiperGraphExplorerView = {
  state: {
    nodes: [],
    links: [],
    selectedNode: null,
    selectedLink: null,
    searchQuery: "",
    selectedTypes: new Set(["Person", "Phone", "Vehicle", "Location", "Organization", "FinancialAccount", "Incident"]),
    minConfidence: 0.0,
    layoutMode: "force", // force | circular | hierarchical
    colorMode: "type", // type | community
    shortestPathMode: false,
    pathSource: null,
    pathTarget: null,
    pathResult: null,
    provenanceDrawerOpen: false,
    timelinePlaying: false,
    timelineDay: 30, // 1 to 30
    loading: true,
    caseScopeId: null,
    transform: { x: 0, y: 0, k: 1 }
  },

  canvasState: {
    positions: {},
    velocities: {},
    draggingNode: null,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    animationId: null
  },

  communityColors: [
    "#00C8FF", // Cyan (Cluster 0: Primary Syndicate Operations)
    "#00E5A0", // Green (Cluster 1: Telecom & Geo Intercepts)
    "#FFB020", // Amber (Cluster 2: Shell Banking & Layering)
    "#FF8A3D", // Orange (Cluster 3: Transport Logistics)
    "#FF4D67", // Red (Cluster 4: High-Risk Enforcement Targets)
    "#2DD4BF"  // Teal (Cluster 5: Executive Brokers)
  ],

  typeColorMap: {
    Person: "#00C8FF",
    Phone: "#38BDF8",
    Vehicle: "#FF8A3D",
    Location: "#00E5A0",
    Organization: "#2DD4BF",
    FinancialAccount: "#FFB020",
    Incident: "#FF4D67"
  },

  async init(params = {}) {
    this.state.loading = true;
    if (params.caseId) {
      this.state.caseScopeId = params.caseId;
    }
    this.render();

    try {
      let url = "/graph/data?min_confidence=0.0";
      if (this.state.caseScopeId) {
        url += `&case_id=${encodeURIComponent(this.state.caseScopeId)}`;
      }
      const graphRes = await window.SiperApp.api.get(url);
      this.state.nodes = graphRes.nodes || [];
      this.state.links = graphRes.links || [];

      // Auto-select requested node or central node
      if (params.entityId) {
        const match = this.state.nodes.find(n => n.id === params.entityId);
        if (match) this.state.selectedNode = match;
      } else {
        const primary = this.state.nodes.find(n => n.label === "Ravi Kumar") || this.state.nodes[0];
        if (primary) {
          this.state.selectedNode = primary;
        }
      }
    } catch (e) {
      console.error("Error initializing graph:", e);
    } finally {
      this.state.loading = false;
      this.render();
      this.initGraphCanvas();
    }
  },

  async clearCaseScope() {
    this.state.caseScopeId = null;
    await this.init();
  },

  render() {
    const container = document.getElementById("main-content");
    if (!container) return;
    container.innerHTML = this.renderHtml();
  },

  renderHtml() {
    if (this.state.loading) {
      return `
        <div class="p-8 flex items-center justify-center h-full">
          <div class="text-center space-y-3">
            <span class="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
            <div class="text-xs text-on-surface-variant font-mono">Simulating Force-Directed Network Graph...</div>
          </div>
        </div>
      `;
    }

    const selected = this.state.selectedNode;
    const nodeTypes = [
      { id: "Person", label: "Person", color: "bg-[#00C8FF]" },
      { id: "Phone", label: "Phone", color: "bg-[#38BDF8]" },
      { id: "Vehicle", label: "Vehicle", color: "bg-[#FF8A3D]" },
      { id: "Location", label: "Location", color: "bg-[#00E5A0]" },
      { id: "Organization", label: "Organization", color: "bg-[#2DD4BF]" },
      { id: "FinancialAccount", label: "Financial Account", color: "bg-[#FFB020]" },
      { id: "Incident", label: "Incident", color: "bg-[#FF4D67]" }
    ];

    return `
      <div class="flex-1 flex h-full overflow-hidden relative">
        
        <!-- 1. LEFT PANEL: SEARCH & FILTERS (280px) -->
        <aside class="w-72 bg-surface border-r border-outline flex flex-col p-4 space-y-4 shrink-0 z-20 overflow-y-auto">
          <div>
            <div class="text-[10px] font-mono uppercase font-bold text-primary tracking-wider">Graph Controls</div>
            <h2 class="text-sm font-bold text-white mt-0.5 font-mono">Filter & Explore</h2>
          </div>

          ${this.state.caseScopeId ? `
            <div class="p-2.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="text-[9px] font-mono text-primary font-bold uppercase flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>Scope: ${this.state.caseScopeId}</span>
                </div>
                <div class="text-[11px] text-white font-mono">${this.state.nodes.length} Nodes · ${this.state.links.length} Edges</div>
              </div>
              <button onclick="window.SiperGraphExplorerView.clearCaseScope()" class="text-[10px] text-primary hover:underline font-semibold font-mono bg-primary/20 px-2 py-0.5 rounded border border-primary/40">
                Show All
              </button>
            </div>
          ` : ''}

          <!-- Entity Search in Graph -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text text-[16px]">search</span>
            <input type="text"
                   id="graph-filter-search"
                   value="${this.state.searchQuery}"
                   placeholder="Find entity in graph..."
                   oninput="window.SiperGraphExplorerView.handleSearch(this.value)"
                   class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-muted-text outline-none transition-all focus:shadow-[0_0_12px_rgba(0,200,255,0.15)]" />
          </div>

          <!-- Color Mode Switcher -->
          <div class="space-y-1.5 border-t border-outline pt-3">
            <div class="text-[10px] uppercase font-mono font-bold text-muted-text">Color Encoding Mode</div>
            <div class="grid grid-cols-2 gap-1.5 p-1 bg-surface-container rounded-lg border border-outline">
              <button onclick="window.SiperGraphExplorerView.setColorMode('type')"
                      class="py-1 text-[11px] rounded-md transition-all ${this.state.colorMode === 'type' ? 'bg-primary text-[#031018] font-bold shadow-[0_0_10px_rgba(0,200,255,0.3)]' : 'text-on-surface-variant hover:text-white'}">
                Entity Type
              </button>
              <button onclick="window.SiperGraphExplorerView.setColorMode('community')"
                      class="py-1 text-[11px] rounded-md transition-all ${this.state.colorMode === 'community' ? 'bg-primary text-[#031018] font-bold shadow-[0_0_10px_rgba(0,200,255,0.3)]' : 'text-on-surface-variant hover:text-white'}">
                Cluster
              </button>
            </div>
          </div>

          <!-- Entity Types Filter -->
          <div class="space-y-2 border-t border-outline pt-3">
            <div class="text-[10px] uppercase font-mono font-bold text-on-surface-variant flex items-center justify-between">
              <span>Entity Types</span>
              <button onclick="window.SiperGraphExplorerView.selectAllTypes()" class="text-primary hover:underline text-[10px] lowercase">toggle all</button>
            </div>
            <div class="space-y-1.5">
              ${nodeTypes.map(t => {
                const checked = this.state.selectedTypes.has(t.id);
                return `
                  <label class="flex items-center justify-between p-1.5 rounded hover:bg-surface-container cursor-pointer text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full ${t.color}"></span>
                      <span class="${checked ? 'text-white font-medium' : 'text-on-surface-variant'}">${t.label}</span>
                    </div>
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.SiperGraphExplorerView.toggleType('${t.id}')" class="rounded bg-brand-bg border-outline text-primary focus:ring-0" />
                  </label>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Confidence Threshold Slider -->
          <div class="space-y-1.5 border-t border-outline pt-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-[10px] uppercase font-mono font-bold text-on-surface-variant">Min Edge Confidence</span>
              <span class="text-primary font-mono font-bold text-xs">${Math.round(this.state.minConfidence * 100)}%</span>
            </div>
            <input type="range" min="0" max="100" value="${this.state.minConfidence * 100}"
                   oninput="window.SiperGraphExplorerView.handleConfidenceChange(this.value / 100)"
                   class="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" />
            <div class="flex justify-between text-[9px] text-on-surface-variant font-mono">
              <span>All Links (0%)</span>
              <span>High (75%+)</span>
              <span>Strict (95%)</span>
            </div>
          </div>

          <!-- Graph Topology Metrics -->
          <div class="border-t border-outline pt-3 space-y-2">
            <div class="text-[10px] uppercase font-mono font-bold text-on-surface-variant">Network Scope Stats</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 rounded bg-surface-container border border-outline">
                <div class="text-[9px] text-on-surface-variant uppercase font-mono">Rendered Nodes</div>
                <div class="text-base font-bold text-white mt-0.5">${this.getFilteredNodes().length}</div>
              </div>
              <div class="p-2 rounded bg-surface-container border border-outline">
                <div class="text-[9px] text-on-surface-variant uppercase font-mono">Verified Edges</div>
                <div class="text-base font-bold text-primary mt-0.5">${this.getFilteredLinks().length}</div>
              </div>
            </div>
          </div>

          <!-- Shortest Path Tool Trigger -->
          <div class="border-t border-outline pt-3">
            <button onclick="window.SiperGraphExplorerView.openShortestPathModal()"
                    class="w-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-[16px] text-primary">alt_route</span>
              <span>Find Path Between Nodes</span>
            </button>
          </div>
        </aside>

        <!-- 2. CENTER CANVAS WORKSPACE -->
        <div class="flex-1 flex flex-col h-full relative bg-brand-bg overflow-hidden">
          
          <!-- Floating Interactive Toolbar -->
          <div class="absolute top-4 left-4 z-30 flex items-center gap-1.5 glass-toolbar p-1.5 rounded-xl shadow-xl">
            <!-- Zoom Controls -->
            <button onclick="window.SiperGraphExplorerView.zoomIn()" class="p-1.5 hover:bg-white/10 rounded-lg text-on-surface hover:text-white transition-colors" title="Zoom In">
              <span class="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <button onclick="window.SiperGraphExplorerView.zoomOut()" class="p-1.5 hover:bg-white/10 rounded-lg text-on-surface hover:text-white transition-colors" title="Zoom Out">
              <span class="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <button onclick="window.SiperGraphExplorerView.fitGraph()" class="p-1.5 hover:bg-white/10 rounded-lg text-on-surface hover:text-white transition-colors" title="Fit to Viewport">
              <span class="material-symbols-outlined text-[18px]">crop_free</span>
            </button>

            <div class="h-4 w-px bg-outline mx-1"></div>

            <!-- Layout Toggles -->
            <button onclick="window.SiperGraphExplorerView.setLayout('force')" class="px-2.5 py-1 text-xs rounded-lg transition-colors ${this.state.layoutMode === 'force' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:text-white'}" title="Force Directed Physics">
              Force
            </button>
            <button onclick="window.SiperGraphExplorerView.setLayout('circular')" class="px-2.5 py-1 text-xs rounded-lg transition-colors ${this.state.layoutMode === 'circular' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:text-white'}" title="Circular Cluster Topology">
              Radial
            </button>
            <button onclick="window.SiperGraphExplorerView.setLayout('hierarchical')" class="px-2.5 py-1 text-xs rounded-lg transition-colors ${this.state.layoutMode === 'hierarchical' ? 'bg-primary text-white font-semibold' : 'text-on-surface-variant hover:text-white'}" title="Hierarchical Flow">
              Hierarchy
            </button>

            <div class="h-4 w-px bg-outline mx-1"></div>

            <!-- Expand & Run AI Detection -->
            <button onclick="window.SiperGraphExplorerView.expandSelected()" class="p-1.5 hover:bg-white/10 rounded-lg text-primary hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold px-2" title="Expand Neighbors">
              <span class="material-symbols-outlined text-[18px]">hub</span>
              <span class="hidden sm:inline">Expand</span>
            </button>
            <button onclick="window.SiperGraphExplorerView.runPatternDetection()" class="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold px-2" title="Execute ML Pattern Detector">
              <span class="material-symbols-outlined text-[18px]">psychology</span>
              <span class="hidden sm:inline">Detect Patterns</span>
            </button>

            <!-- Export Formats Dropdown Button -->
            <button onclick="window.SiperGraphExplorerView.exportPNG()" class="p-1.5 hover:bg-white/10 rounded-lg text-on-surface hover:text-white transition-colors" title="Export Snapshot PNG">
              <span class="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button onclick="window.SiperGraphExplorerView.exportCytoscape()" class="p-1.5 hover:bg-white/10 rounded-lg text-primary hover:text-white transition-colors text-xs font-mono font-bold px-2" title="Export Cytoscape.js JSON">
              JSON
            </button>
          </div>

          <!-- Canvas Element -->
          <canvas id="graph-canvas" class="w-full h-full cursor-grab active:cursor-grabbing graph-grid-bg"></canvas>

          <!-- Dynamic Timeline Formation Scrubber (Bottom Bar) -->
          <div class="absolute bottom-4 left-4 right-4 max-w-xl mx-auto z-30 glass-toolbar p-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <button onclick="window.SiperGraphExplorerView.toggleTimelinePlay()" class="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shrink-0 shadow-md">
              <span class="material-symbols-outlined text-[18px]">${this.state.timelinePlaying ? 'pause' : 'play_arrow'}</span>
            </button>

            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-on-surface-variant font-bold uppercase">Investigation Timeline Scrubber</span>
                <span class="text-primary font-bold">Day ${this.state.timelineDay} / 30 (Aug ${this.state.timelineDay}, 2026)</span>
              </div>
              <input type="range" min="1" max="30" value="${this.state.timelineDay}"
                     oninput="window.SiperGraphExplorerView.handleTimelineScrub(this.value)"
                     class="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>

            <button onclick="window.SiperGraphExplorerView.resetTimeline()" class="text-on-surface-variant hover:text-white p-1 text-xs font-mono" title="Reset to Full Range">
              <span class="material-symbols-outlined text-[16px]">replay</span>
            </button>
          </div>

          <!-- Floating Path Highlight Banner (if shortest path is active) -->
          ${this.state.pathResult && this.state.pathResult.found ? `
            <div class="absolute top-20 left-4 z-30 bg-surface/95 backdrop-blur border border-primary rounded-xl p-3 shadow-2xl flex items-center gap-4 text-xs">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">alt_route</span>
                <div>
                  <div class="font-bold text-white">Investigative Connection Path Discovered</div>
                  <div class="text-[11px] text-on-surface-variant">${this.state.pathResult.nodes.map(n => n.label).join(" → ")}</div>
                </div>
              </div>
              <button onclick="window.SiperGraphExplorerView.clearPath()" class="text-on-surface-variant hover:text-white p-1">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- 3. RIGHT PANEL: SELECTED ENTITY CONTEXT (320px) -->
        <aside class="w-80 bg-surface border-l border-outline flex flex-col shrink-0 z-20 overflow-y-auto">
          ${selected ? this.renderSelectedContext(selected) : `
            <div class="p-8 text-center text-on-surface-variant text-xs space-y-2 m-auto">
              <span class="material-symbols-outlined text-4xl text-outline-strong block">touch_app</span>
              <p>Click on any node in the graph canvas to inspect structural metrics, connections, and evidence provenance.</p>
            </div>
          `}
        </aside>

        <!-- Provenance Drawer / Modal Overlay -->
        ${this.state.provenanceDrawerOpen ? this.renderProvenanceDrawer() : ''}
      </div>
    `;
  },

  renderSelectedContext(node) {
    const isHighRisk = node.risk_level === "HIGH" || node.risk_level === "CRITICAL";
    const color = this.typeColorMap[node.type] || node.color || "#00C8FF";
    return `
      <div class="p-5 space-y-5">
        
        <!-- Entity Header Profile Card with Pop-Up Lift -->
        <div class="surface-card p-4 space-y-2 border border-outline hover:border-primary/40">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border" style="background: rgba(0, 200, 255, 0.12); color: ${color}; border-color: ${color}60">
              ${node.type}
            </span>
            ${window.SiperApp.renderRiskBadge(node.risk_level, node.risk_score)}
          </div>
          
          <h2 class="text-lg font-bold text-white tracking-tight font-mono">${node.label || node.canonical_name}</h2>
          
          ${node.aliases && node.aliases.length ? `
            <div class="text-[11px] text-on-surface-variant font-mono">
              <span class="font-semibold text-white">Aliases:</span> ${node.aliases.join(", ")}
            </div>
          ` : ''}
        </div>

        <!-- Centrality Metrics Horizontal Bars -->
        <div class="surface-card p-3.5 space-y-3">
          <div class="text-[10px] uppercase font-mono font-bold text-muted-text">Structural Centrality Position</div>
          
          <!-- Betweenness Centrality (Bridge Indicator) -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-on-surface-variant">Betweenness (Brokerage):</span>
              <span class="text-warning font-bold">${node.betweenness_centrality || 0}</span>
            </div>
            <div class="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden border border-outline-subtle">
              <div class="bg-warning h-full rounded-full shadow-[0_0_6px_#FFB020]" style="width: ${Math.min(100, (node.betweenness_centrality || 0) * 300)}%"></div>
            </div>
          </div>

          <!-- PageRank (Structural Influence) -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-on-surface-variant">PageRank (Authority):</span>
              <span class="text-primary font-bold">${node.pagerank || 0}</span>
            </div>
            <div class="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden border border-outline-subtle">
              <div class="bg-primary h-full rounded-full shadow-[0_0_6px_#00C8FF]" style="width: ${Math.min(100, (node.pagerank || 0) * 1000)}%"></div>
            </div>
          </div>

          <!-- Degree Centrality -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-on-surface-variant">Degree Centrality:</span>
              <span class="text-intel-green font-bold">${node.degree_centrality || 0}</span>
            </div>
            <div class="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden border border-outline-subtle">
              <div class="bg-intel-green h-full rounded-full shadow-[0_0_6px_#00E5A0]" style="width: ${Math.min(100, (node.degree_centrality || 0) * 200)}%"></div>
            </div>
          </div>
        </div>

        <!-- AI Explainability Insight (Section 10 Compliance) -->
        <div class="surface-card p-3.5 border border-primary/40 space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-[10px] font-mono font-bold text-primary">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">psychology</span> AI ANALYSIS</span>
            <span class="text-intel-green font-bold">${Math.round((node.confidence || 0.88) * 100)}% CONFIDENCE</span>
          </div>
          <div class="text-xs text-white font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#00C8FF]"></span>
            <span>Key Structural Bridge Node in Network</span>
          </div>
          <div class="text-[11px] text-on-surface-variant leading-relaxed">
            ${node.label === 'Ravi Kumar' ? 
              'Identified as primary operational coordinator connecting transportation fleet (Garuda Logistics) to offshore financing entities (Apex Shell Holdings). High betweenness centrality indicates direct brokerage across syndicates.' :
              'Network centrality analysis indicates direct connectivity across multiple distinct case sub-graphs.'}
          </div>
          <button onclick="window.SiperGraphExplorerView.openProvenanceDrawer()" class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 pt-1 font-mono">
            <span class="material-symbols-outlined text-[14px]">verified</span>
            <span>Inspect Evidence Provenance Trail</span>
          </button>
        </div>

        <!-- Actions -->
        <div class="space-y-2 pt-2 border-t border-outline">
          <button onclick="window.SiperApp.navigate('entity-profile', { entityId: '${node.id}' })"
                  class="w-full btn-cyber-primary text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5">
            <span>Open Complete Intelligence Profile</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button onclick="window.SiperGraphExplorerView.expandSelected()"
                  class="w-full btn-cyber-secondary text-xs font-semibold py-2 px-3 flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">hub</span>
            <span>Fetch 1-Hop Connected Neighbors</span>
          </button>
        </div>

      </div>
    `;
  },

  renderProvenanceDrawer() {
    const node = this.state.selectedNode;
    return `
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-150">
        <div class="w-full max-w-md bg-surface border-l border-outline h-full p-6 space-y-5 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          
          <div class="flex items-center justify-between border-b border-outline pb-4">
            <div>
              <div class="text-[10px] uppercase font-mono font-bold text-primary">Evidence Provenance Audit Trail</div>
              <h2 class="text-sm font-bold text-white mt-0.5">${node ? node.label : 'Provenance'}</h2>
            </div>
            <button onclick="window.SiperGraphExplorerView.closeProvenanceDrawer()" class="p-1 rounded text-on-surface-variant hover:text-white">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div class="space-y-4 text-xs flex-1">
            <div class="surface-card p-3 space-y-1.5">
              <div class="text-[10px] font-mono text-primary uppercase font-bold">Primary Legal Authority</div>
              <div class="font-bold text-white">FIR 104/2026 (Jagatpur Police Station)</div>
              <div class="text-on-surface-variant text-[11px]">Section 154 Cr.P.C. / NDPS Act Sec 20(b). Document Checksum: e3b0c44298fc...</div>
            </div>

            <div class="surface-card p-3 space-y-1.5">
              <div class="text-[10px] font-mono text-primary uppercase font-bold">Telecommunications Provenance</div>
              <div class="font-bold text-white">Airtel Odisha CDR File: CDR_RaviKumar_Aug2026.csv</div>
              <div class="text-on-surface-variant text-[11px]">42 correlated calls logged with verified tower triangulation at Sector 5 Industrial Area.</div>
            </div>

            <div class="surface-card p-3 space-y-1.5">
              <div class="text-[10px] font-mono text-primary uppercase font-bold">Financial Intelligence Record</div>
              <div class="font-bold text-white">State Bank of India A/C 38291049281</div>
              <div class="text-on-surface-variant text-[11px]">₹1.85 Crore NEFT wire transfer to Apex Shell Holdings matching money laundering typologies.</div>
            </div>
          </div>

          <div class="pt-4 border-t border-outline text-[10px] text-muted-text font-mono flex items-center justify-between">
            <span class="text-intel-green font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">verified</span> CHAIN OF CUSTODY: VERIFIED</span>
            <button onclick="window.SiperGraphExplorerView.closeProvenanceDrawer()" class="text-primary font-bold hover:underline">Close Drawer</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredNodes() {
    return this.state.nodes.filter(n => {
      const typeMatch = this.state.selectedTypes.has(n.type);
      const searchMatch = !this.state.searchQuery || 
        (n.label && n.label.toLowerCase().includes(this.state.searchQuery.toLowerCase())) ||
        (n.canonical_name && n.canonical_name.toLowerCase().includes(this.state.searchQuery.toLowerCase()));
      return typeMatch && searchMatch;
    });
  },

  getFilteredLinks() {
    const nodeIds = new Set(this.getFilteredNodes().map(n => n.id));
    return this.state.links.filter(l => {
      const u = typeof l.source === 'object' ? l.source.id : l.source;
      const v = typeof l.target === 'object' ? l.target.id : l.target;
      const confMatch = (l.confidence || 0) >= this.state.minConfidence;
      return nodeIds.has(u) && nodeIds.has(v) && confMatch;
    });
  },

  initGraphCanvas() {
    const canvas = document.getElementById("graph-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Initialize positions if not present
    const nodes = this.getFilteredNodes();
    nodes.forEach((n, i) => {
      if (!this.canvasState.positions[n.id]) {
        const angle = (i / Math.max(1, nodes.length)) * 2 * Math.PI;
        const dist = 140 + (i % 4) * 40;
        this.canvasState.positions[n.id] = {
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * dist
        };
        this.canvasState.velocities[n.id] = { vx: 0, vy: 0 };
      }
    });

    // Physics Force Simulation Loop
    const runSimulation = () => {
      const currentNodes = this.getFilteredNodes();
      const currentLinks = this.getFilteredLinks();
      const pos = this.canvasState.positions;
      const vel = this.canvasState.velocities;

      if (this.state.layoutMode === "force") {
        // Node-Node Repulsion
        for (let i = 0; i < currentNodes.length; i++) {
          for (let j = i + 1; j < currentNodes.length; j++) {
            const u = currentNodes[i].id;
            const v = currentNodes[j].id;
            const p1 = pos[u];
            const p2 = pos[v];
            if (!p1 || !p2) continue;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 220) {
              const force = (220 - dist) / dist * 0.4;
              vel[u].vx -= dx * force * 0.05;
              vel[u].vy -= dy * force * 0.05;
              vel[v].vx += dx * force * 0.05;
              vel[v].vy += dy * force * 0.05;
            }
          }
        }

        // Link Springs
        currentLinks.forEach(l => {
          const uId = typeof l.source === 'object' ? l.source.id : l.source;
          const vId = typeof l.target === 'object' ? l.target.id : l.target;
          const p1 = pos[uId];
          const p2 = pos[vId];
          if (!p1 || !p2) return;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 110;
          const force = (dist - targetDist) * 0.02;

          vel[uId].vx += dx * force * 0.05;
          vel[uId].vy += dy * force * 0.05;
          vel[vId].vx -= dx * force * 0.05;
          vel[vId].vy -= dy * force * 0.05;
        });

        // Centering Force & Damping
        currentNodes.forEach(n => {
          const p = pos[n.id];
          const v = vel[n.id];
          if (!p || !v) return;

          // Drag anchor
          if (this.canvasState.draggingNode === n.id) {
            v.vx = 0;
            v.vy = 0;
            return;
          }

          // Center gravitation
          const cx = width / 2;
          const cy = height / 2;
          v.vx += (cx - p.x) * 0.001;
          v.vy += (cy - p.y) * 0.001;

          // Damping
          v.vx *= 0.85;
          v.vy *= 0.85;

          p.x += v.vx;
          p.y += v.vy;
        });
      }

      // Render Canvas Frame
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      const t = this.state.transform;
      ctx.translate(t.x, t.y);
      ctx.scale(t.k, t.k);

      // 1. Draw Links (Cyber Blue-Gray Default)
      currentLinks.forEach(l => {
        const uId = typeof l.source === 'object' ? l.source.id : l.source;
        const vId = typeof l.target === 'object' ? l.target.id : l.target;
        const p1 = pos[uId];
        const p2 = pos[vId];
        if (!p1 || !p2) return;

        const isPathLink = this.state.pathResult && this.state.pathResult.found &&
          this.state.pathResult.nodes.some(n => n.id === uId) &&
          this.state.pathResult.nodes.some(n => n.id === vId);

        if (isPathLink) {
          ctx.strokeStyle = "#00C8FF";
          ctx.lineWidth = 3.5;
          ctx.shadowColor = "#00C8FF";
          ctx.shadowBlur = 8;
        } else {
          const alpha = Math.max(0.2, l.confidence || 0.5);
          ctx.strokeStyle = `rgba(27, 52, 77, ${alpha})`;
          ctx.lineWidth = Math.max(1, (l.confidence || 0.5) * 2.5);
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw confidence badge on link midpoint
        if ((l.confidence || 0) >= 0.85) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          ctx.fillStyle = "rgba(11, 20, 34, 0.9)";
          ctx.fillRect(mx - 14, my - 7, 28, 14);
          ctx.strokeStyle = "#1B344D";
          ctx.lineWidth = 1;
          ctx.strokeRect(mx - 14, my - 7, 28, 14);
          ctx.font = "bold 8px ui-monospace, monospace";
          ctx.fillStyle = isPathLink ? "#00C8FF" : "#A8BDD1";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${Math.round(l.confidence * 100)}%`, mx, my);
        }
      });

      // 2. Draw Nodes
      currentNodes.forEach(n => {
        const p = pos[n.id];
        if (!p) return;

        const isSelected = this.state.selectedNode && this.state.selectedNode.id === n.id;
        const isPathNode = this.state.pathResult && this.state.pathResult.found &&
          this.state.pathResult.nodes.some(pn => pn.id === n.id);

        // Determine node color
        let nodeFill = this.typeColorMap[n.type] || n.color || "#00C8FF";
        if (this.state.colorMode === "community") {
          const commId = n.community_id || 0;
          nodeFill = this.communityColors[commId % this.communityColors.length];
        }

        // Size scaled by centrality
        const centralityBonus = (n.betweenness_centrality || 0) * 15;
        const radius = Math.max(8, Math.min(22, 10 + centralityBonus));

        // Glow ring for selected / path
        if (isSelected || isPathNode) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "rgba(0, 200, 255, 0.25)" : "rgba(0, 229, 160, 0.25)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? "#00C8FF" : "#00E5A0";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeFill;
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 241, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = isSelected ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
        ctx.fillStyle = isSelected ? "#FFFFFF" : "#A8BDD1";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(n.label || n.canonical_name, p.x, p.y + radius + 5);
      });

      ctx.restore();

      this.canvasState.animationId = requestAnimationFrame(runSimulation);
    };

    if (this.canvasState.animationId) {
      cancelAnimationFrame(this.canvasState.animationId);
    }
    this.canvasState.animationId = requestAnimationFrame(runSimulation);

    // Canvas Interactions (Click, Drag, Pan, Zoom)
    this.setupCanvasEvents(canvas);
  },

  setupCanvasEvents(canvas) {
    const getCanvasMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = this.state.transform;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      return {
        x: (mouseX - t.x) / t.k,
        y: (mouseY - t.y) / t.k
      };
    };

    const findNodeAt = (pos) => {
      const currentNodes = this.getFilteredNodes();
      for (let i = currentNodes.length - 1; i >= 0; i--) {
        const n = currentNodes[i];
        const np = this.canvasState.positions[n.id];
        if (np) {
          const dx = pos.x - np.x;
          const dy = pos.y - np.y;
          if (Math.sqrt(dx * dx + dy * dy) <= 24) {
            return n;
          }
        }
      }
      return null;
    };

    canvas.onmousedown = (e) => {
      const mousePos = getCanvasMousePos(e);
      const clickedNode = findNodeAt(mousePos);

      if (clickedNode) {
        this.canvasState.draggingNode = clickedNode.id;
        this.state.selectedNode = clickedNode;
        this.render();
      } else {
        this.canvasState.isPanning = true;
        this.canvasState.panStart = { x: e.clientX - this.state.transform.x, y: e.clientY - this.state.transform.y };
      }
    };

    window.onmousemove = (e) => {
      if (this.canvasState.draggingNode) {
        const mousePos = getCanvasMousePos(e);
        const p = this.canvasState.positions[this.canvasState.draggingNode];
        if (p) {
          p.x = mousePos.x;
          p.y = mousePos.y;
        }
      } else if (this.canvasState.isPanning) {
        this.state.transform.x = e.clientX - this.canvasState.panStart.x;
        this.state.transform.y = e.clientY - this.canvasState.panStart.y;
      }
    };

    window.onmouseup = () => {
      this.canvasState.draggingNode = null;
      this.canvasState.isPanning = false;
    };

    canvas.ondblclick = (e) => {
      const mousePos = getCanvasMousePos(e);
      const clickedNode = findNodeAt(mousePos);
      if (clickedNode) {
        this.expandEntity(clickedNode.id);
      }
    };

    canvas.onwheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.state.transform.k = Math.max(0.3, Math.min(3.0, this.state.transform.k * zoomFactor));
    };
  },

  zoomIn() {
    this.state.transform.k = Math.min(3.0, this.state.transform.k * 1.2);
  },

  zoomOut() {
    this.state.transform.k = Math.max(0.3, this.state.transform.k * 0.8);
  },

  fitGraph() {
    this.state.transform = { x: 0, y: 0, k: 1 };
  },

  setLayout(mode) {
    this.state.layoutMode = mode;
    const nodes = this.getFilteredNodes();
    const canvas = document.getElementById("graph-canvas");
    if (!canvas) return;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    if (mode === "circular") {
      nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = 180;
        this.canvasState.positions[n.id] = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        };
      });
    } else if (mode === "hierarchical") {
      nodes.forEach((n, i) => {
        const layer = n.type === 'Person' ? 0 : n.type === 'Organization' ? 1 : 2;
        this.canvasState.positions[n.id] = {
          x: 100 + (i % 6) * 120,
          y: 120 + layer * 140
        };
      });
    }
  },

  setColorMode(mode) {
    this.state.colorMode = mode;
    this.render();
    this.initGraphCanvas();
  },

  toggleTimelinePlay() {
    this.state.timelinePlaying = !this.state.timelinePlaying;
    if (this.state.timelinePlaying) {
      this.timelineInterval = setInterval(() => {
        if (this.state.timelineDay >= 30) {
          this.state.timelineDay = 1;
        } else {
          this.state.timelineDay++;
        }
        this.render();
        this.initGraphCanvas();
      }, 700);
    } else {
      if (this.timelineInterval) clearInterval(this.timelineInterval);
    }
    this.render();
    this.initGraphCanvas();
  },

  handleTimelineScrub(val) {
    this.state.timelineDay = parseInt(val);
    this.render();
    this.initGraphCanvas();
  },

  resetTimeline() {
    if (this.timelineInterval) clearInterval(this.timelineInterval);
    this.state.timelinePlaying = false;
    this.state.timelineDay = 30;
    this.render();
    this.initGraphCanvas();
  },

  async expandSelected() {
    if (!this.state.selectedNode) {
      window.SiperApp.showToast("Select a node to expand its network neighborhood.", "info");
      return;
    }
    await this.expandEntity(this.state.selectedNode.id);
  },

  async expandEntity(entityId) {
    try {
      const res = await window.SiperApp.api.post("/graph/expand", { entityId, hops: 1 });
      const newNodes = res.nodes || [];
      const newLinks = res.links || [];

      const existingIds = new Set(this.state.nodes.map(n => n.id));
      newNodes.forEach(n => {
        if (!existingIds.has(n.id)) {
          this.state.nodes.push(n);
        }
      });

      const existingLinkIds = new Set(this.state.links.map(l => l.id));
      newLinks.forEach(l => {
        if (!existingLinkIds.has(l.id)) {
          this.state.links.push(l);
        }
      });

      window.SiperApp.showToast(`Neighborhood expanded: ${res.total_nodes} nodes in scope.`, "success");
      this.initGraphCanvas();
      this.render();
    } catch (e) {
      window.SiperApp.showToast("Error expanding network.", "error");
    }
  },

  async runPatternDetection() {
    try {
      window.SiperApp.showToast("Executing Graph Analytics & Pattern Detectors...", "info");
      const res = await window.SiperApp.api.post("/analysis/run-pipeline", {});
      window.SiperApp.showToast(`Analytics Complete: ${res.count} risk patterns discovered.`, "success");
      window.SiperApp.navigate("findings");
    } catch (e) {
      window.SiperApp.showToast("Pattern detection pipeline error.", "error");
    }
  },

  openShortestPathModal() {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-surface border border-outline-strong rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-outline pb-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">alt_route</span>
              <span>Find Shortest Investigative Path</span>
            </h3>
            <button onclick="window.SiperGraphExplorerView.closeModal()" class="p-1 text-on-surface-variant hover:text-white">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">Source Entity (Origin)</label>
              <select id="path-source" class="w-full bg-brand-bg border border-outline rounded-lg p-2 text-xs text-white outline-none">
                ${this.state.nodes.map(n => `<option value="${n.id}" ${n.label === 'Ravi Kumar' ? 'selected' : ''}>${n.label} (${n.type})</option>`).join("")}
              </select>
            </div>

            <div>
              <label class="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">Target Entity (Destination)</label>
              <select id="path-target" class="w-full bg-brand-bg border border-outline rounded-lg p-2 text-xs text-white outline-none">
                ${this.state.nodes.map(n => `<option value="${n.id}" ${n.label === 'Vikram Malhotra' ? 'selected' : ''}>${n.label} (${n.type})</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button onclick="window.SiperGraphExplorerView.closeModal()" class="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-white">Cancel</button>
            <button onclick="window.SiperGraphExplorerView.calculatePath()" class="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-md shadow-primary/20">
              Compute Shortest Route
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async calculatePath() {
    const sourceId = document.getElementById("path-source").value;
    const targetId = document.getElementById("path-target").value;
    this.closeModal();

    try {
      const res = await window.SiperApp.api.post("/graph/shortest-path", {
        source_id: sourceId,
        target_id: targetId
      });
      this.state.pathResult = res;

      if (res.found) {
        window.SiperApp.showToast(`Connecting route found: ${res.path_length} hops across network.`, "success");
      } else {
        window.SiperApp.showToast(res.message || "No connecting path discovered.", "warning");
      }
      this.render();
      this.initGraphCanvas();
    } catch (e) {
      window.SiperApp.showToast("Path analysis error.", "error");
    }
  },

  clearPath() {
    this.state.pathResult = null;
    this.render();
    this.initGraphCanvas();
  },

  closeModal() {
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) modalContainer.innerHTML = "";
  },

  openProvenanceDrawer() {
    this.state.provenanceDrawerOpen = true;
    this.render();
  },

  closeProvenanceDrawer() {
    this.state.provenanceDrawerOpen = false;
    this.render();
  },

  exportPNG() {
    const canvas = document.getElementById("graph-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `SIPER_Graph_Network_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    window.SiperApp.showToast("Graph snapshot exported as PNG.", "success");
  },

  async exportCytoscape() {
    try {
      const res = await window.SiperApp.api.get("/graph/export/cytoscape");
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SIPER_Cytoscape_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      window.SiperApp.showToast("Graph exported as Cytoscape JSON.", "success");
    } catch (e) {
      window.SiperApp.showToast("Export error.", "error");
    }
  },

  toggleType(type) {
    if (this.state.selectedTypes.has(type)) {
      this.state.selectedTypes.delete(type);
    } else {
      this.state.selectedTypes.add(type);
    }
    this.render();
    this.initGraphCanvas();
  },

  selectAllTypes() {
    if (this.state.selectedTypes.size === 7) {
      this.state.selectedTypes.clear();
    } else {
      this.state.selectedTypes = new Set(["Person", "Phone", "Vehicle", "Location", "Organization", "FinancialAccount", "Incident"]);
    }
    this.render();
    this.initGraphCanvas();
  },

  handleSearch(val) {
    this.state.searchQuery = val;
    this.initGraphCanvas();
  },

  handleConfidenceChange(val) {
    this.state.minConfidence = parseFloat(val);
    this.initGraphCanvas();
  }
};
