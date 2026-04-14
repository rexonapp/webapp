"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import BackButton from "./BackButton";
import ShareModal from "./shareModel";

export default function PropertyHeader({ propertyId, title }: any) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <BackButton />

        <button
          onClick={() => setShowShare(true)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500"
        >
          <Share2 size={18} />
        </button>
      </div>

      {showShare && (
        <ShareModal
          propertyId={propertyId}
          title={title}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}