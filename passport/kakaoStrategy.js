const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const crypto = require('crypto');

const User = require('../models/user');

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        clientSecret: process.env.KAKAO_SECRET,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
            if (!profile._json.kakao_account.has_email) {
                done(null, false, { 
                    message: '해당 계정에 이메일정보가 없습니다. 이메일 정보를 추가하고 로그인해주세요.' 
                });
            }
            if (profile._json.kakao_account.email_needs_agreement) {
                done(null, false, { 
                    message: '회원가입을 위해 이메일은 필수정보입니다. 정보 제공에 동의해주세요.' 
                });
            }
            const exUser = await User.findOne({
                where: { 
                    email: profile._json && profile._json.kakao_account.email
                 },
            });
            if (exUser) {
                if (exUser.provider == 'local') {
                    exUser.provider = 'kakao';
                    exUser.snsId = profile.id;
                    await exUser.save();
                }

                if (exUser.isActive == false) {
                    exUser.isActive = true;
                    await exUser.save();
                }

                done(null, exUser);
            } else {
                const password = crypto.randomBytes(32).toString('hex');
                const newUser = await User.create({
                    email: profile._json && profile._json.kakao_account.email,
                    nick: profile.displayName,
                    password: password,
                    snsId: profile.id,
                    provider: 'kakao',
                    isActive: true,
                });
                
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
        }
    }));
};