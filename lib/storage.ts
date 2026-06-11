import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // directory exists
  }
}

export async function readJson<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    await fs.writeFile(filePath, "[]", "utf-8");
    return [];
  }
}

export async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function findById<T extends { id: string }>(
  filename: string,
  id: string
): Promise<T | null> {
  const items = await readJson<T>(filename);
  return items.find((item) => item.id === id) ?? null;
}
