module.exports = {
    joinRoom: function (socket) {
        console.log('joinRoom timer code: ' + socket.handshake.query.timerCode);
        if (socket.handshake.query.timerCode) {
            socket.join(socket.handshake.query.timerCode);
        }
    },

    startTimer: function (socket, io) {
        console.log('startTimer code: ' + socket.handshake.query.timerCode);
        io.to(socket.handshake.query.timerCode).emit('startTimer');
    },

    pauseTimer: function (socket, io) {
        console.log('pauseTimer code: ' + socket.handshake.query.timerCode);
        io.to(socket.handshake.query.timerCode).emit('pauseTimer');
    }
};