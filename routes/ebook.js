const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Ebook, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.flashError = req.flash('error');
    res.locals.flashSuccess = req.flash('success');
    next();
});

router.get('/', async (req, res, next) => {
    try {
        const ebooks = await Ebook.findAll({});
        res.render('list', {
            title: '상품 목록 - Empty Space',
            ebooks,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/create', isLoggedIn, (req, res) => {
    res.render('create', { 
        title: '상품 등록 - Empty Space', 
    });
});

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) 
            + new Date().valueOf() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/create', isLoggedIn, upload.single('img'), 
async (req, res, next) => {
    try {
        const { title, writer, publisher, field, price } = req.body;
        const ebook = await Ebook.create({
            OwnerId: req.user.id,
            title,
            writer,
            publisher,
            field,
            img: req.file.filename,
            price,
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const ebook = await Ebook.findOne({
            where: { id: req.params.id },
            include: {
                model: User,
                as: 'Owner',
            }
        });
        res.render('product', {
            title: `${ebook.title} - Empty Space`,
            ebook,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id/cart', isLoggedIn, (req, res) => {
    res.render('cart', {
        title: '장바구니 - Empty Space',
        ebook: req.ebook,
    });
});

module.exports = router;