/**
 * SIPER Secure Login & 2FA Verification View (AUTH-01 & AUTH-02)
 * Replicates Stitch design with subtle background network mesh and 2FA challenge.
 */
window.SiperLoginView = {
  state: {
    email: "investigator@siper.gov.in",
    password: "Sentinel@2026",
    requires2FA: false,
    challengeId: null,
    otp: "",
    error: null,
    loading: false
  },

  render() {
    return `
      <div class="h-screen w-screen bg-brand-bg flex items-center justify-center relative overflow-hidden graph-grid-bg p-4">
        
        <!-- Subtle Ambient Background Glow -->
        <div class="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none -top-20 -left-20"></div>
        <div class="absolute w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none -bottom-20 -right-20"></div>

        <!-- Auth Container Card with Cyber Glassmorphism -->
        <div class="w-full max-w-md bg-surface border border-outline hover:border-primary/40 rounded-2xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200 transition-all">
          
          <!-- System Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/40 text-primary font-black text-2xl tracking-tighter mb-4 shadow-[0_0_20px_rgba(0,200,255,0.2)]">
              S
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-white font-mono">SIPER</h1>
            <div class="text-xs text-primary font-mono font-bold tracking-wide mt-1">SIH PROBLEM STATEMENT PS 26189</div>
            <div class="text-[11px] text-muted-text mt-1 uppercase tracking-wider font-semibold">Ministry of Home Affairs / NCRB</div>
          </div>

          ${this.state.error ? `
            <div class="mb-5 p-3 rounded-lg bg-critical/10 border border-critical/30 text-critical text-xs flex items-center gap-2 font-mono">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <span>${this.state.error}</span>
            </div>
          ` : ''}

          ${!this.state.requires2FA ? `
            <!-- STEP 1: Secure Credentials Entry (AUTH-01) -->
            <form onsubmit="window.SiperLoginView.handleLogin(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5 font-mono">Government Email ID</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-[18px]">badge</span>
                  <input type="email" required
                         id="login-email"
                         value="${this.state.email}"
                         placeholder="officer@siper.gov.in"
                         class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-muted-text outline-none transition-all focus:shadow-[0_0_12px_rgba(0,200,255,0.15)] font-mono" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5 font-mono">Security Password</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-[18px]">lock</span>
                  <input type="password" required
                         id="login-password"
                         value="${this.state.password}"
                         placeholder="••••••••••••"
                         class="w-full bg-brand-bg border border-outline focus:border-primary rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-muted-text outline-none transition-all focus:shadow-[0_0_12px_rgba(0,200,255,0.15)] font-mono" />
                </div>
              </div>

              <div class="pt-2">
                <button type="submit" ${this.state.loading ? 'disabled' : ''}
                        class="w-full btn-cyber-primary font-bold py-2.5 text-xs flex items-center justify-center gap-2">
                  ${this.state.loading ? `
                    <span class="w-4 h-4 border-2 border-[#031018]/30 border-t-[#031018] rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  ` : `
                    <span>Verify Credentials & Proceed</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  `}
                </button>
              </div>

              <!-- Quick Demo Sign-in Hint -->
              <div class="p-3 bg-surface-container rounded-lg border border-outline text-[11px] text-muted-text space-y-1 mt-4">
                <div class="font-semibold text-white flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[14px]">info</span>
                  <span>SIH Autonomous Demonstration Access</span>
                </div>
                <div class="font-mono text-[10px] text-primary font-bold">Default: investigator@siper.gov.in / Sentinel@2026</div>
              </div>
            </form>
          ` : `
            <!-- STEP 2: Two-Factor Identity Verification (AUTH-02) -->
            <form onsubmit="window.SiperLoginView.handleVerify2FA(event)" class="space-y-5 animate-in fade-in duration-200">
              <div class="text-center">
                <div class="w-10 h-10 rounded-full bg-intel-green/15 border border-intel-green/30 text-intel-green flex items-center justify-center mx-auto mb-2 shadow-[0_0_10px_rgba(0,229,160,0.2)]">
                  <span class="material-symbols-outlined text-xl">shield_person</span>
                </div>
                <h3 class="text-sm font-bold text-white font-mono">Two-Factor Authentication</h3>
                <p class="text-xs text-on-surface-variant mt-1">Enter the 6-digit security token dispatched to authorized terminal.</p>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-muted-text uppercase tracking-wider mb-2 text-center font-mono">Security Code (OTP)</label>
                <div class="flex justify-center gap-2">
                  <input type="text" maxlength="6" autofocus required
                         id="otp-input"
                         placeholder="261890"
                         class="w-48 text-center text-xl font-mono tracking-widest bg-brand-bg border border-outline focus:border-primary rounded-lg py-2 text-white outline-none focus:shadow-[0_0_12px_rgba(0,200,255,0.2)]" />
                </div>
                <div class="text-center mt-2">
                  <span class="text-[11px] text-primary font-mono font-bold bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded">Demo OTP: 261890</span>
                </div>
              </div>

              <div class="pt-2 space-y-2">
                <button type="submit" ${this.state.loading ? 'disabled' : ''}
                        class="w-full btn-cyber-primary font-bold py-2.5 text-xs flex items-center justify-center gap-2">
                  ${this.state.loading ? `
                    <span class="w-4 h-4 border-2 border-[#031018]/30 border-t-[#031018] rounded-full animate-spin"></span>
                    <span>Validating Security Token...</span>
                  ` : `
                    <span class="material-symbols-outlined text-[16px]">verified_user</span>
                    <span>Authorize Command Center Access</span>
                  `}
                </button>

                <button type="button" onclick="window.SiperLoginView.backToLogin()"
                        class="w-full text-center text-xs text-muted-text hover:text-white py-1 transition-colors font-mono">
                  ← Back to Credential Sign-in
                </button>
              </div>
            </form>
          `}

          <!-- Footer Badges -->
          <div class="mt-8 pt-4 border-t border-outline flex items-center justify-between text-[10px] text-muted-text font-mono">
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-intel-green shadow-[0_0_4px_#00E5A0]"></span>
              <span>TLS 1.3 ENCRYPTED</span>
            </span>
            <span>ROLE-BASED RBAC</span>
            <span>AUDIT LOGGED</span>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    this.state.loading = true;
    this.state.error = null;
    window.SiperApp.render();

    try {
      const res = await window.SiperApp.api.post("/auth/login", { email, password });
      this.state.loading = false;

      if (res && res.requires_2fa) {
        this.state.requires2FA = true;
        this.state.challengeId = res.challenge_id;
        window.SiperApp.showToast("Credentials accepted. Enter 2FA code (261890).", "info");
      } else if (res && res.token) {
        window.SiperApp.setAuth(res.token, res.user);
        window.SiperApp.navigate("dashboard");
      } else {
        this.state.error = (res && (res.message || res.error)) || "Authentication failed. Invalid email or password.";
      }
    } catch (err) {
      this.state.loading = false;
      this.state.error = err.message ? `Server Error: ${err.message}` : "Connection error to SIPER server.";
    }
    window.SiperApp.render();
  },

  async handleVerify2FA(e) {
    e.preventDefault();
    const otp = document.getElementById("otp-input").value;

    this.state.loading = true;
    this.state.error = null;
    window.SiperApp.render();

    try {
      const res = await window.SiperApp.api.post("/auth/verify-2fa", {
        challenge_id: this.state.challengeId,
        otp: otp
      });
      this.state.loading = false;

      if (res.success && res.token) {
        window.SiperApp.setAuth(res.token, res.user);
        window.SiperApp.showToast(`Access Authorized. Welcome, ${res.user.name}.`, "success");
        window.SiperApp.navigate("dashboard");
      } else {
        this.state.error = res.message || "Invalid 2FA token.";
      }
    } catch (err) {
      this.state.loading = false;
      this.state.error = "Security token verification failed.";
    }
    window.SiperApp.render();
  },

  backToLogin() {
    this.state.requires2FA = false;
    this.state.error = null;
    window.SiperApp.render();
  }
};
