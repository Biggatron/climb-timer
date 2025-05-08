const router = require('express').Router();
const { attachment } = require('express/lib/response');
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

router.delete('/*', authCheck, (req, res) => {
    console.log('Delete profile route hit')
    deleteUser(req, res);
});

async function getProfile(res, req) {
    const result = await query(
        `SELECT * FROM timer WHERE user_id = '${req.user.id}'`
    )
    let timers = prepareTimerForOutput(result.rows);
    res.render('profile', { timers: timers, user: req.user });
    return;
}

async function deleteUser(req, res) {
    let user = req.user;
    console.log(user)
    if (!user) {
        res.status(404).json({error: `User has to be logged on to delete user`})
        return;
    }

    const getUserResult = await query(
        `SELECT * FROM user_account WHERE id = '${user.id}'`
    );
    if (getUserResult.rowCount === 0) {
        res.status(404).json({error: `User ${user.id} does not exist`})
        return;
    }
    console.log('Logging out before delete')
    req.logout();
    console.log(req.user)
    const result = await query(
        `DELETE FROM user_account WHERE id = '${user.id}'`
    )
    console.log('User deleted')
    res.status(200).json({message: `User ${user.id} deleted`});
    //res.redirect('/');
    return;
}

module.exports = router;