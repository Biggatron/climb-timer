const router = require('express').Router();
const query = require('../db/db');

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    getMyComps(req, res);
});

router.get('/create', authCheck, (req, res) => {
    res.render('comp/new-comp', { user: req.user });
});

router.get('/create', authCheck, (req, res) => {
    res.render('comp/new-comp', { user: req.user }); // Útfæra create comp bakenda og klára framenda
});

router.get('/edit', authCheck, (req, res) => {
    console.log('req.user: ' + req.user)
    console.log('req: ' + req)
    res.send('comp/edit')
});

router.get('/*', (req, res) => {
    getComp(req, res);
});

async function getMyComps(req, res) {
    console.log('userID = ' + req.user.id)
    const result = await query(
        `SELECT * FROM competition WHERE owner_id = '${req.user.id}'`
    );
    let comps = result.rows;
    
    res.render('comp/my-comps', { user: req.user, comps: comps });
}

async function getComp(req, res) {
    let compID = req.params[0];
    console.log('compID = ' + compID)
    const result = await query(
        `SELECT * FROM competition WHERE id = '${compID}'`
    );
    let comp = result.rows[0];
    if ( comp ) {
        res.render('comp/comp', { user: req.user, comp: comp });
    } else {
        res.sendStatus(404);
    }
    return;
}

module.exports = router;