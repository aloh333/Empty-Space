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