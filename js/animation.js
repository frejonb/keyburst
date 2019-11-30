const COLORS = {
    RED: '#FD5061',
    YELLOW: '#FFCEA5',
    BLACK: '#29363B',
    WHITE: 'white',
    VINOUS: '#A50710'
}

const burst1Config = {
    left: 0, top: 0,
    count: 8,
    radius: { 50: 150 },
    children: {
        shape: 'line',
        stroke: ['white', '#FFE217', '#FC46AD', '#D0D202', '#B8E986', '#D0D202'],
        scale: 1,
        scaleX: { 1: 0 },
        // pathScale:    'rand(.5, 1.25)',
        degreeShift: 'rand(-90, 90)',
        radius: 'rand(20, 40)',
        // duration:     200,
        delay: 'rand(0, 150)',
        isForce3d: true
    }
};

const largeBurstConfig = {
    left: 0, top: 0,
    count: 4,
    radius: 0,
    angle: 45,
    radius: { 0: 450 },
    children: {
        shape: 'line',
        stroke: '#4ACAD9',
        scale: 1,
        scaleX: { 1: 0 },
        radius: 100,
        duration: 450,
        isForce3d: true,
        easing: 'cubic.inout'
    }
};

const CIRCLE_OPTS = {
    left: 0, top: 0,
    scale: { 0: 1 },
}

const largeCircleConfig = {
    ...CIRCLE_OPTS,
    fill: 'none',
    stroke: 'white',
    strokeWidth: 4,
    opacity: { .25: 0 },
    radius: 250,
    duration: 600,
};

const smallCircleConfig = {
    ...CIRCLE_OPTS,
    fill: 'white',
    opacity: { .5: 0 },
    radius: 30,
};

var canvas = document.querySelector("#canvas")
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Animation {

    async createBurst(x, y) {
        await new Promise(resolve => {
            const burst1 = new mojs.Burst({
                ...burst1Config,
                onStart() {
                    new Audio('./laser.wav').play();
                },
                onComplete() {
                    burst1.el.parentNode.removeChild(burst1.el);
                }
            })
                .tune({ x: x, y: y })
                .generate()
                .replay();
    
            const largeBurst = new mojs.Burst({
                ...largeBurstConfig,
                onComplete() {
                    largeBurst.el.parentNode.removeChild(largeBurst.el);
                }
            })
                .tune({ x: x, y: y })
                .replay();
    
            const largeCircle = new mojs.Shape({
                ...largeCircleConfig,
                onComplete() {
                    largeCircle.el.parentNode.removeChild(largeCircle.el);
                }
            })
                .tune({ x: x, y: y })
                .replay();
    
            const smallCircle = new mojs.Shape({
                ...smallCircleConfig,
                onComplete() {
                    smallCircle.el.parentNode.removeChild(smallCircle.el);
                }
            })
                .tune({ x: x, y: y })
                .replay();
    
        });
    }

    async createRandomBurst() {
        const maxWidth = document.documentElement.clientWidth
        const maxHeight = document.documentElement.clientHeight
        
        var x = Math.floor((Math.random() * maxWidth) + 1);
        var y = Math.floor((Math.random() * maxHeight) + 1);
        await this.createBurst(x, y)
    
    }

    drawCrossHair(x, y) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
        context.beginPath();
        context.arc(x, y, 50, 0, 2 * Math.PI, true);
        context.strokeStyle = "#FF6A6A";
        context.lineWidth = 10;
        context.stroke();
    }
}