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

async function handleBurstEvent() {
  const maxWidth = document.documentElement.clientWidth
  const maxHeight = document.documentElement.clientHeight

  x = Math.floor((Math.random() * maxWidth) + 1);
  y = Math.floor((Math.random() * maxHeight) + 1);

  await createBurst(x, y)
  
}

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  controllers[e.gamepad.index] = e.gamepad;
  startAnimation()
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
        startAnimation()
      }
    }
  }
}

function handleInput() {
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
        handleBurstEvent()
      }
    }

    // for (i = 0; i < controller.axes.length; i++) {
    //   controller.axes[i].toFixed(4);
    // }
  }

}

function frameLoop() {
  if (!haveEvents) {
    scangamepads();
  }

  setInterval(handleInput, 500);
  requestAnimationFrame(frameLoop);
}

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

document.addEventListener("keydown", async () => await handleBurstEvent());
window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);