import React from "react";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Configure custom parameters if needed
      provider.setCustomParameters({
        prompt: "select_account"
      });
      
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      const code = err.code || "";
      const message = err.message || "";
      
      let msg = "An authentication error occurred. Please try again.";
      if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
        msg = "The sign-in popup was blocked by your browser. Please allow popups for this site or try again.";
      } else if (code === "auth/popup-closed-by-user") {
        msg = "The sign-in window was closed before completion. Please try again.";
      } else if (code === "auth/operation-not-allowed") {
        msg = "Google Sign-In is not enabled in your Firebase project. Please enable Google Sign-In in Firebase Console under Authentication -> Sign-in method.";
      } else if (message) {
        msg = message.replace("Firebase:", "").trim();
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md card-3d p-6 md:p-8 overflow-hidden shimmer"
        style={{
          background: "rgba(10, 13, 26, 0.95)",
          border: "1px solid rgba(108, 99, 255, 0.2)"
        }}
      >
        <div className="absolute inset-0 star-grid opacity-25 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-all cursor-pointer"
        >
          ✕
        </button>

        <div className="relative text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-[0_0_20px_rgba(108,99,255,0.4)]">
            ☁️
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sync Across Devices
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Connect your Google Account to automatically back up your study streaks, completed chapters, and task checklists. Access the same plan instantly on any device!
          </p>
        </div>

        {error && (
          <div className="relative mb-6 p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        <div className="relative space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 leading-normal pt-2">
            By continuing, your current local progress will be securely merged and saved to your cloud account.
          </p>
        </div>
      </div>
    </div>
  );
};
