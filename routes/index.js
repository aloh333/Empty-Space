const express = require('express');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

router.get('/', (req, res) => {
    res.render('index', { title: 'Empty Space' });
});

module.exports = router;