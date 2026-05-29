"use client";

import { useEffect, useState } from "react";

export default function PwaUpdatePrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setShow(true);
      });
    }
  }, []);

  const refreshApp = () => {
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-xl shadow-lg z-50">
      <p className="mb-3">New version available.</p>

      <div className="flex gap-2">
        <button
          onClick={refreshApp}
          className="bg-white text-black px-3 py-1 rounded"
        >
          Refresh
        </button>

        <button
          onClick={() => setShow(false)}
          className="border border-white px-3 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}