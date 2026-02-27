"use client";

import { useState } from "react";

interface ShareModalProps {
  propertyId: any;
  title: string;
  onClose: () => void;
}

export default function ShareModal({
  propertyId,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/property/${propertyId}`
      : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-[380px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">
          Share Property
        </h3>

        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full border rounded-md p-2 text-sm mb-3"
        />

        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
