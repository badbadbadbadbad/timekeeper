import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { BotState } from "./types";

const DATA_DIR = path.join(__dirname, "..", "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

const DEFAULT_STATE: BotState = {
    sessionStart: null,
    recordSeconds: 0,
};

export async function readState(): Promise<BotState> {
    try {
        const raw = await readFile(STATE_FILE, "utf-8");
        return JSON.parse(raw) as BotState;
    } catch {
        return DEFAULT_STATE;
    }
}

export async function writeState(state: BotState): Promise<void> {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}