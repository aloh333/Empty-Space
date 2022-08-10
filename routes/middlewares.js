const { check } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인 필요');
        res.redirect(`/?loginError=${message}`);
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};

exports.validator = [
    check('email').trim().notEmpty().withMessage('필수정보입니다. 이메일을 입력하세요.')
    .isEmail().withMessage('올바른 이메일 주소를 입력하세요.'),

    check('nick').trim().notEmpty().withMessage('필수정보입니다. 이름을 입력하세요.')
    .matches(/^[a-zA-Z ]*$/).withMessage('공백은 문자와 함께 사용할 수 있습니다.'),

    check('password').trim().notEmpty().withMessage('비밀번호를 입력하세요.')
    .isLength({ min: 8 }).withMessage('비밀번호가 너무 짧습니다. 최소 8 문자를 포함해야 합니다.')
    .matches(/(?=.*?[0-9])/).withMessage('숫자를 포함해야 합니다.')
    .not().matches(/^$|\s+/).withMessage('공백은 포함할 수 없습니다.'),

    check('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        return true;
    })
];

exports.validator_resend_email = [
    check('email').trim().notEmpty().withMessage('이메일을 입력하세요.')
    .isEmail().withMessage('올바른 이메일 주소를 입력하세요.')
];

exports.verifyToken =  async (req, res, next) => {
    try {
        const { id, token } = req.params;
        const user = await User.findOne({
            where: { id: id },
        });
        
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        const createdAt = user.createdAt.toString();

        if (decoded.nick == user.nick 
            && decoded.createdAt == createdAt) {
                user.isActive = true;
                await user.save();

                req.flash('success', '인증이 완료됐습니다.');

                return res.render('login', {
                    title: '로그인 - Empty Space',
                    flashSuccess: req.flash('success'),
                });
        }
        
        req.flash('error', '인증이 실패했습니다.');
        res.render('login_email_resend', {
            title: '로그인 - Empty Space',
            flashError: req.flash('error'),
        });
    } catch (error) {
        console.error(error);
        res.redirect('/?emailError=verify');
    }
};
