import { Kost } from './types';
import { INITIAL_KOSTS } from './mock-data';
import { dbList, dbPut, dbRemove, dbUpdate } from './db';

const KOSTS = 'kosts';
const seed = () => INITIAL_KOSTS;

export async function getAllKosts(): Promise<Kost[]> {
  return dbList<Kost>(KOSTS, seed);
}

export async function getKostBySlug(slug: string): Promise<Kost | undefined> {
  return (await getAllKosts()).find((k) => k.slug === slug);
}

export async function getKostById(id: string): Promise<Kost | undefined> {
  return (await getAllKosts()).find((k) => k.id === id);
}

export async function addKost(kost: Kost): Promise<Kost> {
  return dbPut<Kost>(KOSTS, kost, seed);
}

export async function updateKost(id: string, partial: Partial<Kost>): Promise<Kost | null> {
  const updated = await dbUpdate<Kost>(
    KOSTS,
    id,
    (current) => ({ ...current, ...partial, id: current.id, updated_at: new Date().toISOString() }),
    seed
  );
  return updated ?? null;
}

export async function deleteKost(id: string): Promise<boolean> {
  return dbRemove(KOSTS, id, seed);
}
