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

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (_req, res) => res.send('Serverul ICHGRAM rulează...'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Serverul ICHGRAM a pornit pe portul ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Eroare critică la conectarea MongoDB:', err);
  });


