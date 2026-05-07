import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();

export async function readJsonFile<T>(relativePath: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(root, relativePath);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(relativePath: string, value: T): Promise<void> {
  const filePath = path.join(root, relativePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}
