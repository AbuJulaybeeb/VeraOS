import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, loginAsDemo, loginWithGoogle, signup, connectWallet } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(authModalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
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
    } catch {
      setErrorMsg("Authentication failed. Please check credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsDemo();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFillSignup = () => {
    setName("Deejah");
    setEmail("Deejahai@gmail.com");
    setPassword("securePass2026!");
    setErrorMsg(null);
  };

  const handleWalletLogin = async () => {
    setIsSubmitting(true);
    try {
      await connectWallet();
    } finally {
      setIsSubmitting(false);
    }
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
              ? "Access your verification telemetry, agent endpoints, and EAS attestations."
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

          {mode === "signup" && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-outline">Testing sign-up?</span>
              <button
                type="button"
                onClick={handleAutoFillSignup}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Autofill Test Details
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full mt-1"
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
            <span className="font-semibold text-on-surface">Connect with Google</span>
            <span className="text-[11px] text-outline font-code-sm hidden sm:inline">(Deejahai@gmail.com)</span>
          </button>

          {/* Quick Demo Sign In as Deejah */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-white/5 text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">
              badge
            </span>
            <span>Demo: Sign in as Deejah (Lead Infrastructure Engineer)</span>
          </button>

          {/* Web3 Wallet */}
          <button
            type="button"
            onClick={handleWalletLogin}
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-white/5 text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">
              account_balance_wallet
            </span>
            <span>Connect Web3 Wallet (Base L2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
