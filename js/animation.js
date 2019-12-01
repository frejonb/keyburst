const RADIUS_STAR = 100;

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

class Star extends mojs.CustomShape {
    getShape() {
        return '<path d="M5.51132201,34.7776271 L33.703781,32.8220808 L44.4592855,6.74813038 C45.4370587,4.30369752 47.7185293,3 50,3 C52.2814707,3 54.5629413,4.30369752 55.5407145,6.74813038 L66.296219,32.8220808 L94.488678,34.7776271 C99.7034681,35.1035515 101.984939,41.7850013 97.910884,45.2072073 L75.9109883,63.1330483 L82.5924381,90.3477341 C83.407249,94.4217888 80.4739296,97.6810326 77.0517236,97.6810326 C76.0739505,97.6810326 74.9332151,97.3551083 73.955442,96.7032595 L49.8370378,81.8737002 L26.044558,96.7032595 C25.0667849,97.3551083 23.9260495,97.6810326 22.9482764,97.6810326 C19.3631082,97.6810326 16.2668266,94.4217888 17.4075619,90.3477341 L23.9260495,63.2960105 L2.08911601,45.2072073 C-1.98493875,41.7850013 0.296531918,35.1035515 5.51132201,34.7776271 Z" />';
    }
}
mojs.addShape('star', Star);

var canvas = document.querySelector("#canvas")
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Animation {

    async createStarBurst(x, y) {
        await new Promise(resolve => {
            const circleStar = new mojs.Shape({
                left: 0, top: 0,
                stroke: '#FF9C00',
                strokeWidth: { [2 * RADIUS_STAR]: 0 },
                fill: 'none',
                scale: { 0: 1, easing: 'quad.out' },
                radius: RADIUS_STAR,
                duration: 450,
                onComplete() {
                    circleStar.el.parentNode.removeChild(circleStar.el);
                },
            }).tune({ x: x, y: y })
                .generate()
                .replay();;

            const burstStar = new mojs.Burst({
                left: 0, top: 0,
                radius: { 6: RADIUS_STAR - 3 },
                angle: 45,
                children: {
                    shape: 'star',
                    radius: RADIUS_STAR / 2.2,
                    fill: '#FD7932',
                    degreeShift: 'stagger(0,-5)',
                    duration: 700,
                    delay: 200,
                    easing: 'quad.out',
                    // delay:        100,
                },
                onComplete() {
                    burstStar.el.parentNode.removeChild(burstStar.el);
                },
            }).tune({ x: x, y: y })
                .generate()
                .replay();;
        });
    }

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

    generateRandomCoordinateOnScreen() {
        const maxWidth = document.documentElement.clientWidth
        const maxHeight = document.documentElement.clientHeight

        var x = Math.floor((Math.random() * maxWidth) + 1);
        var y = Math.floor((Math.random() * maxHeight) + 1);
        return {x: x, y: y};

    }

    drawCrossHair(x, y) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        context.beginPath();
        context.strokeStyle = "#FF6A6A";
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.moveTo(x - 50, y);
        context.lineTo(x + 50, y);
        context.moveTo(x, y - 50);
        context.lineTo(x, y + 50);
        context.stroke();

        context.beginPath();
        context.lineWidth = 2;
        context.setLineDash([]);
        context.arc(x, y, 20, 0, 2 * Math.PI, true);
        context.stroke();
    }

    async drawMovingStar(x, y) {
        await new Promise(resolve => {
            const star = new mojs.Shape({
                left: 0, top: 0,
                shape: 'star',
                isShowStart: true,
                fill: '#FF9C00',
                // scale: { 0: 1 },
                // easing: 'elastic.out',
                // duration: 16000,
                delay: 0,
                radius: RADIUS_STAR / 2.35,
                onComplete() {
                    const maxWidth = document.documentElement.clientWidth
                    const maxHeight = document.documentElement.clientHeight

                    var x = Math.floor((Math.random() * maxWidth) + 1);
                    var y = Math.floor((Math.random() * maxHeight) + 1);
                    star.tune({x: x, y: y}).replay();
                },
            }).tune({x: x, y: y}).replay();
            console.log(star)
        });
    }


}