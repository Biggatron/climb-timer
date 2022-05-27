const router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', (req, res) => {
    res.render('timer', { user: req.user });
});

router.get('/create', (req, res) => {
    res.render('new-timer', { user: req.user });
});

router.get('/*', (req, res) => {
    console.log('req:')
    console.log(req.params)
    res.send('comp/')
});


module.exports = router;