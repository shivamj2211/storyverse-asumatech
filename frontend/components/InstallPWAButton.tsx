"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIOS() {
  // iPhone/iPad/iPod + iPadOS desktop mode
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  // iOS Safari
  // @ts-ignore
  if (navigator.standalone) return true;
  // other browsers
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPWAButton() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  // show button only when it makes sense
  const [show, setShow] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    setMounted(true);

    // hide if already installed
    if (isStandalone()) {
      setShow(false);
      return;
    }

    // If iOS -> we can show button (it will show help)
    if (isIOS()) setShow(true);

    const onBIP = (e: Event) => {
      e.preventDefault();
      console.log("🔥 beforeinstallprompt fired (install is available)");
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    const onInstalled = () => {
      console.log("🎉 appinstalled event fired (install completed)");
      setDeferred(null);
      setShow(false);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted) return null;
  if (!show) return null;

  const onClick = async () => {
    console.log("👉 Install button clicked");
    console.log("standalone?", isStandalone());
    console.log("isIOS?", isIOS());
    console.log("hasDeferred?", !!deferred);

    // iOS Safari: no native prompt
    if (isIOS() && !deferred) {
      console.warn("ℹ️ iOS detected: no native install prompt, showing help modal");
      setShowIOSHelp(true);
      return;
    }

    if (!deferred) {
      console.warn(
        "❌ No deferred prompt available. Reason: Chrome hasn't fired beforeinstallprompt yet OR user dismissed earlier OR not installable yet."
      );
      return;
    }

    try {
      console.log("🚀 Calling deferred.prompt()");
      await deferred.prompt();

      const choice = await deferred.userChoice;
      console.log("📦 userChoice:", choice);

      if (choice.outcome === "accepted") {
        console.log("✅ User ACCEPTED install");
      } else {
        console.log("❌ User DISMISSED install");
      }
    } catch (err) {
      console.error("❌ prompt() failed:", err);
    } finally {
      setDeferred(null);
      setShow(false);
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
              <br />
              1) Safari me <b>Share</b> button dabao
              <br />
              2) <b>Add to Home Screen</b> select karo
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
