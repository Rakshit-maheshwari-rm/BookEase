const NodeCache = require("node-cache");
const myCache = new NodeCache();

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ error: "You do not have permission to perform this action" });
  }
  next();
};

module.exports.cacheMiddleware = (durationInSeconds) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = myCache.get(key);

    if (cachedResponse) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(cachedResponse);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        const stringifiedBody = JSON.stringify(body);
        myCache.set(key, stringifiedBody, durationInSeconds);
      } catch (err) {
        console.error("Caching error:", err);
      }
      return originalJson(body);
    };
    next();
  };
};