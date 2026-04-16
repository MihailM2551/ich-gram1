require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.CLIENT_URLS || '').split(','),
]
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    return callback(null, allowedOrigins.includes(normalizedOrigin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads'));
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));
app.get('/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild = fs.existsSync(frontendDistPath);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api|uploads|health).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.send('ICHGRAM API is running.'));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ICHGRAM server is running on port ${PORT}`);
});

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is missing.');
} else {
  console.log('Connecting to MongoDB...');
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  })
    .then(() => {
      console.log('MongoDB connected successfully.');
    })
    .catch((err) => {
      console.error('Critical MongoDB connection error:', err);
    });
}
