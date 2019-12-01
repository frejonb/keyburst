var mouse = new Mouse();
var keyboard = new Keyboard();
var controller = new Controller();
var animation = new Animation();


function startAnimation() {
  requestAnimationFrame(frameLoop);
}

function handleInput() {
  var keyboardCoords = keyboard.handleKeyboardInput((key) => animation.generateRandomCoordinateOnScreen());
  var mouseClicked = mouse.handleMouseInput((button) => button);
  var mouseCoords = mouse.handleMouseMovement((x, y) => ({x: x, y: y}));
  var buttonsPressed = controller.handleButtonInput((button) => button);
  var axisCoords = controller.handleStickInput((x, y) => ({x: x, y: y}));

  console.log(`keyboard coords: ${JSON.stringify(keyboardCoords)}`);
  console.log(`mouse button clicked: ${JSON.stringify(mouseClicked)}`);
  console.log(`mouse coords: ${JSON.stringify(mouseCoords)}`);
  console.log(`buttons pressed: ${JSON.stringify(buttonsPressed)}`);
  console.log(`axis coords: ${JSON.stringify(axisCoords)}`);
}

function handleFrameUpdate() {
  animation.drawStar(100, 100);
}

function frameLoop() {
  handleInput();
  handleFrameUpdate();
  requestAnimationFrame(frameLoop);
}

window.addEventListener("gamepadconnected", controller.connecthandler);
window.addEventListener("gamepaddisconnected", controller.disconnecthandler);
document.addEventListener("keydown", keyboard.registerKeyDown);
document.addEventListener('mousemove', mouse.registerMousePosition);
document.addEventListener('click', mouse.registerMouseClick);
startAnimation();