import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  walletAddress?: string;
  authProvider?: "password" | "google" | "stellar";
  createdAt?: string;
}

interface StoredAccount extends User {
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (customEmail?: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  connectWallet: (customAddress?: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_AUTH_KEY = "vera_auth_user_v1";
const STORAGE_USERS_KEY = "vera_registered_users_v1";

function getStoredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage quota issues
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signup");

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  }, [user]);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 300));
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.passwordHash !== pass) {
        throw new Error("Invalid password for this account.");
      }
      const activeUser: User = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        avatar: existing.avatar,
        walletAddress: existing.walletAddress,
        authProvider: "password",
      };
      setUser(activeUser);
      setIsAuthModalOpen(false);
      return true;
    }

    // If account wasn't in local registry yet, register and authenticate them as a live operator
    const newId = `usr_${Date.now().toString(36)}`;
    const derivedName = cleanEmail.split("@")[0].replace(/[._-]/g, " ") || "Operator";
    const displayName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    const newAccount: StoredAccount = {
      id: newId,
      name: displayName,
      email: cleanEmail,
      role: "Lead Systems Engineer",
      passwordHash: pass,
      authProvider: "password",
      createdAt: new Date().toISOString(),
    };
    saveStoredUsers([...users, newAccount]);

    setUser({
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      authProvider: "password",
    });
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 350));
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new Error("An account with this email already exists. Please sign in.");
    }

    const newId = `usr_${Date.now().toString(36)}`;
    const newAccount: StoredAccount = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      role: "AI Verification Engineer",
      passwordHash: pass,
      authProvider: "password",
      createdAt: new Date().toISOString(),
    };
    saveStoredUsers([...users, newAccount]);

    setUser({
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      authProvider: "password",
    });
    setIsAuthModalOpen(false);
    return true;
  };

  const connectWallet = async (customAddress?: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    let address = customAddress?.trim();

    // Check for Freighter browser extension
    if (!address && typeof window !== "undefined") {
      const win = window as unknown as {
        freighterApi?: {
          getPublicKey?: () => Promise<string>;
          isConnected?: () => Promise<boolean>;
        };
        stellar?: {
          getPublicKey?: () => Promise<string>;
        };
      };

      if (win.freighterApi?.getPublicKey) {
        try {
          const key = await win.freighterApi.getPublicKey();
          if (key && key.startsWith("G")) {
            address = key;
          }
        } catch {
          // Extension cancelled or locked
        }
      } else if (win.stellar?.getPublicKey) {
        try {
          const key = await win.stellar.getPublicKey();
          if (key && key.startsWith("G")) {
            address = key;
          }
        } catch {
          // Fallback
        }
      }
    }

    if (!address) {
      // Default to official Stellar Testnet auditor address if no extension detected
      address = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    }

    const walletUser: User = {
      id: `usr_stellar_${address.slice(0, 8)}`,
      name: `Stellar Auditor (${address.slice(0, 4)}...${address.slice(-4)})`,
      email: `${address.slice(0, 8).toLowerCase()}@stellar.org`,
      role: "Onchain Protocol Auditor",
      walletAddress: address,
      authProvider: "stellar",
    };

    setUser(walletUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithGoogle = async (customEmail?: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 350));
    const email = (customEmail?.trim() || "operator@veraos.network").toLowerCase();
    const derivedName = email.split("@")[0].replace(/[._-]/g, " ");
    const displayName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const googleUser: User = {
      id: `usr_g_${Date.now().toString(36)}`,
      name: displayName,
      email,
      role: "Infrastructure Lead",
      authProvider: "google",
    };

    setUser(googleUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        signup,
        connectWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
