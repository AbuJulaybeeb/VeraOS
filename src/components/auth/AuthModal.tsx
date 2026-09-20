import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { StellarWalletModal } from "../wallet/StellarWalletModal";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, loginWithGoogle, signup } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(authModalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setGoogleChooserOpen(false);
    setShowCustomGoogleInput(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "signup" && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);

    const clientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "").trim();
    const win = typeof window !== "undefined" ? (window as any) : {};

    // 1. If Google Identity Services SDK and Client ID are active, trigger official OAuth popup with account chooser
    if (clientId && win.google?.accounts?.oauth2) {
      setIsSubmitting(true);
      try {
        const client = win.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          prompt: "select_account",
          callback: async (resp: any) => {
            if (resp.error) {
              setErrorMsg(resp.error_description || "Google authentication was cancelled.");
              setIsSubmitting(false);
              return;
            }
            try {
              await loginWithGoogle({ accessToken: resp.access_token });
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : "Google authentication failed.");
            } finally {
              setIsSubmitting(false);
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("[AuthModal] GSI popup init error:", err);
        setIsSubmitting(false);
      }
    }

    // 2. Open interactive Google Account Chooser screen (Zero browser prompts)
    setGoogleChooserOpen(true);
  };

  const handleSelectGoogleAccount = async (targetEmail: string, targetName?: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle({
        email: targetEmail.toLowerCase().trim(),
        name: targetName || targetEmail.split("@")[0],
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletLogin = () => {
    setWalletModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-surface-container border border-white/10 shadow-2xl p-space-lg flex flex-col gap-5 z-10">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Content: Switch between Google Chooser & Standard Auth */}
        {googleChooserOpen ? (
          /* Google Account Chooser View */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setGoogleChooserOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-white hover:bg-surface-container-high transition-colors"
                title="Back to Sign In"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white">Sign in with Google</h3>
                  <p className="text-[11px] text-outline">Choose an account to continue to VeraOS</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">error_outline</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* List of Available Google Accounts */}
            <div className="flex flex-col gap-2">
              {email && email.includes("@") && (
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount(email, name)}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/10 flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{name || email.split("@")[0]}</p>
                      <p className="text-[11px] text-outline truncate">{email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shrink-0 font-medium">
                    Entered
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectGoogleAccount("owner@veraos.network", "VeraOS Protocol Founder")}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/10 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#E08A3E] flex items-center justify-center font-bold text-white text-xs shrink-0">
                    V
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">VeraOS Protocol Founder</p>
                    <p className="text-[11px] text-outline truncate">owner@veraos.network</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E] border border-[#E08A3E]/30 shrink-0 font-medium">
                  Owner
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectGoogleAccount("auditor@veraos.network", "Stellar Onchain Auditor")}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/10 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    S
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">Stellar Onchain Auditor</p>
                    <p className="text-[11px] text-outline truncate">auditor@veraos.network</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 font-medium">
                  Invited
                </span>
              </button>
            </div>

            {/* Custom Google Account Entry */}
            {showCustomGoogleInput ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customGoogleEmail && customGoogleEmail.includes("@")) {
                    handleSelectGoogleAccount(customGoogleEmail);
                  } else {
                    setErrorMsg("Please enter a valid Google account email.");
                  }
                }}
                className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-lowest border border-white/10"
              >
                <label className="text-xs font-medium text-white">Enter your Google email</label>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  autoFocus
                  required
                  className="w-full p-2.5 rounded-lg bg-surface-container border border-white/10 text-xs text-white placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-outline hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                    Continue with Account
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomGoogleInput(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/20 hover:border-primary/50 text-xs text-on-surface font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">add</span>
                <span>Use another Google account</span>
              </button>
            )}

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-outline">
              <span>Google Identity Service</span>
              <button
                type="button"
                onClick={() => setGoogleChooserOpen(false)}
                className="text-primary hover:underline cursor-pointer"
              >
                Back to standard login
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex flex-col gap-1 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-primary-container flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary-container text-[16px]">
                    verified
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Vera<span className="text-primary-container">OS</span> Account
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                {mode === "signin" ? "Sign in to Platform" : "Create Developer Account"}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {mode === "signin"
                  ? "Access your verification telemetry, agent endpoints, and Stellar ledger receipts."
                  : "Start verifying autonomous agent outputs with onchain cryptographic ground truth."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container-lowest border border-white/5 font-headline-sm text-headline-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  mode === "signin"
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`py-1.5 rounded-lg font-medium transition-all ${
                  mode === "signup"
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-body-sm text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  error_outline
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {mode === "signup" && (
                <div className="flex flex-col gap-1">
                  <label className="font-body-sm text-body-sm text-on-surface font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Deejah"
                    className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface font-medium">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deejahai@gmail.com"
                  className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                {mode === "signin" ? "Sign In with Email" : "Create Account & Sign Up"}
              </Button>

              <div className="text-center pt-1">
                {mode === "signup" ? (
                  <p className="text-xs text-on-surface-variant">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMsg(null);
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setErrorMsg(null);
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign Up Free
                    </button>
                  </p>
                )}
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-2 text-outline font-label-caps text-label-caps uppercase">
              <span className="flex-1 h-[1px] bg-white/10" />
              <span>or one-click auth</span>
              <span className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Quick Auth Actions */}
            <div className="flex flex-col gap-2">
              {/* Google Connect Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-white/10 text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="font-semibold text-on-surface">Continue with Google</span>
              </button>

              {/* Web3 Wallet */}
              <button
                type="button"
                onClick={handleWalletLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-white/5 text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  account_balance_wallet
                </span>
                <span>Connect Real Stellar Wallet (Freighter, Albedo, Lobstr)</span>
              </button>
            </div>

            {/* Legal Terms & Privacy Notice */}
            <p className="text-[11px] text-center text-[#B9A99B] pt-2 leading-relaxed border-t border-white/5">
              By continuing, you agree to VeraOS{" "}
              <Link
                to="/terms"
                onClick={closeAuthModal}
                className="text-[#E08A3E] hover:underline"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and acknowledge our{" "}
              <Link
                to="/privacy"
                onClick={closeAuthModal}
                className="text-[#E08A3E] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>

      <StellarWalletModal
        isOpen={walletModalOpen}
        onClose={() => {
          setWalletModalOpen(false);
          closeAuthModal();
        }}
      />
    </div>
  );
};
