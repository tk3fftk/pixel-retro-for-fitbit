import { BodyPresenceSensor } from 'body-presence';
import clock from 'clock';
import { display } from 'display';
import document from 'document';
import { HeartRateSensor } from 'heart-rate';
import { me } from 'appbit';
import { preferences } from 'user-settings';
import { today, primaryGoal } from 'user-activity';

const imageNamePrefix = '32x32_';
const imageExtension = '.png';
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const score3 = document.getElementById('score3');
const score4 = document.getElementById('score4');
const score5 = document.getElementById('score5');
const hours1 = document.getElementById('hours1');
const hours2 = document.getElementById('hours2');
const minutes1 = document.getElementById('minutes1');
const minutes2 = document.getElementById('minutes2');
const month1 = document.getElementById('month1');
const month2 = document.getElementById('month2');
const date1 = document.getElementById('date1');
const date2 = document.getElementById('date2');

let hrm;
let body;

if (HeartRateSensor) {
  hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener('reading', () => {
    // update number if hearts based on your heart rate
    const numberOfHeart = hrm.heartRate / 10;

    for (let i = 1; i <= 15; i++) {
      document.getElementById(`h${i}`).style.visibility =
        numberOfHeart >= i ? 'visible' : 'hidden';
    }
  });
  hrm.start();
} else {
  hideHearts();
}

if (BodyPresenceSensor) {
  body = new BodyPresenceSensor();
  body.addEventListener('reading', () => {
    if (!body.present) {
      hrm ? hrm.stop() : {};
      hideHearts();
    } else {
      hrm ? hrm.start() : {};
      showHearts();
    }
  });
  body.start();
}

// Update the clock every minute
clock.granularity = 'minutes';

clock.ontick = (evt) => {
  const d = evt.date;
  const mins = d.getMinutes();
  const hours = d.getHours();
  const date = d.getDate();
  const month = d.getMonth() + 1;
  if (preferences.clockDisplay === '12h') {
    // 12h format
    hours = hours % 12 || 12;
  }
  setOne(mins, minutes1);
  setTen(mins, minutes2);
  setOne(hours, hours1);
  setTen(hours, hours2);
  setOne(date, date1);
  setTen(date, date2);
  setOne(month, month1);
  setTen(month, month2);

  updateScore();
};

if (display.aodAvailable && me.permissions.granted('access_aod')) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener('change', () => {
    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on && HeartRateSensor) {
      // Show elements & start sensors
      hrm.start();
      showHearts();
      document.getElementById('scoreArea').style.display = 'inline';
      body.start();
    } else {
      // Hide elements & stop sensors
      hrm.stop();
      hideHearts();
      document.getElementById('scoreArea').style.display = 'none';
      body.stop();
    }
  });
}

function updateScore() {
  let entireScore = 0;
  if (me.permissions.granted('access_activity')) {
    const activity = today.adjusted;
    switch (primaryGoal) {
      case 'steps':
        entireScore = activity.steps;
        break;
      case 'distance':
        entireScore = activity.distance;
        break;
      case 'calories':
        entireScore = activity.calories;
        break;
      case 'elevationGain':
        entireScore = activity.elevationGain;
        break;
      case 'activeMinutes':
        entireScore = activity.activeMinutes;
        break;
      default:
        break;
    }
  }
  // set 0 if undifined is returned
  entireScore = entireScore || 0;
  setOne(entireScore, score1);
  setTen(entireScore, score2);
  setHundred(entireScore, score3);
  setThousand(entireScore, score4);
  setTenThousand(entireScore, score5);
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

function hideHearts() {
  document.getElementById('hrArea').style.display = 'none';
}

function showHearts() {
  document.getElementById('hrArea').style.display = 'inline';
}
