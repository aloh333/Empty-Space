jest.mock('../models/user');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn, verifyToken } = require('./middlewares');

describe('isLoggedIn', () => {
    const res = {
        redirect: jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isLoggedIn이 next를 호출해야함.', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isLoggedIn(req, res, next);
        expect(next)
        .toBeCalledTimes(1);
    });

    test('로그인되어 있지 않으면 isLoggedIn이 에러를 응답해야함.', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        isLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인 필요');
        expect(res.redirect)
        .toBeCalledWith(`/?loginError=${message}`);
    });
});

describe('isNotLoggedIn', () => {
    const res = {
        redirect: jest.fn(),
    };
    const next = jest.fn();

    test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야함.', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isNotLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인한 상태입니다.');
        expect(res.redirect)
        .toBeCalledWith(`/?error=${message}`);
    });

    test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야함.', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        isNotLoggedIn(req, res, next);
        expect(next)
        .toBeCalledTimes(1);
    });
});

describe('verifyToken', () => {
    const req = {
        params: {
            id: 1,
            token: 'token',
        },
        flash: jest.fn(),
    };
    const res = {
        render: jest.fn(),
        redirect: jest.fn(),
    };
    const next = jest.fn();

    test('jwt에 들어있는 nick과 createdAt이 user와 일치하면' 
    + 'success flash와 함께 login페이지로 이동해야함.', 
    async () => {
        const nick = 'nick';
        const createdAt = 'createdAt';
        User.findOne.mockResolvedValue({
            nick: nick,
            createdAt: createdAt,
            save: jest.fn(),
        });
        jwt.verify = jest.fn().mockReturnValue({
            nick: nick,
            createdAt: createdAt,
        });
        await verifyToken(req, res, next);
        expect(req.flash)
        .toBeCalledWith('success', '인증이 완료됐습니다.');
        expect(res.render)
        .toBeCalledWith('login', {
            title: '로그인 - Empty Space',
            flashSuccess: req.flash('success'),
        });
    });

    test('jwt에 들어있는 nick과 createdAt이 user와 일치하는 경우가 아니면' 
    + 'error flash와 함께 login_email_resend 페이지로 이동해야함.', 
    async () => { // user는 잘 찾았지만 jwt는 잘못된 값일때.
        const nick = 'nick';
        const createdAt = 'createdAt';
        User.findOne.mockResolvedValue({
            nick: nick,
            createdAt: createdAt,
        });
        jwt.verify = jest.fn().mockReturnValue({
            nick: null,
            createdAt: null,
        });
        await verifyToken(req, res, next);
        expect(req.flash)
        .toBeCalledWith('error', '인증이 실패했습니다.');
        expect(res.render)
        .toBeCalledWith('login_email_resend', {
            title: '로그인 - Empty Space',
            flashError: req.flash('error'),
        });
    }, async () => { // jwt는 잘 찾았지만 user는 잘못된 값일때.
        const nick = 'nick';
        const createdAt = 'createdAt';
        User.findOne.mockResolvedValue({
            nick: null,
            createdAt: null,
        });
        jwt.verify = jest.fn().mockReturnValue({
            nick: nick,
            createdAt: createdAt,
        });
        await verifyToken(req, res, next);
        expect(req.flash)
        .toBeCalledWith('error', '인증이 실패했습니다.');
        expect(res.render)
        .toBeCalledWith('login_email_resend', {
            title: '로그인 - Empty Space',
            flashError: req.flash('error'),
        });
    });

    test('어떤 경우든 에러가 호출되면 /?emailError=verify로 redirect함.', 
    async () => { // user를 못찾았을때.
        const error = '테스트용 에러';
        User.findOne.mockReturnValue(Promise.reject(error));
        await verifyToken(req, res, next);
        expect(res.redirect)
        .toBeCalledWith('/?emailError=verify');
    }, async () => { // token이 이상할때.
        const nick = 'nick';
        const createdAt = 'createdAt';
        const error = '테스트용 에러';
        User.findOne.mockResolvedValue({
            nick: nick,
            createdAt: createdAt,
        });
        jwt.verify = jest.fn().mockReturnValue(Promise.reject(error));
        await verifyToken(req, res, next);
        expect(res.redirect)
        .toBeCalledWith('/?emailError=verify');
    });
});