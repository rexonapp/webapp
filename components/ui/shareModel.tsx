"use client";

import { useState } from "react";
import { Facebook, MessageCircle } from "lucide-react";

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

  // const shareUrl =
  //   typeof window !== "undefined"
  //     ? `${window.location.origin}/property/${propertyId}`
  //     : "";


  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const shareUrl = `${baseUrl}/property/${propertyId}`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent("Check out this property");

  const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
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
          className="w-full border rounded-md p-2 text-sm mb-4"
        />

        {/* Social Share Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => window.open(whatsappUrl, "_blank")}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>

          <button
            onClick={() => window.open(facebookUrl, "_blank")}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
          >
            <Facebook size={18} />
            Facebook
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition"        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}