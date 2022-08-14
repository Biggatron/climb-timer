const router = require('express').Router();
const query = require('../db/db');

const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', (req, res) => {
    getTimers(res, req);
});

router.get('/create', authCheck, (req, res) => {
    res.render('timer/new-timer', { user: req.user });
});

router.post('/create', (req, res) => {
    createTimer(req, res);
})

router.get('/*', (req, res) => {
    getTimer(res, req);
});

async function createTimer(req, res) {
    let timer = req.body;
    const result = await query(
        'INSERT INTO timer (timer_code, user_id, timer_duration, timer_buffer) VALUES ($1, $2, $3, $4) RETURNING *',
        [timer.code, timer.userId, timer.timer, timer.buffer]
    );
    if (result.rows[0]) {
        console.log('result.rows')
        console.log(result.rows)
        res.status(200).json(result.rows[0]);
        /* res.redirect('/timer/' + timer.code); // redirect virkar ekki */
    } else {
        sendStatus(500);
    }
}

async function getTimer(res, req) {
    let timerCode = req.params[0];
    let user = req.user;
    console.log("Query timer: " + timerCode);
    const result = await query(
        `SELECT * FROM timer WHERE timer_code = '${timerCode}'`
    );
    let timer = result.rows[0];
    
    
    
    console.log("Query successfull: ");
    console.log('timer' + timer);
    if ( timer ) {
        console.log('timer before render')
        console.log(timer);
        res.render('timer/timer', { timer: timer, user: user });
    } else {
        res.sendStatus(404);
    }
    return;
}

async function getTimers(res, req) {
    const result = await query(
        `SELECT * FROM timer`
    )
    let timers = result.rows;
    for (var i=0; i<timers.length; i++) {
        timers[i].timerDurationText = convertSecToText(timers[i].timer_duration);
        timers[i].bufferDurationText = convertSecToText(timers[i].timer_buffer);
    }
    res.render('timer/home-timer', { timers: result.rows, user: req.user });
    return;
}

// Formats seconds to text. 240 --> 04:00
function convertSecToText(totalSec) {
    let min = Math.floor(totalSec / 60);
    min < 10 ? min = '0' + min : '' + min;
    let sec = totalSec % 60;
    sec < 10 ? sec = '0' + sec : '' + sec;
    return min + ':' + sec;
  }

module.exports = router;