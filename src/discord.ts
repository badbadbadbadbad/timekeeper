const DISCORD_API_BASE = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

async function discordRequest(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${DISCORD_API_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Discord API error ${response.status}: ${await response.text()}`);
    }
    return response.json();
}

async function getUserVoiceChannelId(guildId: string, userId: string): Promise<string | null> {
    const voiceState = await discordRequest(`/guilds/${guildId}/voice-states/${userId}`);
    return voiceState?.channel_id ?? null;
}

export async function isAnyoneInChannel(guildId: string, channelId: string, userIds: string[]): Promise<boolean> {
    for (const userId of userIds) {
        const currentChannelId = await getUserVoiceChannelId(guildId, userId);
        if (currentChannelId === channelId) return true;
    }
    return false;
}

export async function postMessage(channelId: string, content: string): Promise<void> {
    await discordRequest(`/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}