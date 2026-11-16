const express = require("express");
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require('dotenv').config();
const mongoose = require('mongoose');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const path = require("path");
const MongoStore = require('connect-mongo').default;
const User = require("./models/User");
const UserRoutes = require("./routes/User");
const ListingRoutes = require("./routes/Listing");
const RatingRoutes = require("./routes/Rating");
const NotificationRoutes = require("./routes/Notification");
const BookingRoutes = require("./routes/Booking");
const HostRoutes = require("./routes/Host");
const WithdrawalRoutes = require("./routes/Withdrawals");
const SettingRoutes = require("./routes/Setting");

const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const VisitorLog = require("./models/VisitorLog");

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected!')).catch((err) => { console.log(err) });

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

app.use("/uploads", express.static(path.resolve("uploads")));
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
  process.env.FRONT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(requestIp.mw());

const logBuffer = [];
const MAX_BUFFER_SIZE = 50;
const BUFFER_SAFETY_CAP = 500;

const flushVisitorLogs = async () => {
  if (logBuffer.length === 0) return;
  const batch = logBuffer.splice(0, logBuffer.length);
  try {
    await VisitorLog.insertMany(batch, { ordered: false });
  } catch (err) {
    console.error("Batch visitor log error:", err.message);
  }
};

const logFlushInterval = setInterval(flushVisitorLogs, 10000);
if (logFlushInterval.unref) logFlushInterval.unref();

app.use((req, res, next) => {

  if (req.method === 'OPTIONS') return next();
  if (['/health', '/ping', '/favicon.ico', '/robots.txt'].includes(req.url)) return next();
  if (req.url.match(/\.(ico|png|jpg|jpeg|gif|css|js|map|json|txt|xml|html)$/i)) return next();

  const clientIp = req.clientIp || req.headers['x-forwarded-for'] || (req.socket ? req.socket.remoteAddress : null) || "unknown";
  const geo = geoip.lookup(clientIp);

  const logData = {
    ip: clientIp,
    method: req.method,
    url: req.url,
    userAgent: req.headers["user-agent"],
    referer: req.headers["referer"],
    user: req.user ? req.user._id : null
  };

  if (geo) {
    logData.country = geo.country;
    logData.region = geo.region;
    logData.city = geo.city;
    logData.timezone = geo.timezone;
    if (geo.ll && geo.ll.length === 2) {
      logData.latitude = geo.ll[0];
      logData.longitude = geo.ll[1];
    }
  }

  if (logBuffer.length < BUFFER_SAFETY_CAP) {
    logBuffer.push(logData);
  }

  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    setImmediate(flushVisitorLogs);
  }

  next();
});

app.use('/', UserRoutes);
app.use('/listing', ListingRoutes);
app.use('/rating', RatingRoutes);
app.use('/notification', NotificationRoutes);
app.use('/booking', BookingRoutes);
app.use('/host', HostRoutes);
app.use('/withdrawal', WithdrawalRoutes);
app.use('/setting', SettingRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: "An unexpected error occurred" });
});

app.listen(PORT, () => {
  console.log("server started");
});