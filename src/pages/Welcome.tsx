import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const returnPath = (location.state as any)?.from || "/dashboard";

  const handleContinue = () => {
    navigate(returnPath);
  };

  const handleGoogleAuth = async (customEmail?: string) => {
    setErrorMsg(null);
    setGoogleLoading(true);

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
              setErrorMsg(resp.error_description || "Google sign-in was cancelled.");
              setGoogleLoading(false);
              return;
            }
            try {
              await loginWithGoogle({ accessToken: resp.access_token });
              navigate(returnPath);
            } catch (err: any) {
              setErrorMsg(err?.message || "Google authentication failed.");
            } finally {
              setGoogleLoading(false);
            }
          },
          error_callback: (err: any) => {
            console.warn("[Welcome] Google GIS error callback:", err);
            setGoogleLoading(false);
            setShowEmailFallback(true);
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("[Welcome] Google OAuth error:", err);
      }
    }

    // Direct Google authentication flow (with custom email or default verification operator)
    const emailToUse = customEmail || googleEmailInput;
    if (emailToUse && emailToUse.includes("@")) {
      try {
        await loginWithGoogle({ email: emailToUse.trim().toLowerCase() });
        navigate(returnPath);
      } catch (err: any) {
        setErrorMsg(err?.message || "Authentication failed.");
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    // Show input if no token client available
    setGoogleLoading(false);
    setShowEmailFallback(true);
  };

  return (
    <div className="min-h-screen bg-[#160C08] text-[#FFF8F0] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="max-w-2xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Brand Mark */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#C96A2B] flex items-center justify-center shadow-[0_0_20px_rgba(201,106,43,0.35)]">
            <span className="material-symbols-outlined text-white text-[18px]">
              verified
            </span>
          </div>
          <span className="font-heading font-bold text-xl text-white tracking-tight">
            Vera<span className="text-[#E08A3E]">OS</span>
          </span>
        </div>

        {/* Headline & Supporting message */}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-3 leading-tight">
          Welcome to VeraOS
        </h1>
        <p className="font-sans text-sm sm:text-base text-[#B9A99B] leading-relaxed max-w-lg mb-10">
          AI agents can complete tasks. VeraOS checks whether they actually completed them correctly.
        </p>

        {/* Workflow Introduction: 01, 02, 03 */}
        <div className="w-full flex flex-col gap-3.5 text-left mb-10">
          {/* Step 01 */}
          <div className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex items-start gap-4">
            <div className="px-2.5 py-1 rounded-lg bg-[#2C1710] border border-[#4A2B1D] font-mono text-xs font-bold text-[#E08A3E] shrink-0 mt-0.5">
              01
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-semibold text-base text-[#FFF8F0]">
                Give VeraOS the task
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                Tell us what the AI agent was supposed to do.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex items-start gap-4">
            <div className="px-2.5 py-1 rounded-lg bg-[#2C1710] border border-[#4A2B1D] font-mono text-xs font-bold text-[#E08A3E] shrink-0 mt-0.5">
              02
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-semibold text-base text-[#FFF8F0]">
                Submit the agent&apos;s result
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                VeraOS separates the agent&apos;s claims from what can actually be proven.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex items-start gap-4">
            <div className="px-2.5 py-1 rounded-lg bg-[#2C1710] border border-[#4A2B1D] font-mono text-xs font-bold text-[#E08A3E] shrink-0 mt-0.5">
              03
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-semibold text-base text-[#FFF8F0]">
                Verify the evidence
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                Independent evidence is checked and VeraOS returns a clear verdict.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-[#2a1210] border border-[#5c1e19] text-xs text-[#fca5a5] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error_outline</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication / Continue Area */}
        <div className="w-full flex flex-col items-center gap-3">
          {isAuthenticated ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-xs text-[#B9A99B]">
                Signed in as <strong className="text-white">{user?.name || user?.email}</strong>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                className="w-full sm:w-auto px-8 py-3.5"
                icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              >
                Continue to VeraOS
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Only authentication method displayed: Continue with Google */}
              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                disabled={googleLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFF8F0] hover:bg-white text-[#160C08] font-heading font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-60"
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
                <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>

              {/* Discreet email fallback if GIS popups are blocked */}
              {showEmailFallback ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (googleEmailInput && googleEmailInput.includes("@")) {
                      handleGoogleAuth(googleEmailInput);
                    } else {
                      setErrorMsg("Please enter a valid email address.");
                    }
                  }}
                  className="flex items-center gap-2 mt-3 w-full max-w-sm"
                >
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="Enter your Google email..."
                    required
                    className="flex-1 px-3 py-2 rounded-xl bg-[#21110B] border border-[#4A2B1D] text-xs text-white placeholder-[#B9A99B]/50 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                  />
                  <Button type="submit" variant="primary" size="sm" loading={googleLoading}>
                    Sign In
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmailFallback(true)}
                  className="text-[11px] text-[#B9A99B] hover:text-white underline cursor-pointer mt-1 font-mono"
                >
                  Enter Google email manually
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
