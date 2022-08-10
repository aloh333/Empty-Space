const passport = require('passport');
const local = require('./localStrategy');
const facebook = require('./facebookStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {    
        done(null, user.id);
    });
    
    passport.deserializeUser((id, done) => {    
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'], // 실수로 비밀번호를 조회하는 것을 방지하기 위해
                as: 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'], // 이하 동문
                as: 'Followings',
            }],
        }).then(user => done(null, user)).catch(err => done(err));
    });

    local();
    facebook();
    kakao();
};