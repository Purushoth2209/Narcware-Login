import express from 'express';
import cors from 'cors';
import fs from 'fs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';


// Use fs to read the service account file (directly if it's in the same directory)
const serviceAccount = fs.readFileSync('login-page-24-firebase-adminsdk-wv3mn-8b5fbcb8ba.json');

// Initialize Firebase Admin with the service account
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccount)),
});

const app = express();

// Enable CORS for all domains (for development, you may want to restrict it later)
app.use(cors());

// Set up CSP headers to allow resources and inline scripts
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:5000; img-src 'self' http://localhost:5000; style-src 'self' 'unsafe-inline';");
  next();
});

// Middleware to parse JSON body
app.use(express.json());

// API endpoint to delete user from Firebase Authentication
app.post('/delete-user', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ success: false, message: 'User ID is required.' });
  }

  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Respond back to frontend
    res.send({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ success: false, message: 'Error deleting user from authentication.' });
  }
});

// Start your server on a dynamic port or 5000
dotenv.config(); // This will load variables from .env file

const port = process.env.PORT || 5000; // Use the environment variable for port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
