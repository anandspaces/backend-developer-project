require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connectQueue } = require('./config/queue');
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/queue', queueRoutes);

const startApp = async () => {
    await connectQueue();
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
};

startApp();
