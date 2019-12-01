const BUTTON_DEBOUNCE_TIME = 100;
var haveEvents = 'ongamepadconnected' in window;
buttonsPressed = [];
controllers = {};

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

if (!haveEvents) {
    setInterval(scangamepads, 500);
}

class Controller {

    connecthandler(e) {
        controllers[e.gamepad.index] = e.gamepad;
    }

    disconnecthandler(e) {
        delete controllers[e.gamepad.index];
    }

    registerButtonDown(buttonIndex) {
        if (!(buttonIndex in buttonsPressed)) {
            buttonsPressed = {
                ...buttonsPressed,
                [buttonIndex]: {
                    inCoolDown: false
                }
            };
        }
    }

    handleButtonInput(action) {
        if (!haveEvents) {
            scangamepads();
        }
        var i = 0;
        var j;

        for (j in controllers) {
            var controller = controllers[j];

            for (i = 0; i < controller.buttons.length; i++) {
                var val = controller.buttons[i];
                var pressed = val == 1.0;
                if (typeof (val) == "object") {
                    pressed = val.pressed;
                    val = val.value;
                }
                if (pressed) {
                    this.registerButtonDown(i)
                }
            }
        }

        var buttons = []
        Object.keys(buttonsPressed)
            .forEach((index) => {
                if (!buttonsPressed[index].inCoolDown) {
                    buttonsPressed[index].inCoolDown = true;
                    setTimeout(() => delete buttonsPressed[index], BUTTON_DEBOUNCE_TIME);
                    buttons.push(action(index));
                }
            });

        return buttons;
    }

    handleStickInput(action) {
        if (!haveEvents) {
            scangamepads();
        }
        var i = 0;
        var j;

        var axisCoords = []
        for (j in controllers) {
            var controller = controllers[j];
            axesCoords.push(action(
                ( 1.0 + controller.axes[0] ) * window.innerWidth * 0.5,
                ( 1.0 + controller.axes[1] ) * window.innerHeight * 0.5,
            ));
        }

        return axisCoords;
    }
}