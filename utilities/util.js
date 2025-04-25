const query = require('../db/db');

function prepareTimerForOutput(timers) {
  for (var i=0; i<timers.length; i++) {
    if (timers[i].time_elapsed) {
        timers[i].time_elapsed = parseInt(timers[i].time_elapsed); // Bigint returns string
    }
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

async function oldTimerCleanup() {
    const result = await query(
        `DELETE FROM timer WHERE user_id IS null and last_visit_time < now() - interval '7 day'`
    );                
}

function pickTextColorBasedOnBgColor(bgColor, darkColor, lightColor) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (bgColor.substring(0,3) === "rgb") {
      let rgb = bgColor.split( ',' ) ;
      r = parseInt( rgb[0].substring(4) ) ; // skip rgb(
      g = parseInt( rgb[1] ) ; // this is just g
      b = parseInt( rgb[2] ) ; // parseInt scraps trailing )
    } else {
      let hex = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
      r = parseInt(hex.substring(0, 2), 16); // hexToR
      g = parseInt(hex.substring(2, 4), 16); // hexToG
      b = parseInt(hex.substring(4, 6), 16); // hexToB
    }
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 160) ? darkColor : lightColor;
  }
  
module.exports = { 
    prepareTimerForOutput : prepareTimerForOutput,
    oldTimerCleanup : oldTimerCleanup,
    pickTextColorBasedOnBgColor : pickTextColorBasedOnBgColor
};