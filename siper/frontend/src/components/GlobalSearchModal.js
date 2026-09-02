/**
 * SIPER Global Search Modal (Command Palette ⌘K)
 * Provides multi-category fuzzy search across entities, cases, documents, and findings.
 */
window.SiperGlobalSearchModal = {
  render() {
    return `
      <div id="global-search-backdrop" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4" onclick="window.SiperGlobalSearchModal.handleBackdropClick(event)">
        <div class="w-full max-w-2xl bg-surface border border-outline hover:border-primary/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150 transition-all">
          
          <!-- Search Header Input -->
          <div class="p-4 border-b border-outline flex items-center gap-3 bg-surface-container">
            <span class="material-symbols-outlined text-primary text-[22px]">search</span>
            <input id="global-search-input" type="text"
                   placeholder="Search person, phone (+91...), vehicle plate, case ID, document..."
                   class="bg-transparent border-none text-white text-sm focus:ring-0 w-full p-0 outline-none placeholder:text-muted-text font-mono"
                   oninput="window.SiperGlobalSearchModal.onSearchInput(this.value)"
                   autofocus />
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface border border-outline text-muted-text">ESC</span>
          </div>

          <!-- Quick Filter Chips -->
          <div class="px-4 py-2 bg-brand-bg/50 border-b border-outline flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            <span class="text-muted-text text-[10px] uppercase font-bold tracking-wider mr-1">Filter:</span>
            <button onclick="window.SiperGlobalSearchModal.filterType('ALL')" class="search-filter-btn px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold">All</button>
            <button onclick="window.SiperGlobalSearchModal.filterType('Person')" class="search-filter-btn px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-white border border-outline">Persons</button>
            <button onclick="window.SiperGlobalSearchModal.filterType('Phone')" class="search-filter-btn px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-white border border-outline">Phones</button>
            <button onclick="window.SiperGlobalSearchModal.filterType('Vehicle')" class="search-filter-btn px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-white border border-outline">Vehicles</button>
            <button onclick="window.SiperGlobalSearchModal.filterType('Case')" class="search-filter-btn px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-white border border-outline">Cases</button>
          </div>

          <!-- Results Scroll Area -->
          <div id="global-search-results" class="overflow-y-auto p-2 space-y-1 divide-y divide-outline/30 flex-1">
            <div class="p-8 text-center text-on-surface-variant text-xs font-mono">
              <span class="material-symbols-outlined text-3xl mb-2 text-primary/60 block">manage_search</span>
              Type name, phone number, or case ID to query intelligence repository.
            </div>
          </div>

          <!-- Footer Shortcut Bar -->
          <div class="px-4 py-2 bg-surface-container border-t border-outline text-[11px] text-muted-text font-mono flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span><kbd class="font-mono bg-surface px-1.5 py-0.5 rounded border border-outline text-white">↑↓</kbd> Navigate</span>
              <span><kbd class="font-mono bg-surface px-1.5 py-0.5 rounded border border-outline text-white">↵</kbd> Open Profile</span>
            </div>
            <div class="text-[10px] text-primary font-bold">SIH PS 26189 Graph Engine</div>
          </div>
        </div>
      </div>
    `;
  },

  handleBackdropClick(event) {
    if (event.target.id === "global-search-backdrop") {
      window.SiperGlobalSearchModal.close();
    }
  },

  close() {
    const container = document.getElementById("modal-container");
    if (container) container.innerHTML = "";
  },

  async onSearchInput(query) {
    const resultsContainer = document.getElementById("global-search-results");
    if (!query || query.trim().length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant text-xs font-mono">
          <span class="material-symbols-outlined text-3xl mb-2 text-primary/60 block">manage_search</span>
          Type name, phone number, or case ID to query intelligence repository.
        </div>
      `;
      return;
    }

    try {
      const res = await window.SiperApp.api.get(`/entities/search?query=${encodeURIComponent(query)}`);
      const entities = res.entities || [];

      if (entities.length === 0) {
        resultsContainer.innerHTML = `
          <div class="p-8 text-center text-muted-text text-xs font-mono">
            <span class="material-symbols-outlined text-3xl mb-2 text-critical/60 block">search_off</span>
            No intelligence records matching "<span class="text-white font-medium">${query}</span>" found.
          </div>
        `;
        return;
      }

      const typeColorMap = {
        Person: "#00C8FF",
        Phone: "#38BDF8",
        Vehicle: "#FF8A3D",
        Location: "#00E5A0",
        Organization: "#2DD4BF",
        FinancialAccount: "#FFB020",
        Incident: "#FF4D67"
      };

      resultsContainer.innerHTML = entities.slice(0, 10).map(item => {
        const typeBadge = window.SiperApp.renderEntityTypeBadge(item.type);
        const riskBadge = window.SiperApp.renderRiskBadge(item.risk_level, item.risk_score);
        const nodeColor = typeColorMap[item.type] || item.color || "#00C8FF";
        return `
          <div onclick="window.SiperGlobalSearchModal.selectEntity('${item.id}')"
               class="p-3 rounded-lg hover:bg-surface-container-high cursor-pointer flex items-center justify-between transition-colors group">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center font-bold text-xs" style="color: ${nodeColor}">
                <span class="material-symbols-outlined text-base">
                  ${item.type === 'Person' ? 'person' : item.type === 'Phone' ? 'call' : item.type === 'Vehicle' ? 'directions_car' : item.type === 'Location' ? 'location_on' : 'domain'}
                </span>
              </div>
              <div>
                <div class="text-xs font-semibold text-white group-hover:text-primary transition-colors font-mono">${item.canonical_name}</div>
                <div class="text-[10px] text-muted-text flex items-center gap-2 mt-0.5 font-mono">
                  ${item.aliases && item.aliases.length ? `<span>Alias: ${item.aliases.slice(0, 2).join(", ")}</span> •` : ''}
                  <span>Betweenness: ${item.betweenness_centrality || 0}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${typeBadge}
              ${riskBadge}
            </div>
          </div>
        `;
      }).join("");

    } catch (e) {
      resultsContainer.innerHTML = `<div class="p-4 text-center text-danger text-xs">Error querying search API.</div>`;
    }
  },

  selectEntity(entityId) {
    window.SiperGlobalSearchModal.close();
    window.SiperApp.navigate("entity-profile", { entityId });
  },

  filterType(type) {
    const input = document.getElementById("global-search-input");
    if (input) {
      if (type !== 'ALL') {
        input.value = type;
      }
      this.onSearchInput(input.value);
    }
  }
};
