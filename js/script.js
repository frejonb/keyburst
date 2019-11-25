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

var controllers = {};

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && !(gamepads[i].index in controllers)) {
        controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

function handleInput(gp) {
  var pressed = gp.buttons.filter((button) => {
    if(typeof(button) == "object") {
      return button.pressed;
    } else {
      return button == 1.0;
    }
  });

  if (pressed.length > 0) {
    console.log(`pressed ${pressed.length} buttons`);
  } else {
    console.log("not pressing anything");
  }

  // for (i = 0; i < controller.axes.length; i++) {
  //   var a = axes[i];
  //   a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
  //   a.setAttribute("value", controller.axes[i] + 1);
  // }
}
function handleFrame() {

  console.log("scan gamepads");
  scangamepads()
  if (controllers.length > 0) {
    console.log("found controllers!")
    var controller = controllers[0];
  
    console.log("handle input");
    handleInput(controller);
  }

  console.log("done");
  

  requestAnimationFrame(handleFrame);
}

document.addEventListener("keydown", async () =>
  await handleBurstEvent());

requestAnimationFrame(handleFrame);