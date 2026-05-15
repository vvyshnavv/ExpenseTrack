const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);

const clientDist = path.join(__dirname, 'client', 'dist');
const reactIndex = path.join(clientDist, 'index.html');
const useReactBuild = fs.existsSync(reactIndex);

if (useReactBuild) {
  app.get(['/dashboard.html', '/dashboard'], (req, res) => res.redirect(302, '/app'));
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(reactIndex);
  });
} else {
  console.warn(
    '[ExpenseTrack] No client/dist found. Run: cd client && npm install && npm run build — then restart. Serving legacy public/ UI.'
  );
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (useReactBuild) {
        console.log('Serving React UI from client/dist (open http://localhost:' + PORT + ')');
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
