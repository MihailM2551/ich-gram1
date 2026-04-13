# ICHgram

A small Instagram-like web app made with React, Node.js, Express, and MongoDB.

It has:
- login and register
- home feed
- likes and comments
- follow / unfollow
- notifications
- search
- explore page
- profile pages
- messenger

## Project structure

```text
project/
|- frontend/
`- backend/
```

## Frontend

Inside `frontend` I used:
- React
- TypeScript
- Tailwind CSS
- Vite

## Backend

Inside `backend` I used:
- Node.js
- Express
- MongoDB + Mongoose
- JWT auth
- Multer for image upload

## How to run

### 1. Backend

Go to the backend folder:

```bash
cd backend
npm install
npm run dev
```

You need a `.env` file in `backend`.
Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ichgram
JWT_SECRET=your_secret_key
```

### 2. Frontend

Go to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

You can use a `.env` file in `frontend` like this:

```env
VITE_API_URL=http://localhost:5000/api
```

Then open:

```text
http://localhost:5173
```

## Main things that work

- auth with JWT
- create post
- feed with your posts and followed users posts
- like and comment system
- follow and unfollow
- notifications for follow / like / comment
- search users
- explore posts
- user profiles
- private conversations and messages

## Notes

- uploaded images are stored in `backend/uploads`
- this is still a work in progress and can be improved more
- the UI is inspired by Instagram, but adapted for this project

## Repo

GitHub repo:
[https://github.com/MihailM2551/ich-gram1](https://github.com/MihailM2551/ich-gram1)
