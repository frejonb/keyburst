var mouse = new Mouse();
var keyboard = new Keyboard();
var controller = new Controller();
var animation = new Animation();


function startAnimation() {
  requestAnimationFrame(frameLoop);
}

function handleInput() {
  controller.handleButtonInput((x, y) => animation.createBurst(x, y));
  controller.handleStickInput(drawCrossHair(x, y));
  keyboard.handleKeyboardInput(() => animation.createRandomBurst());
  mouse.handleMouseInput(animation.createBurst);
  // mouse.handleMouseMovement(animation.drawCrossHair);
}

function frameLoop() {
  handleInput();
  requestAnimationFrame(frameLoop);
}

window.addEventListener("gamepadconnected", controller.connecthandler);
window.addEventListener("gamepaddisconnected", controller.disconnecthandler);
document.addEventListener("keydown", keyboard.registerKeyDown);
document.addEventListener('mousemove', mouse.registerMousePosition);
document.addEventListener('click', mouse.registerMouseClick);
startAnimation();