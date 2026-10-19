import { dbList, dbPut, dbUpdate, dbRemove } from './db';

export interface UICustomStyle {
  // Alignment
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  
  // Reordering (CSS order in flex/grid)
  order?: number;

  // Margin / Offset (Nudge)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  offsetX?: number;
  offsetY?: number;

  // Garis / Border / Dividers
  borderWidth?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor?: string;

  // Visibility & Layout
  display?: 'none' | 'block' | 'inline-block' | 'flex' | 'grid';
  opacity?: number;
  fontSize?: number; // in px
  
  // Custom manual CSS if needed
  customCss?: string;
}

export interface UICustomizationItem {
  id: string; // unique item id (e.g. hash or timestamp-based)
  selector: string; // CSS selector to target the element
  label?: string; // Human readable label (e.g. "Tombol Pesan", "Garis Pembatas")
  styles: UICustomStyle;
  customText?: string; // Optional text replacement
  updatedAt: string;
}

export interface PageCustomizationDoc {
  id: string; // Page pathname as document ID, e.g. "root" for "/", "cari-kost", "global" for all
  pagePath: string; // e.g. "/", "/cari-kost", "*"
  items: UICustomizationItem[];
  updated_at: string;
}

const COLLECTION = 'ui_customizations';

export function normalizePagePath(path: string): string {
  if (!path || path === '/') return 'root';
  // sanitize path to be a valid doc ID: replace / with _
  return path.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'root';
}

export async function getAllCustomizations(): Promise<PageCustomizationDoc[]> {
  try {
    return await dbList<PageCustomizationDoc>(COLLECTION, () => []);
  } catch (err) {
    console.error('[ui-customizer-store] Gagal mengambil data kustomisasi:', err);
    return [];
  }
}

export async function getCustomizationsForPage(pagePath: string): Promise<UICustomizationItem[]> {
  const docs = await getAllCustomizations();
  const pageId = normalizePagePath(pagePath);
  
  // Ambil kustomisasi spesifik halaman + kustomisasi global (*)
  const pageDoc = docs.find((d) => d.id === pageId || d.pagePath === pagePath);
  const globalDoc = docs.find((d) => d.id === 'global' || d.pagePath === '*');

  const itemsMap = new Map<string, UICustomizationItem>();

  if (globalDoc?.items) {
    globalDoc.items.forEach((item) => itemsMap.set(item.selector, item));
  }
  if (pageDoc?.items) {
    pageDoc.items.forEach((item) => itemsMap.set(item.selector, item));
  }

  return Array.from(itemsMap.values());
}

export async function savePageCustomization(
  pagePath: string,
  items: UICustomizationItem[]
): Promise<PageCustomizationDoc> {
  const docId = normalizePagePath(pagePath);
  const now = new Date().toISOString();

  const newDoc: PageCustomizationDoc = {
    id: docId,
    pagePath: pagePath || '/',
    items,
    updated_at: now,
  };

  const existingDocs = await getAllCustomizations();
  const exists = existingDocs.some((d) => d.id === docId);

  if (exists) {
    await dbUpdate<PageCustomizationDoc>(
      COLLECTION,
      docId,
      () => newDoc,
      () => []
    );
  } else {
    await dbPut<PageCustomizationDoc>(COLLECTION, newDoc, () => []);
  }

  return newDoc;
}

export async function resetPageCustomization(pagePath: string): Promise<boolean> {
  const docId = normalizePagePath(pagePath);
  try {
    return await dbRemove(COLLECTION, docId, () => []);
  } catch (err) {
    console.error('[ui-customizer-store] Gagal mereset kustomisasi:', err);
    return false;
  }
}

