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