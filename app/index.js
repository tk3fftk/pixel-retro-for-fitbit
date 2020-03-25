import clock from 'clock';
import document from 'document';
import { preferences } from 'user-settings';
import * as util from '../common/utils';
import { HeartRateSensor } from 'heart-rate';
import { today } from 'user-activity';

let currentHR = 0;

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener('reading', () => {
    currentHR = hrm.heartRate;
    const numberOfHeart = currentHR / 10;
    console.log(`Current heart rate: ${currentHR}`);

    for (let i = 1; i <= 15; i++) {
      const isHidden = numberOfHeart >= i ? 'visible' : 'hidden';
      document.getElementById(`h${i}`).style.visibility = isHidden;
    }

    document.getElementById('score').text = today.adjusted.steps;
  });
  hrm.start();
}

/*
const hrArea = document.getElementById('hrArea');
const heartImg = document.createElement('img');
heartImg.src = 'heart.png';
for (let i = 0; i < (currentHR / 10); i++) {
  hrArea.appendChild(heartImg);
}
*/

// Update the clock every minute
clock.granularity = 'minutes';

// Get a handle on the <text> element
const myLabel = document.getElementById('myLabel');

// Update the <text> element every tick with the current time
clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === '12h') {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myLabel.text = `${hours}:${mins}`;
};
