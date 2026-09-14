import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  loginAsDemo: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  connectWallet: () => Promise<boolean>;
  logout: () => void;
}

const STORAGE_AUTH_KEY = "vera_auth_user_v1";

export const DEMO_USER: User = {
  id: "usr_deejah",
  name: "Deejah",
  email: "Deejahai@gmail.com",
  role: "Lead Infrastructure Engineer",
  walletAddress: "0x8453...9bf2",
};

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

  const login = async (email: string, _pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split("@")[0].replace(".", " ") || "Operator",
      email,
      role: "AI Systems Engineer",
      walletAddress: "0x" + Math.random().toString(16).slice(2, 10),
    };
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (name: string, email: string, _pass: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: "Protocol Engineer",
      walletAddress: "0x" + Math.random().toString(16).slice(2, 10),
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const connectWallet = async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    const walletUser: User = {
      id: `usr_wallet_${Date.now()}`,
      name: "Base Wallet User",
      email: "web3.agent@base.org",
      role: "Attestation Prover",
      walletAddress: "0x89bf2e91aa4c2810a9918230fec00281b378129031",
    };
    setUser(walletUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginAsDemo = async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 250));
    setUser(DEMO_USER);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 350));
    setUser(DEMO_USER);
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
        loginAsDemo,
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
