const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const PORT = process.env.PORT || 3000;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'usersdb',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 150 },
    },
  },
  {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

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
    const users = await User.findAll({ order: [['id', 'ASC']] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { first_name, last_name, age } = req.body;
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (age !== undefined) user.age = age;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
