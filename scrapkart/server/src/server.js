const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const { getServerConfig } = require('./config/env');
const User = require('./models/User');

dotenv.config();

const app = express();
const config = getServerConfig();

const createDefaultAdmin = async () => {
  if (!config.enableDefaultAdmin) {
    return;
  }

  const adminEmail = config.adminEmail;
  const adminPassword = config.adminPassword;

  try {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await admin.save();
      console.log(`Default admin user created: ${adminEmail}`);
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (!config.isProduction || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy blocked this origin'));
  },
  credentials: true,
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/orders', require('./routes/orders'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.port;

const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message || error);
  process.exit(1);
});