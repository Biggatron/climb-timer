const query = require('../db/db');
var timerOwners = [];

module.exports = {
    

    joinRoom: function (socket) {
        console.log({timerOwners: timerOwners})
        let query = socket.handshake.query;
        console.log('user ' + query.userId + ' joinRoom timer code: ' + query.timerCode);
        if (query.timerCode) {
            socket.join(query.timerCode);
        };
        if (query.userId === query.timerUserId) {
            timerOwners.push({timerCode: query.timerCode, 
                              socketId: socket.id});
        } else {
            this.requestSync(socket);
        }
    },

    disconnectUser: function (socket) {
        timerOwners = timerOwners.filter(function( obj ) {
            return obj.socketId !== socket.id;
            });
    },

    startTimer: function (socket, io, timer) {
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

    syncTimer: function (socket, io, timer) {
        console.log('Sync event sent to clients')
        console.log(timer);
        socket.broadcast.to(socket.handshake.query.timerCode).emit('syncTimer', timer);
        updateTimer({
            code: timer.timer_code,
            startTime: timer.start_time,
            isPaused: timer.is_paused,
            time_elapsed: timer.time_elapsed
        })
    },

    // Emits a sync event to all listners of the timer. 
    // The timer owner client, if connected, will then brodcast a sync event 
    requestSync: function (socket) {
        console.log('Sync requested for timer ' + socket.handshake.query.timerCode);
        let timerOwner = timerOwners.find(obj => obj.timerCode === socket.handshake.query.timerCode);
        if (timerOwner) {
            socket.to(timerOwner.socketId).emit('syncRequest');
            console.log('Sync served by timer owner')
        } else {
            console.log('No sync, owner not connected')
            //socket.broadcast.to(socket.handshake.query.timerCode).emit('syncTimer');
        }
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