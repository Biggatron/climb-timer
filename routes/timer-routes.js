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
    res.render('timerOnly/new-timer', { user: req.user });
});

router.post('/create', (req, res) => {
    createTimer(req, res);
})

router.get('/*', (req, res) => {
    getTimer(res, req);
});

async function createTimer(req, res) {
    let timer = req.body;
    timer.createTime = new Date();
    timer.code = await getNewTimerCode();
    console.log({timerCode: timer.code})
    if (!timer.code) {
        res.sendStatus(500);
        return 0;
    }
    const result = await query(
        'INSERT INTO timer (create_time, timer_code, user_id, timer_duration, timer_buffer, rotating_background_color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [timer.createTime, timer.code, timer.userId, timer.timer, timer.buffer, timer.rotateBackgroundColor]
    );
    if (result.rows[0]) {
        console.log('result.rows')
        console.log(result.rows)
        res.status(200).json(result.rows[0]);
        /* res.redirect('/timer/' + timer.code); // redirect virkar ekki */
    } else {
        res.sendStatus(500);
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
    console.log({timer: timer});
    if ( timer ) {
        if (!timer.is_paused) {
            let timeElapsedFromStart = new Date() - timer.start_time;
            timer.time_elapsed += timeElapsedFromStart;
        }
        res.render('timerOnly/timer', { timer: timer, user: user });
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
        // Finna núverandi round
        if (!timers[i].is_paused) {
            let timeElapsedFromStart = new Date() - timers[i].start_time;
            timers[i].time_elapsed += timeElapsedFromStart;
        }
        timers[i].round = 1 + Math.floor( timers[i].time_elapsed / ( (timers[i].timer_duration + timers[i].timer_buffer) * 1000 ) ); 
        // Finna status
        if (!timers[i].time_elapsed && timers[i].is_paused) {
            timers[i].status = 'Initial';
        } else if (timers[i].is_paused) {
            timers[i].status = 'Paused';
        } else {
            timers[i].status = 'Active';            
        }
    }
    res.render('timerOnly/home-timer', { timers: result.rows, user: req.user });
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

async function getNewTimerCode() {
    let charArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    for (let i=0; i<10; i++) {
        let timerCode = '';
        for (let j=0; j<3; j++) {
            timerCode = timerCode + charArray[Math.floor(Math.random() * charArray.length)];
        }
        const result = await query(
            `SELECT * FROM timer WHERE timer_code = '${timerCode}'`
        );
        if (!result.rows[0]) {
            return timerCode;
        }
    };
    return 0;
}

module.exports = router;