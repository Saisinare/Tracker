# Tracker.io

A web application for tracking progress through YouTube playlists. Users can add playlists, mark videos as completed, and track their learning journey.

## Features

- User authentication and authorization
- Add YouTube playlists to your personal collection
- Track video completion status
- Add notes for each video
- View playlist progress
- Real-time synchronization with YouTube data
- Responsive modern UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- YouTube Data API v3

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router

## API Routes

### Authentication Routes

#### POST /api/auth/signup
Create a new user account.
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "message": "User created successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/login
Login to existing account.
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### GET /api/auth/profile
Get user profile (requires authentication).

Headers:
```
Authorization: Bearer jwt-token
```

#### PUT /api/auth/profile
Update user profile (requires authentication).
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

### Playlist Routes (All require authentication)

#### GET /api/playlists
Get all playlists for the authenticated user.

#### POST /api/playlists
Add a new playlist.
```json
{
  "youtubeUrl": "https://www.youtube.com/playlist?list=playlist-id"
}
```

#### GET /api/playlists/:id
Get a specific playlist by ID.

#### PUT /api/playlists/:id
Update playlist details.
```json
{
  "title": "New Title"
}
```

#### DELETE /api/playlists/:id
Delete a playlist.

#### GET /api/playlists/:id/progress
Get playlist completion progress.

### Video Routes (All require authentication)

#### PUT /api/videos/status
Update video completion status.
```json
{
  "playlistId": "playlist-id",
  "videoId": "video-id",
  "isCompleted": true,
  "notes": "Optional notes about the video"
}
```

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/tracker.io.git
cd tracker.io
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/TrackerDB
NODE_ENV=development
YOUTUBE_API_KEY=your-youtube-api-key
JWT_SECRET=your-jwt-secret-key
```

4. Start the application
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start
```

## Authentication

The application uses JWT (JSON Web Token) for authentication. To make authenticated requests:

1. First, signup or login to get a JWT token
2. Include the token in the Authorization header for all protected routes:
```
Authorization: Bearer your-jwt-token
```

The token expires after 7 days, after which you'll need to login again.

## Security Notes

- Never commit your `.env` file
- Change the JWT secret in production
- Use strong passwords
- The application uses bcrypt for password hashing
- All playlist operations are protected and user-specific

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

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