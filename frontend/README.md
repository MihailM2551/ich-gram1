# ICHgram Frontend

Frontend for the Instagram-like app, built with React, TypeScript, Tailwind CSS, and Vite.

This folder contains only the client application.
The real backend used by the project is located in:

- [C:\Users\kkuxi\Desktop\project\backend](C:/Users/kkuxi/Desktop/project/backend)

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Vite

## Project Structure

```text
frontend/
|- public/
|- src/
|  |- api/
|  |- assets/
|  |- components/
|  |- context/
|  |- lib/
|  |- pages/
|  `- types/
|- .env.example
|- package.json
`- README.md
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

1. Start the backend from [C:\Users\kkuxi\Desktop\project\backend](C:/Users/kkuxi/Desktop/project/backend).
2. In this folder, install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

4. Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## Notes

- Posts, likes, comments, profiles, notifications, and messages come from the backend API.
- Image uploads are handled by the backend.
- The frontend is now documented against the real backend in `../backend`.
