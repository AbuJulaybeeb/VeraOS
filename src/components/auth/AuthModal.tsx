import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [googleEmail, setGoogleEmail] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async (customEmail?: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);

    const win = typeof window !== "undefined" ? (window as any) : {};
    const clientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "").trim();

    if (clientId && win.google?.accounts?.oauth2) {
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
              closeAuthModal();
              navigate("/dashboard");
            } catch (err: any) {
              setErrorMsg(err?.message || "Google authentication failed.");
            } finally {
              setIsSubmitting(false);
            }
          },
          error_callback: (err: any) => {
            console.warn("[AuthModal] GSI error callback:", err);
            setIsSubmitting(false);
            setShowManualInput(true);
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("[AuthModal] GSI error:", err);
      }
    }

    const emailToUse = customEmail || googleEmail;
    if (emailToUse && emailToUse.includes("@")) {
      try {
        await loginWithGoogle({ email: emailToUse.trim().toLowerCase() });
        closeAuthModal();
        navigate("/dashboard");
      } catch (err: any) {
        setErrorMsg(err?.message || "Google authentication failed.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(false);
    setShowManualInput(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#21110B] border border-[#4A2B1D] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 sm:p-8 flex flex-col gap-6 z-10 text-left">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C96A2B] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[18px]">
                verified
              </span>
            </div>
            <span className="font-heading font-bold text-lg text-white">
              Vera<span className="text-[#E08A3E]">OS</span>
            </span>
          </div>

          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#FFF8F0]">
            Sign in to VeraOS
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
            AI agents can complete tasks. VeraOS checks whether they actually completed them correctly.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#2a1210] border border-[#5c1e19] text-xs text-[#fca5a5] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">
              error_outline
            </span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Google Login Button */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FFF8F0] hover:bg-white text-[#160C08] font-heading font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSubmitting ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {showManualInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (googleEmail && googleEmail.includes("@")) {
                  handleGoogleLogin(googleEmail);
                } else {
                  setErrorMsg("Please enter a valid Google email address.");
                }
              }}
              className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] mt-1"
            >
              <label className="text-xs font-medium text-[#FFF8F0]">
                Enter Google Account Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com or company account"
                  autoFocus
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-[#21110B] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
                <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                  Sign In
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="text-[11px] text-[#B9A99B] hover:text-[#FFF8F0] underline text-center cursor-pointer mt-1 font-mono"
            >
              Enter Google email manually
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-[#4A2B1D] flex items-center justify-between text-[11px] text-[#B9A99B]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            Google authentication only
          </span>
          <span className="font-mono text-[#E08A3E]">VeraOS</span>
        </div>
      </div>
    </div>
  );
};
