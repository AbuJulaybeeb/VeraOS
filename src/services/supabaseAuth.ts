import { supabase, isSupabaseConfigured, Profile } from "../lib/supabase";

export const supabaseAuthService = {
  /**
   * Initiate real Google OAuth sign-in flow via Supabase Auth
   */
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          "Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. Please add them to your environment."
        ),
      };
    }

    try {
      const redirectUri =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:5173/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error("[supabaseAuthService] Google OAuth error:", err);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  /**
   * Sign out and clear active Supabase session
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[supabaseAuthService] Error during sign out:", err);
      }
    }
  },

  /**
   * Ensure user profile exists in public.profiles table
   */
  async syncUserProfile(user: any): Promise<Profile | null> {
    if (!isSupabaseConfigured || !user?.id) return null;

    try {
      // 1. Try to fetch existing profile
      const { data: existing, error: fetchErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (existing && !fetchErr) {
        return existing as Profile;
      }

      // 2. Insert new profile if not found
      const email = user.email || "";
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (email ? email.split("@")[0] : "Operator");
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      const apiKey = `vera_live_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 10)}`;

      const { data: inserted, error: insertErr } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: "operator",
          api_key: apiKey,
        })
        .select()
        .single();

      if (insertErr) {
        console.warn("[supabaseAuthService] Error inserting profile:", insertErr.message);
        return null;
      }

      return inserted as Profile;
    } catch (err) {
      console.error("[supabaseAuthService] syncUserProfile failed:", err);
      return null;
    }
  },

  /**
   * Fetch user profile from Supabase
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) return null;
      return data as Profile;
    } catch {
      return null;
    }
  },

  /**
   * Update profile fields in Supabase
   */
  async updateProfile(
    userId: string,
    updates: { full_name?: string; role?: string; stellar_wallet?: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);
      return !error;
    } catch {
      return false;
    }
  },
};
