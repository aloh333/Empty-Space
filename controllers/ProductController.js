const productController = {};

// 상품 목록
productController.list = (req, res) => {
    const database = req.app.get('database');
    database.ProductModel.find({}, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        } else {
            res.render('purchase', {
                results: results,
                user: req.user
            });
        }
    })
};

// 단일 상품 보여주기
productController.show = (req, res) => {
    const paramProductId = req.params.productId;

    const database = req.app.get('database');
    database.ProductModel.findOne({ 'productId': paramProductId }, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        } else {
            console.log(result);
            res.render('product', {
                result: result,
                user: req.user
            });
        }
    });
};

// 상품 업로드하기
productController.create = (req, res) => {
    res.render('create.ejs');
};

// 상품 저장하기
productController.save = (req, res) => {
    const database = req.app.get('database');
    const product = new database.ProductModel({
        "owner.ownerId" : req.user.userId,
        "owner.ownerEmail" : req.user.email,
        "name" : req.body.name || req.query.name,
        "image" : req.file.originalname,
        "price" : req.body.price || req.query.price,
        "discountPrice" : req.body.discountPrice || req.body.discountPrice,
        "description" : req.body.description || req.query.description
    });

    product.save((err) => {
        if (err) {
            console.log(err);
        }
        console.log('사용자 데이터 추가함.');
    });

    res.redirect('/purchase');
}

// 로그인한 사용자가 업로드한 상품목록
productController.mylist = (req, res) => {
    const paramOwnerId = req.params.userId;

    const database = req.app.get('database');
    database.ProductModel.find({ 'owner.ownerId': paramOwnerId }, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        } else {
            console.log(results);
            res.render('purchase', { results: results });
        }
    });
};

// 내 상품 정보 편집하기
productController.edit = (req, res) => {
    const paramUpdateId = req.params.productId;

    const database = req.app.get('database');
    database.ProductModel.findOne({ 'productId': paramUpdateId }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render('update', { result: result });
        }
    });
};

// 내 상품 정보 업데이트
productController.update = (req, res) => {
    const paramUpdateId = req.params.name;
    const paramDiscountPrice = req.body.discountPrice || req.query.discountPrice;

    const database = req.app.get('database');

    if (paramDiscountPrice == null) {
        paramDiscountPrice = ' ';
    }

    database.collection('products').updateMany({ 'name': paramUpdateId }, 
    {$set: {
        'name': req.body.name || req.query.name, 
        'image': paramImage, 
        'price': req.body.price || req.query.price, 
        'discountPrice': req.body.discountPrice || req.query.discountPrice, 
        'description': req.body.description || req.query.description, 
        'updatedAt': Date(Date.now)
    }});
    console.log('상품 상세 정보 업데이트 됨.');

    res.redirect('/purchase');
};

// 내 상품 정보 삭제하기
productController.delete = (req, res) => {
    const paramDeleteId = req.params.productId;

    const database = req.app.get('database');

    database.ProductModel.deleteOne({ 'productId': paramDeleteId }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('상품 정보 삭제됨.');
            res.redirect('/purchase');
        }
    });
};

// 체크아웃 하기
productController.checkout = (req, res) => {
    res.render('cart.ejs');
};

// 체크아웃 정보 저장하기
productController.checkoutSave = (req, res) => {
    const database = req.app.get('database');
    if (database) {
        database.collection('users').updateMany({ 'email': req.user.email }, 
        {$set: {
            'address': req.body.address || req.query.address, 
            'address2': req.body.address2 || req.query.address2, 
            'paymentMethod': req.body.paymentMethod || req.query.paymentMethod,
            'nameOnCard': req.body.nameOnCard || req.query.nameOnCard,
            'creditCardNumber': req.body.creditCardNumber || req.query.creditCardNumber,
            'validThru': req.body.validThru || req.query.validThru,
            'cvc': req.body.cvc || req.query.cvc
        }});
    }

    res.redirect('/');
};

module.exports = productController;