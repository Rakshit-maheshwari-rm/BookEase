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
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);

app.use(express.json());
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
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
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
  VisitorLog.create(logData).catch((err) => {
    console.error("Failed to save visitor log:", err.message);
  });

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