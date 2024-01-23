const router = require('express').Router();
const query = require('../db/db');
const {prepareTimerForOutput} = require('../utilities/util');


const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    getProfile(res, req);
});

async function getProfile(res, req) {
    const result = await query(
        `SELECT * FROM timer WHERE user_id = '${req.user.id}'`
    )
    let timers = prepareTimerForOutput(result.rows);
    res.render('profile', { timers: timers, user: req.user });
    return;
}

module.exports = router;