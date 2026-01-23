// This is the import to use the memory of the server as the storage
import { RateLimiterMemory } from "rate-limiter-flexible";

// 1st Implementation of Rate Limiting

// // Configure the bucket
// const opts = {
//   points: 10, // Total tokens in the bucket
//   duration: 20, // Refill time: it takes 20 seconds to get all 10 tokens back
// };

// const rateLimiter = new RateLimiterMemory(opts);

// export const rateLimitMiddleware = (req, res, next) => {
//   // Use the user's IP address as the unique key
//   rateLimiter
//     .consume(req.ip)
//     .then((rateLimiterRes) => {
//       // Success! Move to the next function
//       res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
//       next();
//     })
//     .catch((rateLimiterRes) => {
//       // Bucket is empty!
//       const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
//       res.set("Retry-After", String(secs));
//       res.status(429).send("Too Many Requests - Slow down, friend.");
//     });
// };

// // Apply to specific routes
// app.get("/api/search", rateLimitMiddleware, (req, res) => {
//   res.send("Search results");
// });

// 2nd Implementation of Rate Limiting

// 1. Create the instance (This creates the "Hidden Object" in RAM)
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 tokens
  duration: 1, // per 1 second
});

// 2. Create the Middleware function
export const rateLimitMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then((rateLimiterRes) => {
      // Success! Optional: attach headers
      res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
      next();
    })
    // This catch is the same with what's below. But this time, the one below is making sure that the error is a too many request one and then sending the appropriate message. This is cause the error may be due to some internal issues too.
    // .catch((rateLimiterRes) => {
    //   // Blocked!
    //   const secondsToWait = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
    //   res.set("Retry-After", String(secondsToWait));
    //   res.status(429).send("Too many requests. Wait a second.");
    // })
    .catch((rej) => {
      if (rej.msBeforeNext !== undefined) {
        // This is a rate limit block
        const secondsToWait = Math.round(rej.msBeforeNext / 1000) || 1;
        res.set("Retry-After", String(secondsToWait));
        res.status(429).send("Too many requests.");
      } else {
        // This is a different error (like Redis being down or the server suddenly being down)
        res.status(500).send("Internal Server Error");
      }
    });
};

// 3rd Implementation of Rate Limiting this time using Redis as the storage

// const Redis = require("ioredis"); // Needs: npm install ioredis

// This is the import to use Redis as the storage
// import { RateLimiterRedis } from "rate-limiter-flexible";

// // 1. Connect to your Redis server
// const redisClient = new Redis({
//   host: "127.0.0.1", // Change this to your Redis URL in production
//   port: 6379,
//   enableOfflineQueue: false,
// });

// // 2. Create the instance pointing to Redis
// const rateLimiter = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: "middleware", // This keeps your Redis organized
//   points: 10,
//   duration: 1,
// });

// // 3. The Middleware (Code stays exactly the same as Memory!)
// export const rateLimitMiddleware = (req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => {
//       next();
//     })
//     .catch(() => {
//       res.status(429).send("Too many requests. Redis says stop.");
//     });
// };
