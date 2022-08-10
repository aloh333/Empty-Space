module.exports = (router, passport) => {
    router.route('/auth/facebook').get(passport.authenticate('facebook', {
            scope: 'email'
        })
    );

    router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        })
    );
};