const KEYBOARD_DEBOUNCE_TIME = 500;
keysPressed = [];

class Keyboard {

    registerKeyDown(e) {
        if (!(e.key in keysPressed)) {
            keysPressed = {
                ...keysPressed,
                [e.key]: {
                    inCoolDown: false
                }
            };
        }
    }

    handleKeyboardInput(action) {
        const coords = []
        Object.keys(keysPressed)
            .forEach((key) => {
                if (!keysPressed[key].inCoolDown) {
                    keysPressed[key].inCoolDown = true;
                    setTimeout(() => delete keysPressed[key], KEYBOARD_DEBOUNCE_TIME);
                    coords.push(action(key));
                }
            });

        return coords;
    }
}