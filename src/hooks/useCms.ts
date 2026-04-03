"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function useMut<T>(url: string, method: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => {
      const res = await fetch(url, {
        method,
        ...(method !== "DELETE" && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

function useMutWithId<T>(basePath: string, method: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: T & { id: string }) => {
      const { id, ...data } = input as Record<string, unknown> & { id: string };
      const res = await fetch(`${basePath}/${id}`, {
        method,
        ...(method !== "DELETE" && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

function useDelById(basePath: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${basePath}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== SITE SETTINGS ====================
export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useSiteSettings() {
  return useQuery<{ settings: SiteSetting[] }>({
    queryKey: ["cmsSettings"],
    queryFn: () => fetchJSON("/api/cms/settings"),
  });
}

type UpsertSetting = { key: string; value: Record<string, unknown> };
const settingKeys = [["cmsSettings"]];
export const useUpsertSiteSetting = () =>
  useMut<UpsertSetting>("/api/cms/settings", "PUT", settingKeys);

// ==================== SLIDESHOW ====================
export interface SlideshowItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function useSlideshowItems() {
  return useQuery<{ items: SlideshowItem[] }>({
    queryKey: ["cmsSlideshow"],
    queryFn: () => fetchJSON("/api/cms/slideshow"),
  });
}

type CreateSlide = {
  imageUrl: string;
  caption?: string | null;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};
type UpdateSlide = { id: string } & Partial<CreateSlide>;
const slideKeys = [["cmsSlideshow"]];
export const useCreateSlideshowItem = () =>
  useMut<CreateSlide>("/api/cms/slideshow", "POST", slideKeys);
export const useUpdateSlideshowItem = () =>
  useMutWithId<UpdateSlide>("/api/cms/slideshow", "PATCH", slideKeys);
export const useDeleteSlideshowItem = () =>
  useDelById("/api/cms/slideshow", slideKeys);

// ==================== MENU ITEMS ====================
export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  position: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  children?: CmsMenuItem[];
}

export function useCmsMenuItems(position?: string) {
  const url = buildUrl("/api/cms/menu-items", { position });
  return useQuery<{ items: CmsMenuItem[] }>({
    queryKey: ["cmsMenuItems", position],
    queryFn: () => fetchJSON(url),
  });
}

type CreateMenuItem = {
  label: string;
  url: string;
  position?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};
type UpdateMenuItem = { id: string } & Partial<CreateMenuItem>;
const menuKeys = [["cmsMenuItems"]];
export const useCreateCmsMenuItem = () =>
  useMut<CreateMenuItem>("/api/cms/menu-items", "POST", menuKeys);
export const useUpdateCmsMenuItem = () =>
  useMutWithId<UpdateMenuItem>("/api/cms/menu-items", "PATCH", menuKeys);
export const useDeleteCmsMenuItem = () =>
  useDelById("/api/cms/menu-items", menuKeys);

// ==================== STATIC PAGES ====================
export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { blocks: number };
  blocks?: PageBlock[];
}

export function useCmsPages(isPublished?: boolean) {
  const url = buildUrl("/api/cms/pages", {
    isPublished: isPublished !== undefined ? String(isPublished) : undefined,
  });
  return useQuery<{ pages: StaticPage[] }>({
    queryKey: ["cmsPages", isPublished],
    queryFn: () => fetchJSON(url),
  });
}

export function useCmsPage(id: string) {
  return useQuery<{ page: StaticPage }>({
    queryKey: ["cmsPage", id],
    queryFn: () => fetchJSON(`/api/cms/pages/${id}`),
    enabled: !!id,
  });
}

type CreatePage = {
  title: string;
  slug?: string;
  content?: string;
  metaDescription?: string | null;
  isPublished?: boolean;
};
type UpdatePage = { id: string } & Partial<CreatePage>;
const pageKeys = [["cmsPages"]];
export const useCreateCmsPage = () =>
  useMut<CreatePage>("/api/cms/pages", "POST", pageKeys);
export const useUpdateCmsPage = () =>
  useMutWithId<UpdatePage>("/api/cms/pages", "PATCH", pageKeys);
export const useDeleteCmsPage = () =>
  useDelById("/api/cms/pages", pageKeys);

// ==================== PAGE BLOCKS ====================
export interface PageBlock {
  id: string;
  pageId: string;
  type: string;
  content: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
}

export function usePageBlocks(pageId: string) {
  return useQuery<{ blocks: PageBlock[] }>({
    queryKey: ["cmsBlocks", pageId],
    queryFn: () => fetchJSON(`/api/cms/pages/${pageId}/blocks`),
    enabled: !!pageId,
  });
}

const blockKeys = (pageId: string) => [["cmsBlocks", pageId]];

export function useCreatePageBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      type: string;
      content?: Record<string, unknown>;
      sortOrder?: number;
    }) => {
      const res = await fetch(`/api/cms/pages/${pageId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      blockKeys(pageId).forEach((k) =>
        qc.invalidateQueries({ queryKey: k })
      ),
  });
}

export function useUpdatePageBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      type?: string;
      content?: Record<string, unknown>;
      sortOrder?: number;
    }) => {
      const { id, ...data } = input;
      const res = await fetch(`/api/cms/pages/${pageId}/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      blockKeys(pageId).forEach((k) =>
        qc.invalidateQueries({ queryKey: k })
      ),
  });
}

export function useDeletePageBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      const res = await fetch(
        `/api/cms/pages/${pageId}/blocks/${blockId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      blockKeys(pageId).forEach((k) =>
        qc.invalidateQueries({ queryKey: k })
      ),
  });
}
