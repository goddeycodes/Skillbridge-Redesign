const express = require('express');
const http = require('http');
const net = require('net');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { Server } = require('socket.io');
require('dotenv').config();

const configurePassport = require('./config/passport');
const { connectPostgres, connectMongo } = require('./config/database');

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }
});
require('./sockets/chatSocket')(io);

// ─── Core Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Passport ────────────────────────────────────────────────
app.use(passport.initialize());
configurePassport();

// ─── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' }
});
app.use('/api/', globalLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login',    authLimiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));
app.use('/api/skills',    require('./routes/skillRoutes'));
app.use('/api/matches',   require('./routes/matchRoutes'));
app.use('/api/sessions',  require('./routes/sessionRoutes'));
app.use('/api/messages',  require('./routes/messageRoutes'));
app.use('/api/credits',   require('./routes/creditRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/ratings',   require('./routes/ratingRoutes'));

// ─── Health ──────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start — connect DBs if available, then listen ───────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await Promise.allSettled([
      connectPostgres(),
      connectMongo(),
    ]);
  } catch (err) {
    console.warn('Database startup check completed with warnings.');
  }

  const listenWithFallback = async (port, attempt = 0) => {
    const canBind = await new Promise((resolve) => {
      const tester = net.createConnection({ host: '127.0.0.1', port });
      tester.on('connect', () => {
        tester.end();
        resolve(false);
      });
      tester.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    if (!canBind) {
      if (attempt < 5) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy. Trying ${nextPort} instead.`);
        return listenWithFallback(nextPort, attempt + 1);
      }

      console.error(`Unable to bind to port ${port}`);
      process.exit(1);
    }

    httpServer.listen(port, () => {
      console.log(`SkillBridge API → http://localhost:${port}`);
    });
  };

  listenWithFallback(Number(PORT));
};

start();

module.exports = app;