import type { PieceSymbol } from 'chess.js';
import type { Color } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import {
  hunyuanPieceGlbUrl,
  regionPieceGlbUrl,
  riggedTeamGlbUrl,
} from '../models/armyModels';

const DB_NAME = 'country-chess-models';
const STORE = 'glb';
const VERSION = 1;

export type ModelSlotKey = `${RegionId}:${PieceSymbol}`;

export function slotKey(region: RegionId, piece: PieceSymbol): ModelSlotKey {
  return `${region}:${piece}`;
}

const blobUrls = new Map<ModelSlotKey, string>();
let revision = 0;
const listeners = new Set<() => void>();

export function getCatalogRevision(): number {
  return revision;
}

export function subscribeModelCatalog(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function bump() {
  revision += 1;
  listeners.forEach((fn) => fn());
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

export async function loadModelCatalog(): Promise<void> {
  blobUrls.forEach((url) => URL.revokeObjectURL(url));
  blobUrls.clear();

  const db = await openDb();
  const keys = await new Promise<ModelSlotKey[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result as ModelSlotKey[]);
    req.onerror = () => reject(req.error);
  });

  await Promise.all(
    keys.map(
      (key) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE, 'readonly');
          const req = tx.objectStore(STORE).get(key);
          req.onsuccess = () => {
            const buf = req.result as ArrayBuffer | undefined;
            if (buf) {
              const blob = new Blob([buf], { type: 'model/gltf-binary' });
              blobUrls.set(key, URL.createObjectURL(blob));
            }
            resolve();
          };
          req.onerror = () => reject(req.error);
        }),
    ),
  );

  bump();
}

export function hasCustomModel(region: RegionId, piece: PieceSymbol): boolean {
  return blobUrls.has(slotKey(region, piece));
}

/** Workshop blob → Hunyuan team mesh → regional GLB. KayKit never loaded. */
export function resolveModelUrl(
  region: RegionId,
  team: Color,
  piece: PieceSymbol,
  source: 'rigged' | 'region' = 'rigged',
): string {
  const key = slotKey(region, piece);
  if (blobUrls.has(key)) return blobUrls.get(key)!;
  if (source === 'region') return regionPieceGlbUrl(region, piece);
  return riggedTeamGlbUrl(region, team);
}

export { hunyuanPieceGlbUrl, riggedTeamGlbUrl };

export function nationTeamUnitPath(region: RegionId, team: 'w' | 'b'): string {
  return `/textures/units/unit_${region}_${team}.png`;
}

export async function importGlbFile(
  region: RegionId,
  piece: PieceSymbol,
  file: File,
): Promise<void> {
  const buf = await file.arrayBuffer();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(buf, slotKey(region, piece));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const key = slotKey(region, piece);
  const prev = blobUrls.get(key);
  if (prev) URL.revokeObjectURL(prev);
  const blob = new Blob([buf], { type: 'model/gltf-binary' });
  blobUrls.set(key, URL.createObjectURL(blob));
  bump();
}

export async function clearCustomModel(region: RegionId, piece: PieceSymbol): Promise<void> {
  const key = slotKey(region, piece);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  const prev = blobUrls.get(key);
  if (prev) URL.revokeObjectURL(prev);
  blobUrls.delete(key);
  bump();
}

export async function exportGlbBlob(region: RegionId, piece: PieceSymbol): Promise<Blob | null> {
  const url = blobUrls.get(slotKey(region, piece));
  if (!url) return null;
  const res = await fetch(url);
  return res.blob();
}
