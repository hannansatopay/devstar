gsap.config({ trialWarn: false });
let select = s => document.querySelector(s),
    toArray = s => gsap.utils.toArray(s),
    mainSVG = select('#mainSVG'),
    allEll = toArray('.ell'),
    colorArr = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];

let colorInterp = gsap.utils.interpolate(colorArr);

gsap.set(mainSVG, {
    visibility: 'visible'
});

function animate(el, count) {
    let tl = gsap.timeline({
        defaults: {
            ease: 'sine.inOut'
        },
        repeat: -1
    });
    gsap.set(el, {
        opacity: 1 - count / (allEll.length),
        stroke: colorInterp(count / (allEll.length))
    });

    tl.to(el, {
        attr: {
            ry: `-=${count * 2.3}`,
            rx: `+=${count * 1.4}`
        },
        ease: 'sine.in'
    })
        .to(el, {
            attr: {
                ry: `+=${count * 2.3}`,
                rx: `-=${count * 1.4}`
            },
            ease: 'sine'
        })
        .to(el, {
            duration: 1,
            rotation: -180,
            transformOrigin: '50% 50%'
        }, 0).timeScale(0.5);
}

allEll.forEach((c, i) => {
    gsap.delayedCall(i / (allEll.length - 1), animate, [c, i + 1]);
});

gsap.to('#aiGrad', {
    duration: 4,
    delay: 0.75,
    attr: {
        x1: '-=300',
        x2: '-=300'
    },
    scale: 1.2,
    transformOrigin: '50% 50%',
    repeat: -1,
    ease: 'none'
});

gsap.to('#ai', {
    duration: 1,
    scale: 1.1,
    transformOrigin: '50% 50%',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

// New code starts here

// Function to reload the page after 5 seconds
function reloadPageAfter5Seconds() {
    setTimeout(() => {
        window.location.reload();
    }, 5000); // 5000 milliseconds = 5 seconds
}

// Call the function to reload the page
reloadPageAfter5Seconds();
