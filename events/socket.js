const query = require('../db/db');

module.exports = {
    joinRoom: function (socket) {
        console.log('joinRoom timer code: ' + socket.handshake.query.timerCode);
        if (socket.handshake.query.timerCode) {
            socket.join(socket.handshake.query.timerCode);
        }
    },

    startTimer: function (socket, io, timer) {
        console.log('startTimer code: ' + timer.timer_code);
        socket.broadcast.to(socket.handshake.query.timerCode).emit('startTimer', timer);
        
        let startTime = new Date();
        updateTimer({
            code: timer.timer_code,
            startTime: startTime,
            isPaused: false,
            time_elapsed: timer.time_elapsed
        })
    },

    pauseTimer: function (socket, io, timer) {
        socket.broadcast.to(socket.handshake.query.timerCode).emit('pauseTimer', timer);
        updateTimer({
            code: timer.timer_code,
            startTime: null,
            isPaused: true,
            time_elapsed: timer.time_elapsed
        })
    },

    resetTimer: function (socket, io, timer) {
        socket.broadcast.to(socket.handshake.query.timerCode).emit('resetTimer', timer);
        updateTimer({
            code: timer.timer_code,
            startTime: null,
            isPaused: true,
            time_elapsed: timer.time_elapsed
        })
    }
};

async function updateTimer(timer) {
    console.log(timer);
    const result = await query(
        'UPDATE timer SET is_paused = $2, start_time = $3, time_elapsed = $4 where timer_code = $1 RETURNING *',
        [timer.code, timer.isPaused, timer.startTime, timer.time_elapsed]
    );
}