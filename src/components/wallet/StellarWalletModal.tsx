import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

interface StellarWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: (address: string) => void;
}

export const StellarWalletModal: React.FC<StellarWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected,
}) => {
  const { user, connectWallet } = useAuth();

  const [activeTab, setActiveTab] = useState<"freighter" | "albedo" | "manual">("freighter");
  const [manualKey, setManualKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateStellarAddress = (key: string): boolean => {
    return /^G[A-Z0-9]{55}$/.test(key.trim());
  };

  const handleConnectFreighter = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const win = window as any;
      let pubKey: string | null = null;

      if (win.freighterApi?.getPublicKey) {
        pubKey = await win.freighterApi.getPublicKey();
      } else if (win.stellar?.getPublicKey) {
        pubKey = await win.stellar.getPublicKey();
      }

      if (pubKey && validateStellarAddress(pubKey)) {
        await connectWallet(pubKey);
        setSuccessMsg(`Connected: ${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`);
        onWalletConnected?.(pubKey);
        setTimeout(onClose, 1200);
      } else {
        // Prompt for extension
        setErrorMsg("Freighter extension was not detected or was locked. Please ensure Freighter is installed or enter your public key manually.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Freighter connection failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectAlbedo = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      // Albedo web intent
      const albedoUrl = `https://albedo.link/confirm?intent=public_key&callback=${encodeURIComponent(window.location.href)}`;
      const popup = window.open(albedoUrl, "albedo_login", "width=500,height=600");
      if (!popup) {
        setErrorMsg("Please allow popups to connect via Albedo.");
      } else {
        setSuccessMsg("Complete authentication in the Albedo popup window.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Albedo connection failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = manualKey.trim();

    if (!validateStellarAddress(clean)) {
      setErrorMsg("Invalid Stellar public key. Must start with 'G' and be exactly 56 characters.");
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet(clean);
      setSuccessMsg(`Wallet linked: ${clean.slice(0, 6)}...${clean.slice(-6)}`);
      onWalletConnected?.(clean);
      setTimeout(onClose, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to link Stellar wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container border border-white/10 shadow-2xl p-4 sm:p-6 flex flex-col gap-5 z-10 text-left">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C1710] border border-[#E08A3E]/30 flex items-center justify-center text-[#E08A3E]">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Connect Stellar Wallet
              </h3>
              <p className="text-xs text-outline">Stellar Horizon & Soroban RPC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Linked Wallet if any */}
        {user?.walletAddress && (
          <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-label-caps text-outline">Currently Linked</span>
              <span className="font-mono text-xs text-[#E08A3E] truncate max-w-[240px]">
                {user.walletAddress}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Active
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-lowest border border-white/5 text-xs font-medium">
          <button
            onClick={() => { setActiveTab("freighter"); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "freighter" ? "bg-primary-container text-on-primary font-semibold shadow-sm" : "text-outline hover:text-on-surface"
            }`}
          >
            Freighter
          </button>
          <button
            onClick={() => { setActiveTab("albedo"); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "albedo" ? "bg-primary-container text-on-primary font-semibold shadow-sm" : "text-outline hover:text-on-surface"
            }`}
          >
            Albedo
          </button>
          <button
            onClick={() => { setActiveTab("manual"); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "manual" ? "bg-primary-container text-on-primary font-semibold shadow-sm" : "text-outline hover:text-on-surface"
            }`}
          >
            Direct Key
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-body-sm text-[12px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-body-sm text-[12px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Freighter */}
        {activeTab === "freighter" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Connect directly via the official <strong>Freighter Browser Extension</strong> to sign attestations and link your operator address.
            </p>
            <Button
              variant="primary"
              onClick={handleConnectFreighter}
              loading={isConnecting}
              className="w-full"
            >
              Authorize Freighter Extension
            </Button>
            <span className="text-[11px] text-center text-outline">
              Don't have Freighter? <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Install here</a>
            </span>
          </div>
        )}

        {/* Tab 2: Albedo */}
        {activeTab === "albedo" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Albedo</strong> allows secure Stellar web authentication without requiring a browser extension installed.
            </p>
            <Button
              variant="primary"
              onClick={handleConnectAlbedo}
              loading={isConnecting}
              className="w-full"
            >
              Open Albedo Web Connector
            </Button>
          </div>
        )}

        {/* Tab 3: Manual Public Key */}
        {activeTab === "manual" && (
          <form onSubmit={handleConnectManual} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface">
                Stellar Public Address (Ed25519)
              </label>
              <input
                type="text"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="G..."
                className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={isConnecting}
              className="w-full"
            >
              Verify & Link Address
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
