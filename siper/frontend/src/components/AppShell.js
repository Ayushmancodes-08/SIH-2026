/**
 * SIPER AppShell Component
 * Cyber-Intelligence Command Center Shell conforming to SIH PS 26189.
 */
window.SiperAppShell = {
  render(activeView, user, onNavigate, onRoleSwitch, onLogout, onOpenSearch) {
    const roleColors = {
      INVESTIGATOR: "bg-primary/15 text-primary border-primary/40",
      SUPERVISOR: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      ANALYST: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      ADMIN: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      AUDITOR: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    };

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "cases", label: "Cases", icon: "folder_shared", badge: "4 Active" },
      { id: "entities", label: "Entity Search", icon: "person_search" },
      { id: "graph", label: "Graph Explorer", icon: "hub", pulse: true },
      { id: "ingestion", label: "Data Ingestion", icon: "upload_file" },
      { id: "findings", label: "AI Findings", icon: "insights", badge: "6 New" },
      { id: "evidence", label: "Evidence Workspace", icon: "description" },
      { id: "reports", label: "Reports", icon: "assessment" },
      { id: "audit", label: "Audit Log", icon: "history_edu" },
      { id: "settings", label: "Settings", icon: "settings" },
    ];

    return `
      <!-- Top Navigation Bar -->
      <header class="h-16 bg-surface border-b border-outline flex items-center justify-between px-6 z-40 shrink-0">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 cursor-pointer" onclick="window.SiperApp.navigate('dashboard')">
            <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary font-black tracking-tighter text-lg shadow-[0_0_12px_rgba(0,200,255,0.25)]">
              S
            </div>
            <div>
              <div class="font-bold tracking-tight text-white flex items-center gap-2 text-base">
                SIPER
                <span class="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-mono">PS 26189</span>
              </div>
              <div class="text-[10px] text-on-surface-variant font-medium tracking-wide">MHA / NCRB Intelligence System</div>
            </div>
          </div>

          <!-- Global Cyber Command Search Trigger -->
          <button onclick="window.SiperApp.openSearch()" class="hidden md:flex items-center gap-3 bg-brand-bg border border-outline hover:border-primary rounded-lg px-3.5 py-1.5 w-80 text-left transition-all group hover:shadow-[0_0_15px_rgba(0,200,255,0.15)]">
            <span class="material-symbols-outlined text-muted-text text-[18px] group-hover:text-primary transition-colors">search</span>
            <span class="text-xs text-on-surface-variant flex-1">Search person, phone, plate, case...</span>
            <div class="flex items-center gap-1">
              <span class="text-[10px] font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline text-muted-text">⌘</span>
              <span class="text-[10px] font-mono bg-surface-container px-1.5 py-0.5 rounded border border-outline text-muted-text">K</span>
            </div>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Live Operation Intelligence Indicator -->
          <div class="hidden lg:flex items-center gap-2 bg-surface-container border border-outline rounded-full px-3 py-1 text-xs">
            <span class="w-2 h-2 rounded-full bg-intel-green shadow-[0_0_8px_#00E5A0] animate-pulse"></span>
            <span class="text-[11px] font-bold text-intel-green tracking-wider font-mono">INTEL FEED: ACTIVE</span>
          </div>

          <!-- Notification Bell -->
          <button onclick="window.SiperApp.navigate('findings')" class="p-2 text-on-surface-variant hover:text-white hover:bg-surface-container-high rounded-lg relative transition-colors" title="View AI Alerts">
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full ring-2 ring-surface shadow-[0_0_6px_#FF4D67]"></span>
          </button>

          <!-- Audit Log Quick Access -->
          <button onclick="window.SiperApp.navigate('audit')" class="p-2 text-on-surface-variant hover:text-white hover:bg-surface-container-high rounded-lg transition-colors" title="Audit Trail">
            <span class="material-symbols-outlined text-[20px]">security</span>
          </button>

          <div class="h-6 w-px bg-outline mx-1"></div>

          <!-- Active Operator Profile & Role Switcher -->
          <div class="relative group">
            <button class="flex items-center gap-3 p-1.5 pr-2.5 rounded-lg hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline">
              <div class="w-8 h-8 rounded-full bg-surface-container-highest border border-outline flex items-center justify-center font-bold text-xs text-primary shadow-inner">
                ${(user.name || "OP").substring(0, 2).toUpperCase()}
              </div>
              <div class="text-left hidden sm:block">
                <div class="text-xs font-semibold text-white leading-tight">${user.name || "Operator-01"}</div>
                <div class="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase inline-block mt-0.5 border ${roleColors[user.role] || roleColors.INVESTIGATOR}">
                  ${user.role || "INVESTIGATOR"}
                </div>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
            </button>

            <!-- Role Switch Dropdown Menu -->
            <div class="absolute right-0 top-full mt-2 w-56 bg-surface-container border border-outline rounded-xl shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50">
              <div class="px-3 py-2 border-b border-outline mb-1.5">
                <div class="text-xs font-semibold text-white">${user.name}</div>
                <div class="text-[11px] text-on-surface-variant">${user.email}</div>
                <div class="text-[10px] text-primary font-mono mt-0.5">${user.badge_number || "NCRB-26189"}</div>
              </div>

              <div class="text-[10px] uppercase font-bold text-on-surface-variant px-3 py-1 tracking-wider font-mono">Switch Role (SIH Demo)</div>
              <div class="space-y-0.5 mb-2">
                <button onclick="window.SiperApp.switchRole('INVESTIGATOR')" class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-high flex items-center justify-between ${user.role === 'INVESTIGATOR' ? 'text-primary font-semibold' : 'text-on-surface'}">
                  <span>Investigator</span>
                  ${user.role === 'INVESTIGATOR' ? '<span class="material-symbols-outlined text-sm text-primary">check</span>' : ''}
                </button>
                <button onclick="window.SiperApp.switchRole('SUPERVISOR')" class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-high flex items-center justify-between ${user.role === 'SUPERVISOR' ? 'text-purple-400 font-semibold' : 'text-on-surface'}">
                  <span>Supervisor</span>
                  ${user.role === 'SUPERVISOR' ? '<span class="material-symbols-outlined text-sm text-purple-400">check</span>' : ''}
                </button>
                <button onclick="window.SiperApp.switchRole('ANALYST')" class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-high flex items-center justify-between ${user.role === 'ANALYST' ? 'text-cyan-400 font-semibold' : 'text-on-surface'}">
                  <span>Analyst</span>
                  ${user.role === 'ANALYST' ? '<span class="material-symbols-outlined text-sm text-cyan-400">check</span>' : ''}
                </button>
                <button onclick="window.SiperApp.switchRole('ADMIN')" class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-high flex items-center justify-between ${user.role === 'ADMIN' ? 'text-rose-400 font-semibold' : 'text-on-surface'}">
                  <span>Administrator</span>
                  ${user.role === 'ADMIN' ? '<span class="material-symbols-outlined text-sm text-rose-400">check</span>' : ''}
                </button>
                <button onclick="window.SiperApp.switchRole('AUDITOR')" class="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-surface-container-high flex items-center justify-between ${user.role === 'AUDITOR' ? 'text-emerald-400 font-semibold' : 'text-on-surface'}">
                  <span>Auditor</span>
                  ${user.role === 'AUDITOR' ? '<span class="material-symbols-outlined text-sm text-emerald-400">check</span>' : ''}
                </button>
              </div>

              <div class="border-t border-outline pt-1">
                <button onclick="window.SiperApp.logout()" class="w-full text-left px-3 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <!-- Collapsible Cyber Intelligence Sidebar -->
        <aside class="w-60 bg-surface border-r border-outline flex flex-col justify-between py-4 px-3 shrink-0 hidden md:flex z-30">
          <div class="space-y-1">
            <!-- New Case Quick Button -->
            <button onclick="window.SiperApp.navigate('cases', { create: true })" class="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 mb-4 transition-all shadow-[0_0_12px_rgba(0,200,255,0.08)] active:scale-[0.98]">
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>New Investigation</span>
            </button>

            <!-- Navigation Links with Cyber Sidebar Styles -->
            ${navItems.map(item => {
              const isActive = activeView === item.id;
              return `
                <a href="#${item.id}" onclick="event.preventDefault(); window.SiperApp.navigate('${item.id}');"
                   class="sidebar-nav-link flex items-center justify-between px-3 py-2 rounded-lg text-xs ${isActive ? 'active-nav' : ''}">
                  <div class="flex items-center gap-3">
                    <span class="nav-icon material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-muted-text'}">${item.icon}</span>
                    <span>${item.label}</span>
                  </div>
                  ${item.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono border border-outline-subtle">${item.badge}</span>` : ''}
                  ${item.pulse ? `<span class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00C8FF] animate-pulse"></span>` : ''}
                </a>
              `;
            }).join("")}
          </div>

          <!-- Bottom Operational Scope Widget -->
          <div class="border-t border-outline pt-3 px-1">
            <div class="p-2.5 rounded-lg bg-surface-container border border-outline">
              <div class="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center justify-between font-mono">
                <span>Active Scope</span>
                <span class="text-primary font-mono text-[9px] font-bold">PS-26189</span>
              </div>
              <div class="text-xs font-semibold text-white mt-1 truncate">Cyber & Drug Syndicate</div>
              <div class="text-[10px] text-muted-text mt-0.5 font-mono">34 Linked Entities · 75 Edges</div>
            </div>
          </div>
        </aside>

        <!-- Main Content Workspace Area -->
        <main id="main-content" class="flex-1 overflow-y-auto bg-brand-bg relative flex flex-col">
          <!-- Views mounted dynamically -->
        </main>
      </div>
    `;
  }
};
