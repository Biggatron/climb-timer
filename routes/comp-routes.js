const router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/create', authCheck, (req, res) => {
    res.render('new-comp', { user: req.user });
});

router.get('/edit', authCheck, (req, res) => {
    console.log('req.user: ' + req.user)
    console.log('req: ' + req)
    res.send('comp/edit')
});

router.get('/*', (req, res) => {
    console.log('req:')
    console.log(req.params)
    res.send('comp/')
});


module.exports = router;