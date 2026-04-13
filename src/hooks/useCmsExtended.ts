"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

// ==================== GALLERY ====================

export interface GalleryItem {
  id: string;
  imageUrl: string;
  fileKey: string | null;
  title: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function useGalleryItems(category?: string) {
  const params = category ? `?category=${category}` : "";
  return useQuery<{ items: GalleryItem[] }>({
    queryKey: ["cmsGallery", category],
    queryFn: () => fetchJSON(`/api/cms/gallery${params}`),
  });
}

const galleryKeys = [["cmsGallery"]];

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<GalleryItem>) => {
      const res = await fetch("/api/cms/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => galleryKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<GalleryItem>) => {
      const res = await fetch(`/api/cms/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => galleryKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => galleryKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== MEDIA ====================

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  fileKey: string | null;
  mimeType: string;
  size: number | null;
  type: string;
  altText: string | null;
  createdAt: string;
}

export function useMediaFiles(type?: string) {
  const params = type ? `?type=${type}` : "";
  return useQuery<{ files: MediaFile[] }>({
    queryKey: ["cmsMedia", type],
    queryFn: () => fetchJSON(`/api/cms/media${params}`),
  });
}

const mediaKeys = [["cmsMedia"]];

export function useCreateMediaFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<MediaFile, "id" | "createdAt">) => {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => mediaKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteMediaFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => mediaKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== HOME MODULES ====================

export interface HomeModuleItem {
  id: string;
  moduleKey: string;
  productId: string | null;
  sortOrder: number;
  createdAt: string;
}

export function useHomeModuleItems(moduleKey?: string) {
  const params = moduleKey ? `?moduleKey=${moduleKey}` : "";
  return useQuery<{ items: HomeModuleItem[] }>({
    queryKey: ["cmsHomeModules", moduleKey],
    queryFn: () => fetchJSON(`/api/cms/home-modules${params}`),
  });
}

const homeModuleKeys = [["cmsHomeModules"]];

export function useCreateHomeModuleItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { moduleKey: string; productId: string; sortOrder?: number }) => {
      const res = await fetch("/api/cms/home-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => homeModuleKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteHomeModuleItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/home-modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => homeModuleKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== REORDER ====================

export function useReorder(basePath: string, invalidateKeys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`${basePath}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== STORAGE FEATURE FLAG ====================

export function useStorageFeature() {
  return useQuery<{ uploadEnabled: boolean }>({
    queryKey: ["storageFeature"],
    queryFn: () => fetchJSON("/api/features/storage"),
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}
