"use client";

import { Image, Play, FileText } from "lucide-react";

const ICONS = {
  image: Image,
  video: Play,
  document: FileText,
};

const SIZES = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

interface ImagePlaceholderProps {
  type?: "image" | "video" | "document";
  filename?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ImagePlaceholder({ type = "image", filename, size = "md", className = "" }: ImagePlaceholderProps) {
  const Icon = ICONS[type];
  return (
    <div className={`flex flex-col items-center justify-center bg-[#FAF9F7] rounded-lg ${SIZES[size]} ${className}`}>
      <Icon className="h-5 w-5 text-[#8A8580]" />
      {filename && <p className="text-[10px] text-[#8A8580] truncate max-w-full px-1 mt-1">{filename}</p>}
    </div>
  );
}
