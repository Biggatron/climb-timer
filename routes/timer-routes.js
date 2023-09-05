const router = require('express').Router();
const query = require('../db/db');
const prepareTimerForOutput = require('../utilities/util');

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

router.get('/search', (req, res) => {
    searchTimers(res, req);
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
    timer.createTime = new Date();
    timer.code = await getNewTimerCode();
    console.log("Timer code for new timer: " + timer.code);
    if (!timer.code) {
        res.sendStatus(500);
        return 0;
    }
    const result = await query(
        'INSERT INTO timer (create_time, timer_code, timer_name, user_id, timer_duration, timer_buffer, is_public, rotating_background_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [timer.createTime, timer.code, timer.name, timer.userId, timer.timer, timer.buffer, timer.isPublic, timer.rotateBackgroundColor]
    );
    if (result.rows[0]) {
        console.log({timerCreated: result.rows})
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
        res.render('timer/timer', { timer: timer, user: user });
    } else {
        res.sendStatus(404);
    }
    return;
}

async function searchTimers(res, req) { 
    let searchString = req.query.filters.timerName;
    let user = req.user;
    console.log("Query timer: " + searchString);
    const result = await query(
        `SELECT * FROM timer WHERE is_public = true AND ( LOWER(timer_code) LIKE LOWER('%${searchString}%') or LOWER(timer_name) LIKE LOWER('%${searchString}%') )`
    );
    //console.log({timers: result.rows})
    console.log(result.rows.length + " timers queried with searchTimers()")
    let timers = prepareTimerForOutput(result.rows);
    res.send(JSON.stringify(timers));
    return;
}

async function getTimers(res, req) {
    const result = await query(
        `SELECT * FROM timer WHERE is_public = true`
    )
    let timers = prepareTimerForOutput(result.rows);
    res.render('timer/home-timer', { timers: timers, user: req.user });
    return;
}

async function getNewTimerCode() {
    let charArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                     'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
                     '1','2','3','4','5','6','7','8','9','0'];
// Do max 10 times. This 4 digit code has 14,776,336 possible combinations so 
// it's unlikely one is generated that already exists but it can happen up to 
// 10 times before we give up
    for (let i=0; i<10; i++) {
        let timerCode = '';
        for (let j=0; j<4; j++) {
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