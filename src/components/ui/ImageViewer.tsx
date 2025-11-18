"use client";

import { X } from "lucide-react";
import CloudinaryImage from "@/components/ui/cloudinary-image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ImageViewerProps {
  url: string;
  alt: string;
  onClose: () => void;
}

export default function ImageViewer({ url, alt, onClose }: ImageViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70"
      >
        <X className="text-white h-6 w-6" />
      </button>

      {/* Imagen grande */}
      <div className="relative w-[90vw] h-[80vh]">
        <CloudinaryImage
          src={url}
          alt={alt}
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>
    </div>,
    document.body
  );
}