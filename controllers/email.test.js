jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const emailmixin = require('./email');

describe('emailmixin', () => {
    const user = { 
        id: 1,
        email: 'aloha@naver.com',
        nick: 'aloha',
        createdAt: { 
            toString: jest.fn().mockReturnValue('createdAt'), 
        },
    };
    const req = { flash: jest.fn(), };
    const res = { render: jest.fn(), };

    jwt.sign = jest.fn().mockReturnValue('token');

    test('user email로 template를 보내고 success message를 응답함.', 
    async () => {
        nodemailer.createTransport.mockReturnValue({
            sendMail: jest.fn(),
        });
        await emailmixin(req, res, user);
        expect(req.flash).toBeCalledWith('success', 
        '회원가입을 축하드립니다. 해당 이메일 주소로 인증메일을 발송했으니 확인 후 인증하세요.');
        expect(res.render).toBeCalledWith('login_email_resend', {
            title: '로그인 - Empty Space',
            flashSuccess: req.flash('success'),
        });
    });

    test('email 발송 실패 후 error message를 응답함.', 
    async () => {
        nodemailer.createTransport = jest.fn();
        await emailmixin(req, res, user);
        expect(req.flash).toBeCalledWith('error', 
        '인증 이메일 발송에 실패했습니다.');
        expect(res.render).toBeCalledWith('login_email_resend', {
            title: '로그인 - Empty Space',
            flashError: req.flash('error'),
        });
    });
});