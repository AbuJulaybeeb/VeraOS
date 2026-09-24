import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { supabaseAuthService } from "../services/supabaseAuth";
import { useAuth } from "../context/AuthContext";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      if (!isSupabaseConfigured) {
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        // Supabase auto-detects hash and code query params
        const { data, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr) {
          throw sessionErr;
        }

        if (data.session?.user) {
          // Ensure profile is created/synced
          await supabaseAuthService.syncUserProfile(data.session.user);
          await refetchUser();

          // Check if this user already has verification runs
          const { count } = await supabase
            .from("verification_runs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", data.session.user.id);

          if (mounted) {
            // If new user with no runs, guide through lightweight onboarding
            if (!count || count === 0) {
              navigate("/welcome", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
        } else {
          // If no session yet, listen once for auth state change
          const { data: authSub } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user && mounted) {
                await supabaseAuthService.syncUserProfile(session.user);
                await refetchUser();
                authSub.subscription.unsubscribe();
                navigate("/dashboard", { replace: true });
              }
            }
          );
        }
      } catch (err: any) {
        console.error("[AuthCallback] Error during OAuth callback:", err);
        if (mounted) {
          setError(
            err?.message || "Google authentication could not be completed. Please try again."
          );
        }
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, refetchUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-2xl bg-white border border-[#E8E4DC] max-w-md w-full shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#FDE8E8] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[24px]">error</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-[#191513] mb-2">
            Authentication Error
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed mb-6">
            {error}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/", { replace: true })}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E4DC] hover:bg-[#FAF8F5] text-xs font-semibold text-[#191513] transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => {
                supabaseAuthService.signInWithGoogle();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-xs font-semibold text-white transition-colors"
            >
              Retry Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#181311]" />
        <span className="font-heading font-bold text-lg text-[#191513]">
          Vera<span className="text-[#D97736]">OS</span>
        </span>
      </div>
      <div className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin mb-1" />
      <h3 className="font-heading font-semibold text-base text-[#191513]">
        Completing authentication...
      </h3>
      <p className="text-xs text-[#6B635B] max-w-sm">
        Verifying your Google credentials with Supabase Auth and establishing your session.
      </p>
    </div>
  );
};
