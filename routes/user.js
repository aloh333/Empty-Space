const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator');
const { isLoggedIn, isNotLoggedIn, validator, 
    validator_resend_email, verifyToken } = require('./middlewares');
const emailmixin = require('../controllers/email');
const User = require('../models/user');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.flashError = req.flash('error');
    res.locals.flashSuccess = req.flash('success');
    next();
});

router.get('/:id/verify/:token', isNotLoggedIn, verifyToken);

router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('login', { 
        title: '로그인 - Empty Space', 
    });
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
    }, (authError, user, info) => {
        if (authError) {
            // return next(authError);
        }
        if (!user) {
            req.flash('error', `${info.message}`);
            return res.render('login', {
                title: '로그인 - Empty Space',
                flashError: req.flash('error'),
            });
        }
        if (!user.isActive) {
            req.flash('error', '이메일 인증이 필요합니다.');
            return res.render('login', {
                title: '로그인 - Empty Space',
                flashError: req.flash('error'),
            });
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                // return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/facebook', passport.authenticate('facebook', {
    scope: 'email',
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/auth/login',
}));

router.get('/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get('/kakao/callback', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('kakao', (authError, user, info) => {
        if (authError) {
            // return next(authError);
        }
        if (!user) {
            req.flash('error', `${info.message}`);
            return res.render('login', {
                title: '로그인 - Empty Space',
                flashError: req.flash('error'),
            });
        }

        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                // return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/?logout=complete');
});

router.get('/register', isNotLoggedIn, (req, res) => {
    res.render('register', {
        title: '회원가입 - Empty Space',
    });
});

router.post('/register', isNotLoggedIn, validator, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors);
            var error = errors.mapped();
            var inputData = matchedData(req);

            req.flash('error', '입력값을 다시 확인하세요.');
            return res.render('register', { 
                title: '회원가입 - Empty Space',
                error: error, 
                inputData: inputData,
                flashError: req.flash('error'),
            });
        }

        if (exUser) {
            req.flash('error', '이미 존재하는 이메일입니다.');
            return res.render('register', {
                title: '회원가입 - Empty Space',
                flashError: req.flash('error'),
            });
        }

        const hash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            nick,
            password: hash,
        });

        emailmixin(req, res, user);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/resend_verify_email', isNotLoggedIn, (req, res) => {
    res.render('resend_verify_email', {
        title: '이메일 재발송 - Empty Space',
    });
});

router.post('/resend_verify_email', isNotLoggedIn, validator_resend_email, 
async (req, res, next) => {
    const { email } = req.body;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var msg = errors.mapped();
            var inputData = matchedData(req);

            req.flash('error', '입력값을 다시 확인하세요.');

            return res.render('resend_verify_email', { 
                title: '이메일 재발송 - Empty Space',
                error: msg, 
                inputData: inputData,
                flashError: req.flash('error'),
             });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('error', '알 수 없는 사용자입니다.');

            return res.render('resend_verify_email', {
                title: '이메일 재발송 - Empty Space',
                flashError: req.flash('error'),
            });
        }

        if (user.isActive) {
            req.flash('error', '이미 인증됐습니다.');

            return res.render('login', {
                title: '로그인 - Empty Space',
                flashError: req.flash('error'),
            });
        }

        emailmixin(req, res, user);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;