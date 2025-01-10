require('dotenv').config();
const express = require('express');
const { connectQueue } = require('./config/queue');
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const pool = require('./config/db');
const prometheus = require('prom-client'); // For Prometheus monitoring

const app = express();

// Create a Prometheus histogram for request duration tracking
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Histogram of HTTP request duration in seconds',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10], // Customize buckets based on expected request duration
});

app.use(express.json());  // Use the built-in express.json() middleware

// Middleware to measure the request duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.originalUrl, status_code: res.statusCode });
  });
  next();
});

app.use('/auth', authRoutes);
app.use('/queue', queueRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('Backend is healthy');
});

// Start the app after ensuring dependencies are ready
const startApp = async () => {
  try {
    // Ensure RabbitMQ connection
    await connectQueue();
    // Ensure PostgreSQL connection
    await pool.connect();

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start app:", error);
    process.exit(1);  // Exit the process if connection fails
  }
};

// Start the app
startApp();
