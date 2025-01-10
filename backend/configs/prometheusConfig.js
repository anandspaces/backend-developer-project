const promClient = require('prom-client');
const express = require('express');

// Initialize Prometheus registry and collect default metrics
const register = new promClient.Registry();

// Default metrics (e.g., process CPU, memory usage, and event loop lag)
promClient.collectDefaultMetrics({ register });

// Create custom metrics (e.g., request count, response duration)
const requestCounter = new promClient.Counter({
  name: 'app_request_count',
  help: 'Total number of requests received',
  labelNames: ['method', 'status'],
});

const responseDurationHistogram = new promClient.Histogram({
  name: 'app_response_duration_seconds',
  help: 'Histogram of response durations',
  labelNames: ['method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // Adjust buckets as needed
});

// Function to track requests
const trackRequest = (method, statusCode) => {
  requestCounter.inc({ method, status: statusCode });
};

// Function to measure response duration
const measureResponseDuration = (method, statusCode, duration) => {
  responseDurationHistogram.observe({ method, status: statusCode }, duration);
};

// Set up an Express server to expose metrics at /metrics endpoint
const app = express();

// Middleware to track request count and response duration
app.use((req, res, next) => {
  const start = Date.now(); // Start time for duration calculation

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    trackRequest(req.method, res.statusCode);
    measureResponseDuration(req.method, res.statusCode, duration);
  });

  next();
});

// Route to expose metrics for Prometheus scraping
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send('Error collecting metrics');
  }
});

// Start the server on a port (default to 3000)
const port = process.env.PROMETHEUS_PORT || 3000;
app.listen(port, () => {
  console.log(`Prometheus metrics available at http://localhost:${port}/metrics`);
});

module.exports = { trackRequest, measureResponseDuration };
