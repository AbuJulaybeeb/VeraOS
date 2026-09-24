declare module "@supabase/supabase-js" {
  export interface SupabaseClientOptions<SchemaName> {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
      storage?: any;
    };
  }

  export interface User {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
    created_at?: string;
    [key: string]: any;
  }

  export interface Session {
    user: User;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    [key: string]: any;
  }

  export interface AuthChangeEvent {
    [key: string]: any;
  }

  export interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    };
    error: any;
  }

  export interface OAuthResponse {
    data: {
      provider: string;
      url: string | null;
    };
    error: any;
  }

  export interface SupabaseClient {
    auth: {
      getSession(): Promise<{ data: { session: Session | null }; error: any }>;
      onAuthStateChange(
        callback: (event: any, session: Session | null) => void | Promise<void>
      ): { data: { subscription: { unsubscribe(): void } } };
      signInWithOAuth(options: {
        provider: string;
        options?: {
          redirectTo?: string;
          queryParams?: Record<string, string>;
          scopes?: string;
        };
      }): Promise<OAuthResponse>;
      signOut(): Promise<{ error: any }>;
      [key: string]: any;
    };
    from(table: string): any;
    channel(name: string): any;
    [key: string]: any;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): SupabaseClient;
}
