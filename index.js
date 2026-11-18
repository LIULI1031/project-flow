import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(HERE, "skills");
const PROVIDER_NAME = "project-flow-bundle";
const SOURCE = "bundle";
const RANK = 600;
const INVOCATION = { modelInvocable: true, userInvocable: true };

export const name = "project-flow-skill";
export const inject = ["skills"];

/** Register a readonly provider whose skills ship inside this bundle. */
export function apply(ctx) {
  ctx.skills.registerProvider((control) => new BundleSkillProvider(control.signal));
}

class BundleSkillProvider {
  name = PROVIDER_NAME;
  #signal;

  constructor(signal) {
    this.#signal = signal;
  }

  async list() {
    this.#signal?.throwIfAborted?.();
    let entries;
    try {
      entries = await readdir(SKILLS_DIR, { withFileTypes: true });
    } catch {
      return { candidates: [], complete: true };
    }
    const candidates = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const parsed = await parseSkillFile(join(SKILLS_DIR, entry.name, "SKILL.md"));
      if (parsed === undefined) continue;
      candidates.push(candidateOf(parsed));
    }
    return { candidates, complete: true };
  }

  async get(candidate) {
    this.#signal?.throwIfAborted?.();
    const file = candidate?.locator?.file;
    const parsed = await parseSkillFile(file);
    if (parsed === undefined) return undefined;
    return {
      name: parsed.name,
      description: parsed.description,
      ...(parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse }),
      invocation: INVOCATION,
      source: SOURCE,
      provider: PROVIDER_NAME,
      resourceBase: { kind: "directory", path: parsed.locator.directory },
      path: parsed.path,
      content: parsed.body,
    };
  }
}

function candidateOf(parsed) {
  return {
    name: parsed.name,
    description: parsed.description,
    ...(parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse }),
    invocation: INVOCATION,
    source: SOURCE,
    rank: RANK,
    provider: PROVIDER_NAME,
    locator: parsed.locator,
    path: parsed.path,
  };
}

async function parseSkillFile(file) {
  if (typeof file !== "string") return undefined;
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return undefined;
  }
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return undefined;
  const data = {};
  let index = 1;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") break;
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  if (index >= lines.length) return undefined;
  const skillName = data.name;
  const description = data.description;
  if (typeof skillName !== "string" || skillName.length === 0) return undefined;
  if (typeof description !== "string" || description.length === 0) return undefined;
  const body = lines.slice(index + 1).join("\n").trim();
  if (body.length === 0) return undefined;
  const parsed = {
    name: skillName,
    description,
    body,
    path: file,
    locator: { file, directory: dirname(file) },
  };
  if (typeof data.whenToUse === "string" && data.whenToUse.length > 0) {
    parsed.whenToUse = data.whenToUse;
  }
  return parsed;
}
