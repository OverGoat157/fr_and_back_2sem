const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/usersdb';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

const User = mongoose.model('User', userSchema);

const app = express();
app.use(express.json());

app.post('/api/users', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    if (!first_name || !last_name || age === undefined) {
      return res
        .status(400)
        .json({ error: 'first_name, last_name and age are required' });
    }
    const user = await User.create({ first_name, last_name, age });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    const { first_name, last_name, age } = req.body;
    const update = {};
    if (first_name !== undefined) update.first_name = first_name;
    if (last_name !== undefined) update.last_name = last_name;
    if (age !== undefined) update.age = age;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

(async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
