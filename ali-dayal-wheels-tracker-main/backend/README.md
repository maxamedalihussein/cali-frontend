# ALI DAYAX Backend

This is the backend for the ALI DAYAX car tracking app (MERN stack).

## Features
- Car and Buyer models (MongoDB/Mongoose)
- REST API for cars and buyers
- Express, CORS, dotenv

## Setup
1. Copy `.env.example` to `.env` and fill in your MongoDB URI.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server in dev mode:
   ```
   npm run dev
   ```
   Or in production:
   ```
   npm start
   ```

## API Endpoints
- `/api/cars` (GET, POST, PUT, DELETE)
- `/api/buyers` (GET, POST, DELETE)

## Example .env
```
MONGO_URI=mongodb+srv://your-user:your-pass@your-cluster.mongodb.net/ali-dayax-tracker
PORT=5050
``` 