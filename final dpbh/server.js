const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/integrityweb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a user schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Serve static files (like index.html)
app.use(express.static('public'));

// Redirect root URL to the signup page
app.get('/', (req, res) => {
  res.redirect('/signup.html'); // Adjust the path based on your project structure
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { logname, logemail, logpass } = req.body;

  try {
    // Add your validation logic here if needed

    const hashedPassword = await bcrypt.hash(logpass, 10);
    const newUser = new User({ fullName: logname, email: logemail, password: hashedPassword });
    await newUser.save();
    res.redirect('/index.html'); // Redirect on successful signup
  } catch (error) {
    console.error(error);
    res.send('Signup failed. Please try again.');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { logemail, logpass } = req.body;

  try {
    const user = await User.findOne({ email: logemail });

    if (user && (await bcrypt.compare(logpass, user.password))) {
      req.session.user = user; // Store user in session
      res.redirect('/index.html'); // Redirect on successful login
    } else {
      res.send('Login failed. Please try again.');
    }
  } catch (error) {
    console.error(error);
    res.send('Login failed. Please try again.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
