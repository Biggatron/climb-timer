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

router.get('/', (req, res) => {
    getTimers(res, req);
});

router.get('/search', (req, res) => {
    searchTimers(res, req);
});

router.get('/create', (req, res) => {
    res.render('timer/new-timer', { user: req.user });
});

router.post('/create', (req, res) => {
    createTimer(req, res);
})

router.get('/:id/fullscreen', (req, res) => {
    let { id } = req.params;
    let fullscreen = true;
    getTimer(res, req, id, fullscreen);
});

router.get('/*', (req, res) => {
    let id = req.params[0];
    let fullscreen = false;
    getTimer(res, req, id, fullscreen);
});

router.delete('/*', (req, res) => {
    console.log('delete route hit')
    deleteTimer(res, req);
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
        'INSERT INTO timer (create_time, timer_code, timer_name, user_id, timer_duration, timer_buffer, is_public, rotating_background_color, single_countdown, main_color, secondary_color, buffer_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [timer.createTime, timer.code, timer.name, timer.userId, timer.timer, timer.buffer, timer.isPublic, timer.rotateBackgroundColor, timer.singleCountdown, timer.mainColor, timer.secondaryColor, timer.bufferColor]
    );
    if (result.rows[0]) {
        console.log({timerCreated: result.rows})
        //res.status(200).json(result.rows[0]);
        if (req.session.timers) {
            req.session.timers.push(timer.code);
        } else {
            req.session.timers = [timer.code];
        }
        res.redirect('/' + timer.code); // redirect virkar ekki */
    } else {
        res.sendStatus(500);
    }
}

async function getTimer(res, req, timerCode, fullscreen) {
    let user = req.user;
    console.log("Query timer: " + timerCode);
    const result = await query(
        `SELECT * FROM timer WHERE timer_code = '${timerCode}'`
    );
    let timer = result.rows[0];
    if (!timer) {
        res.sendStatus(404);
        return;
    } 
    
    console.log("Query successfull: ");
    console.log({timer: timer});
    timer.time_elapsed = parseInt(timer.time_elapsed); // Bigint returns string
    if (timer.time_elapsed) {
    }
    if (!timer.is_paused) {
        let timeElapsedFromStart = new Date() - timer.start_time;
        timer.time_elapsed += timeElapsedFromStart;
    }
    res.render('timer/timer', { timer: timer, user: user, ownedTimers: req.session.timers, fullscreen: fullscreen });
    incrementTimerCounter(timerCode);
    return;
}

function incrementTimerCounter(timerCode) {
    console.log('Incrementing counter for timer: ' + timerCode);
    const result = query(
        `UPDATE timer SET visit_count = visit_count + 1, last_visit_time = '${new Date().toISOString()}' where timer_code = '${timerCode}'`
    );
}

async function searchTimers(res, req) { 
    let searchString = req.query.filters.timerName;
    let user = req.user;
    console.log("Search query timer: " + searchString);
    const result = await query(
        `SELECT * FROM timer WHERE is_public = true AND ( LOWER(timer_code) LIKE LOWER('%${searchString}%') or LOWER(timer_name) LIKE LOWER('%${searchString}%') )`
    );
    console.log(result.rows.length + " timers queried with searchTimers()")
    let timers = prepareTimerForOutput(result.rows);
    res.send(JSON.stringify(timers));
    return;
}

async function getTimers(res, req) {
    const timerResult = await query(
        `SELECT * FROM timer WHERE is_public = true ORDER BY last_visit_time DESC LIMIT 20`
    )
    const popularTimerResult = await query(
        `SELECT * FROM timer WHERE is_public = true ORDER BY visit_count DESC LIMIT 5`
    )
    const newTimerResult = await query(
        `SELECT * FROM timer WHERE is_public = true and create_time > now() - interval '1 day' ORDER BY create_time DESC LIMIT 5`
    )
    let timers = prepareTimerForOutput(timerResult.rows);
    let popularTimers = prepareTimerForOutput(popularTimerResult.rows);
    let newTimers = prepareTimerForOutput(newTimerResult.rows);
    res.render('timer/home-timer', { timers: timers, popularTimers: popularTimers, newTimers: newTimers, user: req.user });
    return;
}

async function deleteTimer(res, req) {
    let timerCode = req.params[0];
    let user = req.user;
    
    const getTimerResult = await query(
        `SELECT * FROM timer WHERE timer_code = '${timerCode}'`
    );
    let timer = getTimerResult.rows[0];
    if (!timer) {
        res.status(404).json({error: `Timer ${timerCode} does not exist`})
        return;
    }
    if (!user) {
        res.status(404).json({error: `User has to be logged on to delete timer`})
        return;
    }
    if (timer.user_id === user.id) {
        // Delete timer
        const deleteTimerResult = await query(
            `DELETE FROM timer WHERE timer_code = '${timerCode}'`
        );
        console.log({
            deleteTimerResult: deleteTimerResult
        })
        const getDeleteTimerResult = await query(
            `SELECT * FROM timer WHERE timer_code = '${timerCode}'`
        );
        let timer = getDeleteTimerResult.rows[0];
        if (timer) {
            res.sendStatus(404).json({error: `Failed to delete timer ${timerCode}`})
            return;
        } else {
            res.sendStatus(200);
            return;
        }
    } else {
        res.status(404).json({error: 'userID does not match timer.userID'})
        console.log(`user ${user.id} tried to delete timer owned by ${timer.user_id}`)
    }
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