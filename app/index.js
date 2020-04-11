import clock from 'clock';
import document from 'document';
import { preferences } from 'user-settings';
import * as util from '../common/utils';
import { HeartRateSensor } from 'heart-rate';
import { today } from 'user-activity';

const imageNamePrefix = '32x32_';
const imageExtension = '.png';
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const score3 = document.getElementById('score3');
const score4 = document.getElementById('score4');
const score5 = document.getElementById('score5');

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

    updateScore();
  });
  hrm.start();
}

// Update the clock every minute
clock.granularity = 'minutes';

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

function updateScore() {
  const steps = today.adjusted.steps;
  setOne(steps, score1);
  setTen(steps, score2);
  setHundred(steps, score3);
  setThousand(steps, score4);
  setTenThousand(steps, score5);
}

function setOne(val, target) {
  drawDigit(Math.floor(val % 10), target);
}

function setTen(val, target) {
  drawDigit(Math.floor(Math.floor(val % 100) / 10), target);
}

function setHundred(val, target) {
  drawDigit(Math.floor(Math.floor(val % 1000) / 100), target);
}

function setThousand(val, target) {
  drawDigit(Math.floor(Math.floor(val % 10000) / 1000), target);
}

function setTenThousand(val, target) {
  drawDigit(Math.floor(val / 10000), target);
}

function drawDigit(val, target) {
  target.image = `${imageNamePrefix}${val}${imageExtension}`;
}
