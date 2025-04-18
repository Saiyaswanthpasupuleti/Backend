const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://saiyaswanths959:97AbVe8PipC5EHWu@cluster0.qns3r.mongodb.net/Auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Model
const User = mongoose.model('Users', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    console.log('🆕 New User:', newUser);
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get All Users (optional, for debugging)
app.get('/user', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Server Start
app.listen(3001, () => {
  console.log('🚀 Server is runningss s on http://localhost:3001');
});
