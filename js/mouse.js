const CLICK_DEBOUNCE_TIME = 10;
clickDown = [];
mousePosition = { x: 100, y: 100 };

class Mouse {

    registerMousePosition(e) {
        mousePosition = {
            x: e.clientX,
            y: e.clientY,
        }
    }

    registerMouseClick() {
        if (clickDown.length == 0) {
            clickDown = [
                {
                    inCoolDown: false
                }
            ];
        }
    }

    handleMouseInput(action) {
        clickDown.forEach(async (key) => {
            if (!clickDown[0].inCoolDown) {
                clickDown[0].inCoolDown = true;
                setTimeout(() => clickDown = [], CLICK_DEBOUNCE_TIME);
                await action(mousePosition.x, mousePosition.y);
            }
        });
    }

    handleMouseMovement(action) {
        action(mousePosition.x, mousePosition.y);
    }
}

