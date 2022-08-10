const request = require('supertest');
const { sequelize } = require('../models');
const app = require('../app');

beforeAll(async () => {
    await sequelize.sync({
        force: false,
        alter: true,
    });
});

describe('POST /join', () => {
    test('로그인 안했을때 회원가입 정보 잘못입력함.', (done) => {
        request(app)
        .post('/auth/join')
        .send({
            email: 'aloha@naver.com',
            nick: 'aloha',
            password: 'password',
        })
        .expect(200, done);
        // '입력값을 다시 확인하세요.' 
        // res.render('join')
    });

    test('로그인 안했으면 가입하고 인증 이메일 전송', (done) => {
        request(app)
        .post('/auth/join')
        .send({
            email: 'aloha@naver.com',
            nick: 'aloha',
            password: 'password1234',
            passwordConfirmation: 'password1234',
        })
        .expect(200, done);
        // '회원가입을 축하드립니다. 해당 이메일 주소로 인증메일을 발송했으니 확인 후 인증하세요.'
        // res.render('login_email_resend')
    });

    test('로그인 안했을때 이미 가입된 이메일 입력함.', (done) => {
        request(app)
        .post('/auth/join')
        .send({
            email: 'aloha@naver.com',
            nick: 'aloha',
            password: 'password1234',
            passwordConfirmation: 'password1234',
        })
        .expect(200, done);
        // '이미 존재하는 이메일입니다.'
        // res.render('join')
    });
});

describe('POST /join', () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'password1234',
        })
        .end(done); // db ebook_test에서 is_active=true로 바꿔줌.
    });

    test('이미 로그인했으면 redirect /', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent
        .post('/auth/join')
        .expect('Location', `/?error=${message}`)
        .expect(302, done);
    });
});

describe('POST /resend_verify_email', () => {
    test('로그인 안했을때 이메일 정보 잘못입력함.', (done) => {
        request(app)
        .post('/auth/resend_verify_email')
        .send('aloha')
        .expect(200, done);
        // '입력값을 다시 확인하세요.'
        // res.render('resend_verify_email')
    });

    test('로그인 안했을때 가입되지 않은 이메일 입력함.', (done) => {
        request(app)
        .post('/auth/resend_verify_email')
        .send('aloha@gmail.com')
        .expect(200, done);
        // '알 수 없는 사용자입니다.'
        // res.render('resend_verify_email')
    });

    test('로그인 안했을때 이메일 인증이 완료된 이메일 입력함.', (done) => {
        request(app)
        .post('/auth/resend_verify_email')
        .send('aloha@naver.com')
        .expect(200, done);
        // '이미 인증됐습니다.'
        // res.render('login')
    });

    test('로그인 안했을때 가입됐지만 인증은 안된 이메일 입력함.', (done) => {
        request(app)
        .post('/auth/resend_verify_email')
        .send('aloha333@naver.com')
        .expect(200, done);
        // '회원가입을 축하드립니다. 해당 이메일 주소로 인증메일을 발송했으니 확인 후 인증하세요.'
        // res.render('login_email_resend')
    });
});

describe('POST /resend_verify_email', () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'password1234',
        })
        .end(done);
    });

    test('이미 로그인했으면 redirect /', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent
        .post('/auth/join')
        .expect('Location', `/?error=${message}`)
        .expect(302, done);
    });
});

describe('GET /:id/verify/:token', () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'password1234',
        })
        .end(done);
    });

    test('로그인되어 있으면 redirect /', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent
        .get('/auth/:id/verify/:token')
        .expect('Location', `/?error=${message}`)
        .expect(302, done);
    });
});

describe('POST /login', () => {
    test('가입되지 않은 회원', (done) => {
        request(app)
        .post('/auth/login')
        .send({
            email: 'aloha@gmail.com',
            password: 'password',
        })
        .expect(200, done);
        // '가입되지 않은 회원입니다.'
        // res.render('login')
    });

    test('이메일 인증이 필요한 회원', (done) => {
        request(app)
        .post('/auth/login')
        .send({
            email: 'aloha333@naver.com',
            password: 'password1234',
        })
        .expect(200, done);
        // '이메일 인증이 필요합니다.'
        // res.render('login')
    });

    test('비밀번호 틀림', (done) => {
        request(app)
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'wrong',
        })
        .expect(200, done);
        // '비밀번호가 일치하지 않습니다.'
        // res.render('login')
    });

    test('로그인 수행', (done) => {
        request(app)
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'password1234',
        })
        .expect('Location', '/')
        .expect(302, done);
    });
});

describe('GET /logout', () => {
    test('로그인 되어있지 않으면 redirect /', (done) => {
        const message = encodeURIComponent('로그인 필요');
        request(app)
        .get('/auth/logout')
        .expect('Location', `/?loginError=${message}`)
        .expect(302, done);
    });

    const agent = request.agent(app);
    beforeEach((done) => {
        agent
        .post('/auth/login')
        .send({
            email: 'aloha@naver.com',
            password: 'password1234',
        })
        .end(done);
    });

    test('로그아웃 수행', (done) => {
        agent
        .get('/auth/logout')
        .expect('Location', '/?logout=complete')
        .expect(302, done);
    });
});