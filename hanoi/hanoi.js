var count = 3;          //number of levels/tiers
var towers;             //where the current position is stored
var selected = null;    //the piece that is selected
var canvas;
var ctx;                //canvas ctx
var startTime;          //the time of the first move
var timing;             //true/false if the time is counting

function reset() {      //resets board to the initial position
    timing = false;     //not currently keeping track of time
    towers = [[], [], []];
    for (var i = count - 1; i >= 0; i--) {
        towers[0].push(i);      //putting value into array
    }
}


function init() {
    reset();
    window.addEventListener('keydown', this.check, false);
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    draw();
}

function check(e) {
    var code = typeof(e) == 'number' ? e+49 : e.keyCode;
    var target = null;
    if (code == 49) {           // 1 key
        target = 0;
    } else if (code == 50) {    // 2 key
        target = 1;
    } else if (code == 51) {    // 3 key
        target = 2;
    } else if (code == 82) {    // r key
        reset()
    } else if (code == 83 && !timing) {
        reset();
        solve();
    } else if (code == 38) {    // up arrow
        count += 1;
        reset();
    } else if (code == 40 && count > 2) {   // down arrow
        count -= 1;
        reset();
    }
    if (target != null) {
        if (selected == null) {
            if (towers[target].length != 0) {
                selected = target;
            }
        } else if (selected == target) { 
            selected = null;
        } else {
            if (towers[target].slice(-1)[0] == undefined) {
                if (!timing) {
                    console.log('timing');
                    var d = new Date()
                    startTime = d.getTime();
                    timing = true;
                }
                //move to empty tile
                var moving = towers[selected].pop();
                towers[target].push(moving);
                selected = undefined;
            } else if (towers[selected].slice(-1)[0] < towers[target].slice(-1)[0]) {
                var moving = towers[selected].pop();
                towers[target].push(moving);
                selected = undefined;
            } 
        }
    }
    draw();
}

function getlen(val) {
    //formula for calculating width of pieces
    return (20 + (val*(70/(count-1))));
}

function select(tower) {
    theight = towers[tower].length; //tower height
    ctx.fillStyle = '#000000';  //black
    ctx.fillText('>', 70 + (120*tower) - getlen(towers[tower].slice(-1)[0])/2 - 20, 185 - (10 * towers[tower].length));
}

function draw() {
    //clear board
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //selected
    if (selected != undefined) {
        select(selected);
    }
    
    //board
    ctx.fillStyle = '#000000';  //black
    ctx.fillRect(25, 180, 100, 10);
    ctx.fillRect(70, 80, 10, 100);
    ctx.fillRect(150, 180, 100, 10);
    ctx.fillRect(195, 80, 10, 100);
    ctx.fillRect(275, 180, 100, 10);
    ctx.fillRect(320, 80, 10, 100);
    ctx.fillText(count, 10, 15);
    
    //pieces
    for (var i = 0; i < 3; i++) {
        for (var j = (towers[i].length-1); j >= 0; j--) {
            val = towers[i][j];
            ctx.fillStyle = color(val);
            len = getlen(val);
            ctx.fillRect(75+ (125*i) - len/2, 170-(10*j), len, 10)
        }
    }
    if (towers[0].length == 0 && towers[1].length == 0) {
        ctx.fillStyle = '#000000';
        var d = new Date()
        timeDiff = d.getTime() - startTime;
        ctx.fillText(timeDiff/1000, 350, 15);
    }
}

function color(num) {
    var hue = num*300;
    return('hsl('+hue+',100%,50%)');
}


// solver

function solve() {
    console.log('trying to solve!');
    moveTopNToHere(count, 0, 2, 1);
}

function move(startPosition, endPosition) {
    setTimeout(function() {check(startPosition);}, 1000);
    setTimeout(function() {check(endPosition);}, 1000);
}

function moveTopNToHere(n, startPosition, endPosition, missingPosition) {
    if (n == 1) {
        move(startPosition, endPosition);
    } else {
        moveTopNToHere(n-1, startPosition, missingPosition, endPosition);
        move(startPosition, endPosition);
        moveTopNToHere(n-1, missingPosition, endPosition, startPosition);
    }
}