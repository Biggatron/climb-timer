const router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    console.log('req.user: ' + req.user)
    console.log('stoppar hér')
    res.render('timerProfile', { user: req.user });
});

module.exports = router;