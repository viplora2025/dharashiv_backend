// src/config/redisAdapter.js

import env from "./env.js";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const REDIS_URL = env.REDIS_URL?.trim();

let pubClient;
let subClient;
let adapterInitialized = false;

const logPrefix = "[RedisAdapter]";

const handleClientError = (label, err) => {
  console.error(`${logPrefix} ${label} error:`, err?.message || err);
};

export const initRedisAdapter = async (io) => {
  if (!REDIS_URL) {
    console.info(`${logPrefix} REDIS_URL missing; sticking with in-memory Socket.IO adapter`);
    return;
  }

  if (adapterInitialized) {
    io.adapter(createAdapter(pubClient, subClient));
    return;
  }

  pubClient = createClient({ url: REDIS_URL });
  subClient = pubClient.duplicate();

  pubClient.on("error", (err) => handleClientError("pub", err));
  subClient.on("error", (err) => handleClientError("sub", err));

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    adapterInitialized = true;
    console.info(`${logPrefix} Connected to Redis at ${REDIS_URL}`);
  } catch (err) {
    console.error(`${logPrefix} Failed to initialize Redis adapter; falling back to in-memory.`, err?.message || err);
    try {
      await pubClient.disconnect();
      await subClient.disconnect();
    } catch {
      /* ignore */
    }
    pubClient = null;
    subClient = null;
  }
};

export const shutdownRedisAdapter = async () => {
  if (!pubClient || !subClient) return;
  try {
    await Promise.all([pubClient.disconnect(), subClient.disconnect()]);
  } catch (err) {
    console.error(`${logPrefix} Shutdown error:`, err?.message || err);
  }
};
