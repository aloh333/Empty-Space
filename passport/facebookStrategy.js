const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const crypto = require('crypto');

const User = require('../models/user');

module.exports = () => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'emails', 'displayName'],
        // passReqToCallback: true,
        // session: true,
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('facebook profile', profile);
        try {
            const exUser = await User.findOne({
                where: { email: profile.emails[0].value },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create({
                    email: profile.emails[0].value,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'facebook',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};


/*
new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'emails', 'displayName'],
       // passReqToCallback: true,
       session: true
    },
    function(accessToken, refreshToken, profile, done) {
        const options = {
            'facebook.id': profile.id  // facebook 에서 받아온 id 정보로 회원을 찾는다.
        };

        const database = app.get('database');
        database.UserModel.findOne(options, (err, user) => {
            if (err) return done(err);

            if(!user) {
                var user = new database.UserModel({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'facebook',
                    authToken: accessToken,
                    refreshToken: refreshToken,
                    facebook: profile._json
                });

                user.save(function (err) {
                    if (err) {console.log(err);}
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    });
    */ 