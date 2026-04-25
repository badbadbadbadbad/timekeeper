import "dotenv/config";
import { readState, writeState } from "./storage";
import { isAnyoneInChannel, postMessage } from "./discord";

const GUILD_ID         = process.env.DISCORD_GUILD_ID!;
const VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID!;
const TEXT_CHANNEL_ID  = process.env.DISCORD_TEXT_CHANNEL_ID!;
const TRACKED_USER_IDS = process.env.DISCORD_USER_IDS!.split(",").map((id) => id.trim());

const POLL_INTERVAL_MS = 60_000; // 1 minute

/** Formats a duration in seconds into a human-readable string like "14h 23m". */
function formatDuration(totalSeconds: number): string {
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

async function poll(): Promise<void> {
    const now   = new Date();
    const state = await readState();

    const someoneIsInChannel = await isAnyoneInChannel(
        GUILD_ID,
        VOICE_CHANNEL_ID,
        TRACKED_USER_IDS
    );

    if (someoneIsInChannel) {
        if (!state.sessionStart) {
            state.sessionStart = now.toISOString();
            await writeState(state);
            console.log(`[${now.toISOString()}] Session started`);
        }
        return;
    }

    if (!state.sessionStart) {
        return;
    }

    // Session ended
    const sessionStart    = new Date(state.sessionStart);
    const durationSeconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
    const isNewRecord     = durationSeconds > state.recordSeconds;

    console.log(
        `[${now.toISOString()}] Session ended. ` +
        `Duration: ${formatDuration(durationSeconds)}, ` +
        `Record: ${formatDuration(state.recordSeconds)}`
    );

    if (isNewRecord) {
        state.recordSeconds = durationSeconds;
        await postMessage(
            TEXT_CHANNEL_ID,
            `**New record!** Time: **${formatDuration(durationSeconds)}**!`
        );
        console.log(`New record set: ${formatDuration(durationSeconds)}`);
    }

    state.sessionStart = null;
    await writeState(state);
}

async function main(): Promise<void> {
    console.log("Timekeeper started. Polling every minute.");
    await poll();
    setInterval(async () => {
        try {
            await poll();
        } catch (err) {
            console.error("Poll error (will retry next interval):", err);
        }
    }, POLL_INTERVAL_MS);
}

main().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
});