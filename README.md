# YouTube Playlist Tracker

A full-stack web application for tracking YouTube playlists, managing video progress, and taking notes.

## Features

- Add YouTube playlists using playlist links
- View all videos in a playlist
- Mark videos as completed/not completed
- Add and edit notes for each video
- Track progress with completion percentage
- Sort and organize playlists
- Clean and modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API architecture

## Project Structure

```
.
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main application component
│   │   └── index.tsx     # Entry point
│   └── package.json      # Frontend dependencies
│
└── backend/              # Node.js backend
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   └── server.js     # Server entry point
    └── package.json      # Backend dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/playlist-tracker
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## API Endpoints

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists/:id` - Get a specific playlist
- `PUT /api/playlists/:id` - Update a playlist
- `DELETE /api/playlists/:id` - Delete a playlist
- `GET /api/playlists/:id/progress` - Get playlist progress

### Videos
- `GET /api/videos/playlist/:playlistId` - Get all videos in a playlist
- `POST /api/videos` - Create a new video
- `PUT /api/videos/:id` - Update a video
- `DELETE /api/videos/:id` - Delete a video
- `PUT /api/videos/order/update` - Update video order

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 