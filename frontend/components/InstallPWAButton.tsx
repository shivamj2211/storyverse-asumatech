"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  // @ts-ignore
  if (navigator.standalone) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPWAButton() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onBIP = (e: Event) => {
      e.preventDefault();
      console.log("🔥 beforeinstallprompt fired");
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      console.log("🎉 appinstalled fired");
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // SSR safe
  if (!mounted) return null;

  // If already installed, hide button
  if (isStandalone()) return null;

  const onClick = async () => {
    console.log("👉 Install clicked. deferred?", !!deferred, "isIOS?", isIOS());

    // iOS: no native prompt
    if (isIOS() && !deferred) {
      setShowIOSHelp(true);
      return;
    }

    if (!deferred) {
      console.warn(
        "❌ Install prompt not available yet. (beforeinstallprompt not fired)\n" +
          "Common reasons: previously dismissed, browser rules/engagement, or not installable."
      );
      // fallback: show Chrome menu instruction
      alert(
        "Install option abhi browser prompt nahi de raha.\n\nTry:\n1) Chrome menu (⋮) → Install app / Add to Home screen\n2) Incognito me test\n3) Clear site data + reload"
      );
      return;
    }

    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      console.log("📦 userChoice:", choice);
    } catch (e) {
      console.error("❌ prompt failed:", e);
    } finally {
      setDeferred(null);
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
                   bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] transition"
      >
        Install App
      </button>

      {showIOSHelp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-lg border border-black/10 dark:border-white/10">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Add to Home Screen
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              iPhone/iPad me install karne ke liye:
              <br />1) Safari me <b>Share</b> button dabao
              <br />2) <b>Add to Home Screen</b> select karo
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowIOSHelp(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
