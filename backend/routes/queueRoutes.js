const express = require('express');
const jwt = require('jsonwebtoken');
const { enqueueRequest } = require('../controllers/queueController');

const router = express.Router();

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Unauthorized" });
    }
};

router.post('/enqueue', authenticate, enqueueRequest);

module.exports = router;
