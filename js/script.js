var mouse = new Mouse();
var keyboard = new Keyboard();
var controller = new Controller();
var animation = new Animation();
var targets = [];


function startAnimation() {
  requestAnimationFrame(frameLoop);
}

function handleInput() {
  const keyboardCoords = keyboard.handleKeyboardInput((key) => animation.generateRandomCoordinateOnScreen());
  const mouseClicked = mouse.handleMouseInput((button) => button);
  const mouseCoords = mouse.handleMouseMovement((x, y) => ({ x: x, y: y }));
  const buttonsPressed = controller.handleButtonInput((button) => button);
  const axisCoords = controller.handleStickInput((x, y) => ({ x: x, y: y }));

  return {
    keyboardCoords: keyboardCoords,
    mouseClicked: mouseClicked,
    mouseCoords: mouseCoords,
    buttonsPressed: buttonsPressed,
    axisCoords: axisCoords,
  }

}

function updateCrossHair(inputData) {
  animation.drawCrossHair(inputData.mouseCoords.x, inputData.mouseCoords.y);
  if (inputData.axisCoords.length !== 0) {
    animation.drawCrossHair(inputData.axisCoords[0].x, inputData.axisCoords[0].y);
  }
}

function triggerBurst(inputData) {
  const burstCoords = []
  if (inputData.mouseClicked.length > 0) {
    inputData.mouseClicked.forEach((button) => {
      animation.createBurst(inputData.mouseCoords.x, inputData.mouseCoords.y);
      burstCoords.push({ x: inputData.mouseCoords.x, y: inputData.mouseCoords.y })
    });
  }
  if (inputData.keyboardCoords.length > 0) {
    inputData.keyboardCoords.forEach((coord) => {
      animation.createBurst(coord.x, coord.y);
      burstCoords.push({ x: coord.x, y: coord.y })
    });
  }
  if (inputData.buttonsPressed.length > 0) {
    inputData.buttonsPressed.forEach((button) => {
      animation.createBurst(inputData.axisCoords[0].x, inputData.axisCoords[0].y);
      burstCoords.push({ x: inputData.axisCoords[0].x, y: inputData.axisCoords[0].y })
    });
  }

  return burstCoords;
}

function updateTarget(burstCoords) {
  const activeTargets = targets.filter((t) => t.active);
  if (activeTargets.length < 6) {
    var r = Math.random();
    if (r > 0.99) {
      var idx = targets.length;
      targets[idx] = {};
      targets[idx].coord = animation.generateRandomCoordinateOnScreen();
      targets[idx].active = true;
      animation.drawMovingStar(
          targets[idx].coord.x,
          targets[idx].coord.y,
          (newX, newY) => {
            targets[idx].coord = { x: newX, y: newY }
          },
          () => targets[idx].active,
        );
    }
  }

  targets.forEach((target, idx) => {
    if (!target.active) {
      return;
    }
    const hit = burstCoords.filter((coord) => (coord.x - target.coord.x) * (coord.x - target.coord.x) + (coord.y - target.coord.y) * (coord.y - target.coord.y) <= RADIUS_STAR * RADIUS_STAR);
    if (hit.length > 0) {
      animation.createStarBurst(target.coord.x, target.coord.y);
      targets[idx].active = false;
    }
  });


}

function handleFrameUpdate(inputData) {
  updateCrossHair(inputData);
  burstCoords = triggerBurst(inputData);
  updateTarget(burstCoords);
}

function frameLoop() {
  const inputData = handleInput();
  handleFrameUpdate(inputData);
  requestAnimationFrame(frameLoop);
}

window.addEventListener("gamepadconnected", controller.connecthandler);
window.addEventListener("gamepaddisconnected", controller.disconnecthandler);
document.addEventListener("keydown", keyboard.registerKeyDown);
document.addEventListener('mousemove', mouse.registerMousePosition);
document.addEventListener('click', mouse.registerMouseClick);
startAnimation();