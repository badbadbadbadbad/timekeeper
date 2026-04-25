# timekeeper

A lightweight Node.js Discord bot that tracks the longest non-empty voice channel state 
and announces new records in a text channel. The bot will always show as offline in the server
due to only utilizing Discord's REST API instead of a persistent connection.

Session timing and the current record are persisted to a local `data/state.json` file.
Running on a Raspi 2 via pm2, but you can do other things.

---

## Prerequisites

- Node.js 18 LTS (because my Raspi 2 is 32-bit and cannot go higher)
- Discord bot token
---

## Discord Setup

1. Go to https://discord.com/developers/applications -> **New Application**.
2. Go to **Bot** -> enable **Server Members Intent** and **Presence Intent**
   under Privileged Gateway Intents.
3. Copy your bot token to `DISCORD_BOT_TOKEN`.
4. Go to **OAuth2 -> URL Generator**. Scopes: `bot`.
   Permissions: `Send Messages`, `View Channels`. Open the generated URL
   and invite the bot to your server.
5. In Discord: **User Settings -> Advanced -> Developer Mode** (enable it).
   Right-click your server icon -> **Copy Server ID** -> `DISCORD_GUILD_ID`.
   Right-click the voice channel -> **Copy Channel ID** -> `DISCORD_VOICE_CHANNEL_ID`.
   Right-click the text channel -> **Copy Channel ID** -> `DISCORD_TEXT_CHANNEL_ID`.
   Right-click each user -> **Copy User ID** -> `DISCORD_USER_IDS` (comma-separated).

---

## Local Development

```bash
npm install
cp .env.example .env    # fill in your values
npm run dev
```

---

## Production (e.g. Raspberry Pi)

```bash
npm install
npm run build
pm2 start dist/index.js --name timekeeper
pm2 save
pm2 startup
```