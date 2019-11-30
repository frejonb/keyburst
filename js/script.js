const KEYBOARD_DEBOUNCE_TIME = 500;
const BUTTON_DEBOUNCE_TIME = 500;
const CLICK_DEBOUNCE_TIME = 10;

const COLORS = {
  RED:      '#FD5061',
  YELLOW:   '#FFCEA5',
  BLACK:    '#29363B',
  WHITE:    'white',
  VINOUS:   '#A50710'
}

const burst1Config = {
  left: 0, top: 0,
  count:          8,
  radius:         { 50: 150 },
  children: {
    shape:        'line',
    stroke:       [ 'white', '#FFE217', '#FC46AD', '#D0D202', '#B8E986', '#D0D202' ],
    scale:        1,
    scaleX:       { 1 : 0 },
    // pathScale:    'rand(.5, 1.25)',
    degreeShift:  'rand(-90, 90)',
    radius:       'rand(20, 40)',
    // duration:     200,
    delay:        'rand(0, 150)',
    isForce3d:    true
  }
};

const largeBurstConfig = {
  left: 0, top: 0,
  count:          4,
  radius:         0,
  angle:         45,
  radius:        { 0: 450  },
  children: {
    shape:        'line',
    stroke:       '#4ACAD9',
    scale:        1,
    scaleX:       { 1 : 0 },
    radius:       100,
    duration:     450,
    isForce3d:    true,
    easing:       'cubic.inout'
  }
};

const CIRCLE_OPTS = {
  left: 0, top: 0,
  scale:      { 0: 1 },
}

const largeCircleConfig = {
  ...CIRCLE_OPTS,
  fill:       'none',
  stroke:     'white',
  strokeWidth: 4,
  opacity:    { .25 : 0 },
  radius:     250,
  duration:   600,
};

const smallCircleConfig = {
  ...CIRCLE_OPTS,
  fill:       'white',
  opacity:    { .5 : 0 },
  radius:     30,
};
  
async function createBurst(x, y) {
  await new Promise(resolve => {
    const burst1 = new mojs.Burst({
        ...burst1Config,
        onStart() {
          new Audio('./laser.wav').play();
        },
        onComplete(){
          burst1.el.parentNode.removeChild(burst1.el);
        }
      })
      .tune({ x: x, y: y })
      .generate()
      .replay();
    
    const largeBurst = new mojs.Burst({
        ...largeBurstConfig,
        onComplete(){
          largeBurst.el.parentNode.removeChild(largeBurst.el);
        }
      })
      .tune({ x: x, y: y })
      .replay();
    
    const largeCircle = new mojs.Shape({
        ...largeCircleConfig,
        onComplete(){
          largeCircle.el.parentNode.removeChild(largeCircle.el);
        }
      })
      .tune({ x: x, y: y })
      .replay();
    
    const smallCircle = new mojs.Shape({
        ...smallCircleConfig,
        onComplete(){
          smallCircle.el.parentNode.removeChild(smallCircle.el);
        }
      })
      .tune({ x: x, y: y })
      .replay();

  });
}

function drawCrossHair(x, y) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
 
  context.beginPath();
  context.arc(x, y,50, 0, 2 * Math.PI, true);
  context.strokeStyle = "#FF6A6A";
  context.lineWidth= 10;
  context.stroke();
}  

async function createRandomBurst() {
  const maxWidth = document.documentElement.clientWidth
  const maxHeight = document.documentElement.clientHeight

  x = Math.floor((Math.random() * maxWidth) + 1);
  y = Math.floor((Math.random() * maxHeight) + 1);

  await createBurst(x, y)
  
}

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var keysPressed = [];
var buttonsPressed = [];
var clickDown = [];
var mousePosition = {x: 100, y: 100};
var canvas = document.querySelector("#canvas")
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function connecthandler(e) {
  controllers[e.gamepad.index] = e.gamepad;
}

function disconnecthandler(e) {
  delete controllers[e.gamepad.index];
}

function startAnimation() {
  requestAnimationFrame(frameLoop);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        controllers[e.gamepad.index] = e.gamepad;
      }
    }
  }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function registerButtonDown(buttonIndex) {
  if (!(buttonIndex in buttonsPressed)) {
    buttonsPressed = {
      ...buttonsPressed,
      [buttonIndex]: {
        inCoolDown: false
      }
    };
  }
}
function handleControllerInput() {
  var i = 0;
  var j;

  for (j in controllers) {
    var controller = controllers[j];

    for (i = 0; i < controller.buttons.length; i++) {
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
      }
      if (pressed) {
        registerButtonDown(i)
      }
    }
    drawCrossHair(controller.axes[0].toFixed(4), controller.axes[1].toFixed(4));
    
  }

  Object.keys(buttonsPressed)
    .forEach(async (index) => {
      if(!buttonsPressed[index].inCoolDown) {
        buttonsPressed[index].inCoolDown = true;
        setTimeout(() => delete buttonsPressed[index], BUTTON_DEBOUNCE_TIME);
        // await createRandomBurst();
        await createBurst(mousePosition.x, mousePosition.y);
      }
    });

}

function registerMousePosition(e) {
  mousePosition = {
    x: e.clientX,
    y: e.clientY,
  }
}
function registerMouseClick() {
  if (clickDown.length == 0) {
    clickDown = [
      {
        inCoolDown: false
      }
    ];
  }
}
function registerKeyDown(e) {
  if (!(e.key in keysPressed)) {
    keysPressed = {
      ...keysPressed,
      [e.key]: {
        inCoolDown: false
      }
    };
  }
}
function handleKeyboardInput() {
  Object.keys(keysPressed)
    .forEach(async (key) => {
      if(!keysPressed[key].inCoolDown) {
        keysPressed[key].inCoolDown = true;
        setTimeout(() => delete keysPressed[key], KEYBOARD_DEBOUNCE_TIME);
        await createRandomBurst();
      }
    });
}
function handleMouseInput() {
  clickDown.forEach(async (key) => {
    if(!clickDown[0].inCoolDown) {
      clickDown[0].inCoolDown = true;
      setTimeout(() => clickDown = [], CLICK_DEBOUNCE_TIME);
      await createBurst(mousePosition.x, mousePosition.y);
    }
  });
}

function handleInput() {
  handleControllerInput();
  handleKeyboardInput();
  handleMouseInput();
}

function frameLoop() {
  if (!haveEvents) {
    scangamepads();
  }
  handleInput();
  drawCrossHair(mousePosition.x, mousePosition.y);
  

  // console.log(mousePosition.x, mousePosition.y);
  requestAnimationFrame(frameLoop);
  
}

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

document.addEventListener("keydown", registerKeyDown);
window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);
document.addEventListener('mousemove', registerMousePosition);
document.addEventListener('click', registerMouseClick);
startAnimation();