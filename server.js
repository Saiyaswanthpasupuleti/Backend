const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Auth')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// User Model
const User = mongoose.model('Users', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Send response
    res.status(201).json({ message: 'User registered successfully' });
    console.log(newUser);
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
});

// Get User Route
app.get('/user', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Log the users to the console
    console.log(users);

    // Send users back to the client
    res.status(200).json({ users });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server is running on http://localhost:3000');
});
