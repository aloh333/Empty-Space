const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');

let messages = {
    "type": "",
    "message": "",
};

const sendEmail = async (email, subject, url, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587, // 465
            secure: false, // true
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: `다음 주소로 이동해서 인증하세요. ${url}`,  // ${url} 이 부분 때문에 ` 로 했음.
            html: html,
            attachments: [{
                filename: 'pikapika.gif',
                path: './public/assets/gif/pikapika.gif',
                cid: 'pika@example.com'
            }]
        });

        messages.type = 'success';
        messages.message = '회원가입을 축하드립니다. 해당 이메일 주소로 인증메일을 발송했으니 확인 후 인증하세요.';
        console.log("email sent successfully");

        return messages;
    } catch (error) {
        messages.type = 'error';
        messages.message = '인증 이메일 발송에 실패했습니다.';
        console.log("email not sent");
        console.error(error);

        return messages;
    };
};

const flashMessage = (req, res, type) => {
    if (type == 'success') {
        return res.render('login_email_resend', {
            title: '로그인 - Empty Space',
            flashSuccess: req.flash(type),
        });
    }
    if (type == 'error') {
        return res.render('login_email_resend', {
            title: '로그인 - Empty Space',
            flashError: req.flash(type),
        });
    }
}

const emailmixin = async (req, res, user) => {
    const { id, email, nick } = user;
    const createdAt = user.createdAt.toString();
    const token = jwt.sign({
        nick: nick,
        createdAt: createdAt,
    }, process.env.JWT_SECRET, {
        expiresIn: '5m',
    });
    const url = `${process.env.BASE_URL}/${id}/verify/${token}`;
    const subject = "[Empty Space] 회원가입 인증 메일입니다.";
    
    let emailTemplate;
    ejs.renderFile('./public/templates/registerVerify.ejs', 
    { email: email, nick: nick, url: url }, 
    (err, data) => {
        if (err) { console.log(err); }
        emailTemplate = data;
    });

    let messages = await sendEmail(email, subject, url, emailTemplate);

    req.flash(messages.type, messages.message);

   flashMessage(req, res, messages.type);
};

module.exports = emailmixin;