// 회원 구매 & 상품 업로드
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

/*
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/);
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const fs = require('fs');

try {
    fs.readdirSync('uploads');
} catch(error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

app.post('/upload', upload.array('many'), (req, res) => {
    console.log(req.files, req.body);
    res.send('ok');
});
*/

const product = require('../controllers/ProductController');

module.exports = (router) => {
    router.route('/purchase').get(product.list);

    router.route('/checkout').post(product.checkout_save);

    router.route('/create').get(product.create);

    router.route('/save').post(upload.single('image'), product.save);

    router.route('/myproduct/:userId').get(product.mylist);

    router.route('/update/:productId').get(product.edit);

    router.route('/update/:name').post(upload.single('image'), product.update);

    router.route('/product/:productId')
    .get(product.show)
    .post(product.checkout);

    router.route('/delete/:productId').post(product.delete);
};