## Redis adapter + load-balancing setup for Socket.IO

This repository now supports the `@socket.io/redis-adapter`, which syncs rooms/emit logic across multiple backend instances by routing Socket.IO traffic through Redis Pub/Sub. Follow these steps to get the adapter working:

### 1. Install the new dependencies

From `Dharashiv_Backend/` run:

```bash
npm install "@socket.io/redis-adapter" redis
```

These packages already appear in `package.json`, so a normal `npm install` also works.

### 2. Configure Redis

The adapter reads `REDIS_URL` from `.env`. For local development use:

```env
REDIS_URL=redis://localhost:6379
```

Redis must be reachable at that address. You have three options:

1. **Install Redis natively (recommended for Windows)**  
   - Download and run the MSI from https://github.com/tporadowski/redis/releases  
   - Start the service (it listens on `localhost:6379` by default).

2. **Use WSL / Linux**  
   ```bash
   sudo apt update && sudo apt install redis-server
   sudo service redis-server start
   ```
   Keep Redis running while the backend is active.

3. **Use Docker (if you install it later)**  
   ```bash
   docker run --name dhr-redis -p 6379:6379 -d redis:8
   ```

If you *don’t* want to run Redis yet, leave `REDIS_URL` empty (or remove it) and the adapter will skip initialization, keeping the default in-memory behavior.

### 3. Start the backend

```bash
npm run dev
```

`src/server.js` now calls `initRedisAdapter(io)` before `listen()`. When Redis is reachable, Socket.IO attaches the adapter automatically; errors are logged and it falls back to the in-memory adapter if Redis cannot be reached.

### 4. Scale horizontally

Launch multiple backend instances (e.g., `PORT=4000`, `PORT=4001`, etc.) behind a load balancer. Ensure:

1. The load balancer uses sticky sessions so each socket connection stays on one instance.
2. All instances share the same `REDIS_URL` and `ACCESS_TOKEN_SECRET` values.
3. Clients hitting either instance can emit to rooms created anywhere—they’ll be delivered because Redis coordinates the emits.

### 5. Troubleshooting

- If you see `ECONNREFUSED ::1:6379`, Redis is unavailable. Start the Redis server or temporarily comment out the adapter call (`await initRedisAdapter(io)`).
- The adapter logs connections at startup (`[RedisAdapter] Connected to Redis…`). If it fails, it logs a warning and continues with the memory adapter.
- Keep Redis running while sockets are active. Stopping Redis will log errors but the backend stays online (just without cross-process synchronization).

That’s it. Once Redis is running and the adapter is initialized, typing/chat notifications flow across load-balanced instances because every server shares the same room state through Redis Pub/Sub.
