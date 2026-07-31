"use client";

import { useState } from "react";
import { ShareIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-[#B19276] transition-colors"
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          کپی شد!
        </>
      ) : (
        <>
          <ShareIcon className="w-4 h-4" />
          اشتراک گذاری
        </>
      )}
    </button>
  );
}
