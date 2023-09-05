
function prepareTimerForOutput(timers) {
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
  return timers;
}

// Formats seconds to text. 240 --> 04:00
function convertSecToText(totalSec) {
    let min = Math.floor(totalSec / 60);
    min < 10 ? min = '0' + min : '' + min;
    let sec = totalSec % 60;
    sec < 10 ? sec = '0' + sec : '' + sec;
    return min + ':' + sec;
  }

module.exports = prepareTimerForOutput;