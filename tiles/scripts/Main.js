(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setQ = exports.Q = void 0;
exports.Q = undefined;
function setQ(q) {
    exports.Q = q;
}
exports.setQ = setQ;
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const Color_1 = require("./Utils/Color");
class Grid {
    constructor(k) {
        this.constructGrid(k);
        this.solved = false;
        this.k = k;
    }
    *solve(solver) {
        let move = undefined;
        do {
            move = solver.getNextMove();
            yield move;
        } while (move);
    }
    constructGrid(k) {
        this.grid = [];
        for (let r = 0; r < (1 << k); r++) {
            let row = [];
            for (let c = 0; c < (1 << k); c++) {
                row.push(Color_1.Color.White);
            }
            this.grid.push(row);
        }
    }
}
exports.Grid = Grid;
},{"./Utils/Color":17}],5:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridManager = void 0;
const Color_1 = require("./Utils/Color");
const Grid_1 = require("./Grid");
const Exports_1 = require("./Exports");
class GridManager {
    constructor(canvasElement, k) {
        this._canvasElement = canvasElement;
        this._context = canvasElement.getContext('2d');
        this._grid = new Grid_1.Grid(k);
    }
    solve(solver) {
        return __awaiter(this, void 0, void 0, function* () {
            let delay = (ms) => {
                return new Promise(r => setTimeout(r, ms));
            };
            this.draw();
            return Exports_1.Q().then(() => __awaiter(this, void 0, void 0, function* () {
                const solved = this.grid.solve(solver);
                const cycle = Color_1.Color.cycle(this.grid.k);
                while (true) {
                    try {
                        const move = solved.next().value;
                        for (let coord of move.piece.getRelativeIndices()) {
                            this.grid.grid[move.location.row + coord.row][move.location.col + coord.col] = cycle.next().value;
                        }
                        this.draw(move);
                        yield delay(1);
                    }
                    catch (e) {
                        console.log('exited loop', e);
                        break;
                    }
                }
                return Exports_1.Q();
            }));
        });
    }
    draw(move) {
        let width = this.canvasElement.width / (1 << this.grid.k);
        let height = this.canvasElement.height / (1 << this.grid.k);
        if (move) {
            for (let idx of move.piece.getRelativeIndices()) {
                const row = move.location.row + idx.row;
                const col = move.location.col + idx.col;
                this.drawPiece(width, height, row, col);
            }
        }
        else {
            for (let row = 0; row < (1 << this.grid.k); row++) {
                for (let col = 0; col < (1 << this.grid.k); col++) {
                    this.drawPiece(width, height, row, col);
                }
            }
        }
    }
    drawPiece(width, height, row, col) {
        let x = col * width;
        let y = row * height;
        let color = this.grid.grid[row][col];
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        this.context.fillStyle = color.hexString;
        this.context.fill();
    }
    get canvasElement() { return this._canvasElement; }
    get context() { return this._context; }
    get grid() { return this._grid; }
}
exports.GridManager = GridManager;
},{"./Exports":3,"./Grid":4,"./Utils/Color":17}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
class Location {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}
exports.Location = Location;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GridManager_1 = require("./GridManager");
const BFSSolver_1 = require("./Solvers/BFSSolver");
const LSolver_1 = require("./Solvers/LSolver");
const SpiralSolver_1 = require("./Solvers/SpiralSolver");
const Pro = require("../third_party/q.js");
const Ex = require("./Exports");
// make Q() global
Ex.setQ(Pro);
const K = 8;
const bfsSolver = new BFSSolver_1.BFSSolver(K);
const spiralSolver = new SpiralSolver_1.SpiralSolver(K);
const lSolver = new LSolver_1.LSolver(K);
let idx = 0;
for (let solver of [bfsSolver, spiralSolver, lSolver]) {
    const c = window.document.getElementById(`canvas-${idx++}`);
    const gridManager = new GridManager_1.GridManager(c, K);
    gridManager.solve(solver).then(() => { console.log('done!'); });
}
},{"../third_party/q.js":18,"./Exports":3,"./GridManager":5,"./Solvers/BFSSolver":13,"./Solvers/LSolver":14,"./Solvers/SpiralSolver":16}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Move = void 0;
class Move {
    constructor(piece, location) {
        this.piece = piece;
        this.location = location;
    }
}
exports.Move = Move;
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orientation = void 0;
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Up"] = 0] = "Up";
    Orientation[Orientation["Down"] = 1] = "Down";
    Orientation[Orientation["Left"] = 2] = "Left";
    Orientation[Orientation["Right"] = 3] = "Right";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPiece = void 0;
const Piece_1 = require("./Piece");
const Location_1 = require("../Location");
const Orientation_1 = require("../Orientation");
class LPiece extends Piece_1.Piece {
    getRelativeIndices() {
        switch (+this.orientation) {
            /**
             *  #
             * ##
             */
            case Orientation_1.Orientation.Up:
                return [
                    new Location_1.Location(0, 0),
                    new Location_1.Location(-1, 0),
                    new Location_1.Location(0, -1),
                ];
            /**
             * ##
             * #
             */
            case Orientation_1.Orientation.Down:
                return [
                    new Location_1.Location(0, 0),
                    new Location_1.Location(+1, 0),
                    new Location_1.Location(0, +1),
                ];
            /**
             * ##
             *  #
             */
            case Orientation_1.Orientation.Left:
                return [
                    new Location_1.Location(0, 0),
                    new Location_1.Location(0, -1),
                    new Location_1.Location(+1, 0),
                ];
            /**
             * #
             * ##
             */
            case Orientation_1.Orientation.Right:
                return [
                    new Location_1.Location(0, 0),
                    new Location_1.Location(0, +1),
                    new Location_1.Location(-1, 0),
                ];
            default:
                console.error(`Orientation '${orientation}' not known.`);
                break;
        }
    }
    constructor(orientation) {
        super(orientation);
    }
}
exports.LPiece = LPiece;
},{"../Location":6,"../Orientation":9,"./Piece":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Piece = void 0;
class Piece {
    constructor(orientation) {
        this.orientation = orientation;
    }
}
exports.Piece = Piece;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglePiece = void 0;
const Piece_1 = require("./Piece");
const Location_1 = require("../Location");
class SinglePiece extends Piece_1.Piece {
    getRelativeIndices() {
        return [new Location_1.Location(0, 0)];
    }
    constructor(orientation) {
        super(orientation);
    }
}
exports.SinglePiece = SinglePiece;
},{"../Location":6,"./Piece":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BFSSolver = void 0;
const Move_1 = require("../Move");
const Location_1 = require("../Location");
const Solver_1 = require("./Solver");
const SinglePiece_1 = require("../Pieces/SinglePiece");
const LPiece_1 = require("../Pieces/LPiece");
const Orientation_1 = require("../Orientation");
class BFSSolver extends Solver_1.Solver {
    constructor(k) {
        super(k);
        this.reset(k);
    }
    reset(k) {
        super.reset(k);
        this.resetGrid(k);
        this.queue = [new Move_1.Move(new SinglePiece_1.SinglePiece(), new Location_1.Location(0, 0))];
    }
    resetGrid(k) {
        this.grid = [];
        for (let r = 0; r < (1 << k); r++) {
            let row = [];
            for (let c = 0; c < (1 << k); c++) {
                row.push(false);
            }
            this.grid.push(row);
        }
    }
    getNextMove() {
        while (this.queue.length > 0) {
            const topMove = this.queue[0];
            this.queue.shift();
            if (this.fits(topMove)) {
                for (let loc of topMove.piece.getRelativeIndices()) {
                    this.grid[topMove.location.row + loc.row][topMove.location.col + loc.col] = true;
                    this.queue.push(new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location(topMove.location.row + loc.row + 1, topMove.location.col + loc.col + 1)));
                    this.queue.push(new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Down), new Location_1.Location(topMove.location.row + loc.row - 1, topMove.location.col + loc.col - 1)));
                    this.queue.push(new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Left), new Location_1.Location(topMove.location.row + loc.row - 1, topMove.location.col + loc.col + 1)));
                    this.queue.push(new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Right), new Location_1.Location(topMove.location.row + loc.row + 1, topMove.location.col + loc.col - 1)));
                }
                return topMove;
            }
        }
    }
    fits(move) {
        console.log(move);
        const moveLocation = move.location;
        for (let relativeIndex of move.piece.getRelativeIndices()) {
            const rowPlacement = moveLocation.row + relativeIndex.row;
            const colPlacement = moveLocation.col + relativeIndex.col;
            if (!((0 <= rowPlacement && rowPlacement < this.grid.length) &&
                (0 <= colPlacement && colPlacement < this.grid[0].length))) {
                return false;
            }
            else if (this.grid[rowPlacement][colPlacement]) {
                return false;
            }
        }
        return true;
    }
}
exports.BFSSolver = BFSSolver;
},{"../Location":6,"../Move":8,"../Orientation":9,"../Pieces/LPiece":10,"../Pieces/SinglePiece":12,"./Solver":15}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSolver = void 0;
const Move_1 = require("../Move");
const Location_1 = require("../Location");
const Solver_1 = require("./Solver");
const SinglePiece_1 = require("../Pieces/SinglePiece");
const LPiece_1 = require("../Pieces/LPiece");
const Orientation_1 = require("../Orientation");
class LSolver extends Solver_1.Solver {
    reset(k) {
        super.reset(k);
        this.moves = this.getMoves(k);
    }
    getNextMove() {
        const move = this.moves.next().value;
        return move;
    }
    /**
     * quadrants
     * 0 1
     * 3 2
     */
    rotate(move, quadrant, k) {
        let orientation = move.piece.orientation;
        for (let i = 0; i < (quadrant % 4) && quadrant % 2 === 1; i++) {
            switch (+orientation) {
                case Orientation_1.Orientation.Up:
                    orientation = Orientation_1.Orientation.Left;
                    break;
                case Orientation_1.Orientation.Right:
                    orientation = Orientation_1.Orientation.Up;
                    break;
                case Orientation_1.Orientation.Down:
                    orientation = Orientation_1.Orientation.Right;
                    break;
                case Orientation_1.Orientation.Left:
                    orientation = Orientation_1.Orientation.Down;
                    break;
            }
        }
        const rotatedPiece = new LPiece_1.LPiece(orientation);
        let row = 0;
        let col = 0;
        switch (quadrant % 4) {
            case 0:
                break;
            case 1:
                col = (1 << (k - 1));
                break;
            case 2:
                row = (1 << (k - 1));
                col = (1 << (k - 1));
                break;
            case 3:
                row = (1 << (k - 1));
                break;
        }
        let rrow = move.location.row;
        let rcol = move.location.col;
        for (let i = 0; i < (quadrant % 4) && quadrant % 2 === 1; i++) {
            const oldRRow = rrow;
            rrow = (1 << (k - 1)) - rcol - 1;
            rcol = oldRRow;
        }
        const rotatedLocation = new Location_1.Location(row + rrow, col + rcol);
        const rotatedMove = new Move_1.Move(rotatedPiece, rotatedLocation);
        return rotatedMove;
    }
    *getMoves(k) {
        if (k === 0) {
            yield new Move_1.Move(new SinglePiece_1.SinglePiece(), new Location_1.Location(0, 0));
        }
        else {
            const topLeft = this.getMoves(k - 1);
            let moves = [];
            while (true) {
                const nextMove = topLeft.next().value;
                if (!nextMove) {
                    break;
                }
                moves.push(nextMove);
            }
            for (let move of moves) {
                if (move.piece instanceof SinglePiece_1.SinglePiece) {
                    yield move;
                }
                else if (move.piece instanceof LPiece_1.LPiece) {
                    yield this.rotate(move, 0, k);
                }
            }
            yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location(1 << (k - 1), 1 << (k - 1)));
            for (let quadrant of [1, 2, 3]) {
                for (let move of moves) {
                    if (move.piece instanceof LPiece_1.LPiece) {
                        yield this.rotate(move, quadrant, k);
                    }
                }
            }
        }
    }
}
exports.LSolver = LSolver;
},{"../Location":6,"../Move":8,"../Orientation":9,"../Pieces/LPiece":10,"../Pieces/SinglePiece":12,"./Solver":15}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solver = void 0;
class Solver {
    constructor(k) {
        this.reset(k);
    }
    reset(k) {
        this.k = k;
    }
}
exports.Solver = Solver;
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiralSolver = void 0;
const Move_1 = require("../Move");
const Location_1 = require("../Location");
const Solver_1 = require("./Solver");
const SinglePiece_1 = require("../Pieces/SinglePiece");
const LPiece_1 = require("../Pieces/LPiece");
const Orientation_1 = require("../Orientation");
class SpiralSolver extends Solver_1.Solver {
    reset(k) {
        super.reset(k);
        this.moves = this.getMoves(k);
    }
    getNextMove() {
        const move = this.moves.next().value;
        console.log(move);
        return move;
    }
    *getMoves(k) {
        if (k === 0) {
            yield new Move_1.Move(new SinglePiece_1.SinglePiece(), new Location_1.Location(0, 0));
        }
        else if (k === 1) {
            yield new Move_1.Move(new SinglePiece_1.SinglePiece(), new Location_1.Location(0, 0));
            yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location(1, 1));
        }
        else {
            const innerFrame = this.getMoves(k - 1);
            while (true) {
                const nextMove = innerFrame.next().value;
                console.log(nextMove);
                if (!nextMove) {
                    break;
                }
                yield new Move_1.Move(nextMove.piece, new Location_1.Location((1 << (k - 2)) + nextMove.location.row, (1 << (k - 2)) + nextMove.location.col));
            }
            if (k === 2) {
                yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Down), new Location_1.Location(0, 0));
                yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Left), new Location_1.Location(0, 3));
                yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location(3, 3));
                yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Right), new Location_1.Location(3, 0));
            }
            else {
                // build outer frame
                for (let layer = (1 << (k - 2)) - 2; layer >= 0; layer -= 2) {
                    // top
                    for (let col = 0; col < (1 << (k - 2)); col++) {
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Right), new Location_1.Location(layer + 1, 3 * col));
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Left), new Location_1.Location(layer, 3 * col + 2));
                    }
                    // right
                    for (let row = 0; row < (1 << (k - 2)); row++) {
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Down), new Location_1.Location(3 * row, (1 << k) - layer - 2));
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location(3 * row + 2, (1 << k) - layer - 1));
                    }
                    // bottom
                    for (let col = 0; col < 1 << (k - 2); col++) {
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Left), new Location_1.Location((1 << k) - layer - 2, (1 << k) - 3 * col - 1));
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Right), new Location_1.Location((1 << k) - layer - 1, (1 << k) - 3 * col - 3));
                    }
                    // left
                    for (let row = 0; row < (1 << (k - 2)); row++) {
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Up), new Location_1.Location((1 << k) - 3 * row - 1, layer + 1));
                        yield new Move_1.Move(new LPiece_1.LPiece(Orientation_1.Orientation.Down), new Location_1.Location((1 << k) - 3 * row - 3, layer));
                    }
                }
            }
        }
    }
}
exports.SpiralSolver = SpiralSolver;
},{"../Location":6,"../Move":8,"../Orientation":9,"../Pieces/LPiece":10,"../Pieces/SinglePiece":12,"./Solver":15}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = void 0;
class Color {
    constructor(r, g, b, a = 0xff) {
        [r, g, b, a].forEach(color => console.assert(0 <= color && color <= 0xff, 'Hues must be in the interval [0, 255].' + [r, g, b, a]));
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
        this._hexString = '#' +
            [this._r, this._b, this._g]
                .map((c) => this.pad(c.toString(16)))
                .join('');
        this._rgbaString = 'rgba(' + [this._r, this._g, this._b, this._a].join() + ')';
    }
    static get Red() { return Color._red; }
    static get Orange() { return Color._orange; }
    static get Yellow() { return Color._yellow; }
    static get Green() { return Color._green; }
    static get Blue() { return Color._blue; }
    static get Indigo() { return Color._indigo; }
    static get Violet() { return Color._violet; }
    static get White() { return Color._white; }
    static get Black() { return Color._black; }
    static *rainbow(k) {
        console.assert(0 <= 2 * k && 2 * k <= 24);
        const numColors = 1 << (2 * k);
        console.log(k, numColors);
        const x = 1 << (24 - 2 * k);
        for (let i = 0; i < numColors; i++) {
            const colorNum = i * x;
            const color = new Color((colorNum >> 0x10) & 0xff, (colorNum >> 0x8) & 0xff, colorNum & 0xff);
            console.log(i, x, colorNum);
            console.log(color);
            yield color;
        }
        console.log('finshed coloring');
    }
    static *cycle(k) {
        console.assert(0 <= 2 * k && 2 * k <= 24);
        const numColors = 1 << (2 * k);
        for (let idx = 0; idx < numColors; idx++) {
            yield new Color(Math.floor(0xff * (idx / numColors)), 0, 0, 1);
        }
        //    let idx = 0;
        //    for (let b = 0; b < 0xff && idx < numColors; b++) {
        //      for (let g = 0; g < 0xff && idx < numColors; g++) {
        //        for (let r = 0; r < 0xff && idx < numColors; r++) {
        //          for (let a = 0; a < 0xff && idx < numColors; a++) {
        //            yield new Color(r, g, b, a);
        //          }
        //        }
        //      }
        //    }
    }
    get hexString() {
        return this._hexString;
    }
    get rgbaString() {
        return this._rgbaString;
    }
    pad(num) {
        return num.length === 2 ? num : '0' + num;
    }
}
exports.Color = Color;
Color._red = new Color(0xf4, 0x36, 0x43);
Color._orange = new Color(0xff, 0x00, 0x98);
Color._yellow = new Color(0xff, 0x3b, 0xeb);
Color._green = new Color(0x4c, 0x50, 0xaf);
Color._blue = new Color(0x21, 0xf3, 0x96);
Color._indigo = new Color(0x3f, 0xb5, 0x51);
Color._violet = new Color(0x9c, 0xb0, 0x27);
Color._white = new Color(0xff, 0xff, 0xff);
Color._black = new Color(0x00, 0x00, 0x00);
},{}],18:[function(require,module,exports){
(function (process,setImmediate){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function (definition) {
    "use strict";
    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.
    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);
        // CommonJS
    }
    else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();
        // RequireJS
    }
    else if (typeof define === "function" && define.amd) {
        define(definition);
        // SES (Secure EcmaScript)
    }
    else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        }
        else {
            ses.makeQ = definition;
        }
        // <script>
    }
    else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;
        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();
        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };
    }
    else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }
})(function () {
    "use strict";
    var hasStacks = false;
    try {
        throw new Error();
    }
    catch (e) {
        hasStacks = !!e.stack;
    }
    // All code after this point will be filtered from stack traces reported
    // by Q.
    var qStartingLine = captureLine();
    var qFileName;
    // shims
    // used for fallback in "allResolved"
    var noop = function () { };
    // Use the fastest possible means to execute a task in a future turn
    // of the event loop.
    var nextTick = (function () {
        // linked list of tasks (single, with head node)
        var head = { task: void 0, next: null };
        var tail = head;
        var flushing = false;
        var requestTick = void 0;
        var isNodeJS = false;
        // queue for late tasks, used by unhandled rejection tracking
        var laterQueue = [];
        function flush() {
            /* jshint loopfunc: true */
            var task, domain;
            while (head.next) {
                head = head.next;
                task = head.task;
                head.task = void 0;
                domain = head.domain;
                if (domain) {
                    head.domain = void 0;
                    domain.enter();
                }
                runSingle(task, domain);
            }
            while (laterQueue.length) {
                task = laterQueue.pop();
                runSingle(task);
            }
            flushing = false;
        }
        // runs a single function in the async queue
        function runSingle(task, domain) {
            try {
                task();
            }
            catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!
                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }
                    throw e;
                }
                else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }
            if (domain) {
                domain.exit();
            }
        }
        nextTick = function (task) {
            tail = tail.next = {
                task: task,
                domain: isNodeJS && process.domain,
                next: null
            };
            if (!flushing) {
                flushing = true;
                requestTick();
            }
        };
        if (typeof process === "object" &&
            process.toString() === "[object process]" && process.nextTick) {
            // Ensure Q is in a real Node environment, with a `process.nextTick`.
            // To see through fake Node environments:
            // * Mocha test runner - exposes a `process` global without a `nextTick`
            // * Browserify - exposes a `process.nexTick` function that uses
            //   `setTimeout`. In this case `setImmediate` is preferred because
            //    it is faster. Browserify's `process.toString()` yields
            //   "[object Object]", while in a real Node environment
            //   `process.toString()` yields "[object process]".
            isNodeJS = true;
            requestTick = function () {
                process.nextTick(flush);
            };
        }
        else if (typeof setImmediate === "function") {
            // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
            if (typeof window !== "undefined") {
                requestTick = setImmediate.bind(window, flush);
            }
            else {
                requestTick = function () {
                    setImmediate(flush);
                };
            }
        }
        else if (typeof MessageChannel !== "undefined") {
            // modern browsers
            // http://www.nonblocking.io/2011/06/windownexttick.html
            var channel = new MessageChannel();
            // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
            // working message ports the first time a page loads.
            channel.port1.onmessage = function () {
                requestTick = requestPortTick;
                channel.port1.onmessage = flush;
                flush();
            };
            var requestPortTick = function () {
                // Opera requires us to provide a message payload, regardless of
                // whether we use it.
                channel.port2.postMessage(0);
            };
            requestTick = function () {
                setTimeout(flush, 0);
                requestPortTick();
            };
        }
        else {
            // old browsers
            requestTick = function () {
                setTimeout(flush, 0);
            };
        }
        // runs a task after all other tasks have been run
        // this is useful for unhandled rejection tracking that needs to happen
        // after all `then`d tasks have been run.
        nextTick.runAfter = function (task) {
            laterQueue.push(task);
            if (!flushing) {
                flushing = true;
                requestTick();
            }
        };
        return nextTick;
    })();
    // Attempt to make generics safe in the face of downstream
    // modifications.
    // There is no situation where this is necessary.
    // If you need a security guarantee, these primordials need to be
    // deeply frozen anyway, and if you don’t need a security guarantee,
    // this is just plain paranoid.
    // However, this **might** have the nice side-effect of reducing the size of
    // the minified code by reducing x.call() to merely x()
    // See Mark Miller’s explanation of what this does.
    // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
    var call = Function.call;
    function uncurryThis(f) {
        return function () {
            return call.apply(f, arguments);
        };
    }
    // This is equivalent, but slower:
    // uncurryThis = Function_bind.bind(Function_bind.call);
    // http://jsperf.com/uncurrythis
    var array_slice = uncurryThis(Array.prototype.slice);
    var array_reduce = uncurryThis(Array.prototype.reduce || function (callback, basis) {
        var index = 0, length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    });
    var array_indexOf = uncurryThis(Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    });
    var array_map = uncurryThis(Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    });
    var object_create = Object.create || function (prototype) {
        function Type() { }
        Type.prototype = prototype;
        return new Type();
    };
    var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
        obj[prop] = descriptor.value;
        return obj;
    };
    var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
    var object_keys = Object.keys || function (object) {
        var keys = [];
        for (var key in object) {
            if (object_hasOwnProperty(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    var object_toString = uncurryThis(Object.prototype.toString);
    function isObject(value) {
        return value === Object(value);
    }
    // generator related shims
    // FIXME: Remove this function once ES6 generators are in SpiderMonkey.
    function isStopIteration(exception) {
        return (object_toString(exception) === "[object StopIteration]" ||
            exception instanceof QReturnValue);
    }
    // FIXME: Remove this helper and Q.return once ES6 generators are in
    // SpiderMonkey.
    var QReturnValue;
    if (typeof ReturnValue !== "undefined") {
        QReturnValue = ReturnValue;
    }
    else {
        QReturnValue = function (value) {
            this.value = value;
        };
    }
    // long stack traces
    var STACK_JUMP_SEPARATOR = "From previous event:";
    function makeStackTraceLong(error, promise) {
        // If possible, transform the error stack trace by removing Node and Q
        // cruft, then concatenating with the stack trace of `promise`. See #57.
        if (hasStacks &&
            promise.stack &&
            typeof error === "object" &&
            error !== null &&
            error.stack) {
            var stacks = [];
            for (var p = promise; !!p; p = p.source) {
                if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
                    object_defineProperty(error, "__minimumStackCounter__", { value: p.stackCounter, configurable: true });
                    stacks.unshift(p.stack);
                }
            }
            stacks.unshift(error.stack);
            var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
            var stack = filterStackString(concatedStacks);
            object_defineProperty(error, "stack", { value: stack, configurable: true });
        }
    }
    function filterStackString(stackString) {
        var lines = stackString.split("\n");
        var desiredLines = [];
        for (var i = 0; i < lines.length; ++i) {
            var line = lines[i];
            if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
                desiredLines.push(line);
            }
        }
        return desiredLines.join("\n");
    }
    function isNodeFrame(stackLine) {
        return stackLine.indexOf("(module.js:") !== -1 ||
            stackLine.indexOf("(node.js:") !== -1;
    }
    function getFileNameAndLineNumber(stackLine) {
        // Named functions: "at functionName (filename:lineNumber:columnNumber)"
        // In IE10 function name can have spaces ("Anonymous function") O_o
        var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
        if (attempt1) {
            return [attempt1[1], Number(attempt1[2])];
        }
        // Anonymous functions: "at filename:lineNumber:columnNumber"
        var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
        if (attempt2) {
            return [attempt2[1], Number(attempt2[2])];
        }
        // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
        var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
        if (attempt3) {
            return [attempt3[1], Number(attempt3[2])];
        }
    }
    function isInternalFrame(stackLine) {
        var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
        if (!fileNameAndLineNumber) {
            return false;
        }
        var fileName = fileNameAndLineNumber[0];
        var lineNumber = fileNameAndLineNumber[1];
        return fileName === qFileName &&
            lineNumber >= qStartingLine &&
            lineNumber <= qEndingLine;
    }
    // discover own file name and line number range for filtering stack
    // traces
    function captureLine() {
        if (!hasStacks) {
            return;
        }
        try {
            throw new Error();
        }
        catch (e) {
            var lines = e.stack.split("\n");
            var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
            var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
            if (!fileNameAndLineNumber) {
                return;
            }
            qFileName = fileNameAndLineNumber[0];
            return fileNameAndLineNumber[1];
        }
    }
    function deprecate(callback, name, alternative) {
        return function () {
            if (typeof console !== "undefined" &&
                typeof console.warn === "function") {
                console.warn(name + " is deprecated, use " + alternative +
                    " instead.", new Error("").stack);
            }
            return callback.apply(callback, arguments);
        };
    }
    // end of shims
    // beginning of real work
    /**
     * Constructs a promise for an immediate reference, passes promises through, or
     * coerces promises from different systems.
     * @param value immediate reference or promise
     */
    function Q(value) {
        // If the object is already a Promise, return it directly.  This enables
        // the resolve function to both be used to created references from objects,
        // but to tolerably coerce non-promises to promises.
        if (value instanceof Promise) {
            return value;
        }
        // assimilate thenables
        if (isPromiseAlike(value)) {
            return coerce(value);
        }
        else {
            return fulfill(value);
        }
    }
    Q.resolve = Q;
    /**
     * Performs a task in a future turn of the event loop.
     * @param {Function} task
     */
    Q.nextTick = nextTick;
    /**
     * Controls whether or not long stack traces will be on
     */
    Q.longStackSupport = false;
    /**
     * The counter is used to determine the stopping point for building
     * long stack traces. In makeStackTraceLong we walk backwards through
     * the linked list of promises, only stacks which were created before
     * the rejection are concatenated.
     */
    var longStackCounter = 1;
    // enable long stacks if Q_DEBUG is set
    if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
        Q.longStackSupport = true;
    }
    /**
     * Constructs a {promise, resolve, reject} object.
     *
     * `resolve` is a callback to invoke with a more resolved value for the
     * promise. To fulfill the promise, invoke `resolve` with any value that is
     * not a thenable. To reject the promise, invoke `resolve` with a rejected
     * thenable, or invoke `reject` with the reason directly. To resolve the
     * promise to another thenable, thus putting it in the same state, invoke
     * `resolve` with that other thenable.
     */
    Q.defer = defer;
    function defer() {
        // if "messages" is an "Array", that indicates that the promise has not yet
        // been resolved.  If it is "undefined", it has been resolved.  Each
        // element of the messages array is itself an array of complete arguments to
        // forward to the resolved promise.  We coerce the resolution value to a
        // promise using the `resolve` function because it handles both fully
        // non-thenable values and other thenables gracefully.
        var messages = [], progressListeners = [], resolvedPromise;
        var deferred = object_create(defer.prototype);
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, operands) {
            var args = array_slice(arguments);
            if (messages) {
                messages.push(args);
                if (op === "when" && operands[1]) { // progress operand
                    progressListeners.push(operands[1]);
                }
            }
            else {
                Q.nextTick(function () {
                    resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
                });
            }
        };
        // XXX deprecated
        promise.valueOf = function () {
            if (messages) {
                return promise;
            }
            var nearerValue = nearer(resolvedPromise);
            if (isPromise(nearerValue)) {
                resolvedPromise = nearerValue; // shorten chain
            }
            return nearerValue;
        };
        promise.inspect = function () {
            if (!resolvedPromise) {
                return { state: "pending" };
            }
            return resolvedPromise.inspect();
        };
        if (Q.longStackSupport && hasStacks) {
            try {
                throw new Error();
            }
            catch (e) {
                // NOTE: don't try to use `Error.captureStackTrace` or transfer the
                // accessor around; that causes memory leaks as per GH-111. Just
                // reify the stack trace as a string ASAP.
                //
                // At the same time, cut off the first line; it's always just
                // "[object Promise]\n", as per the `toString`.
                promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
                promise.stackCounter = longStackCounter++;
            }
        }
        // NOTE: we do the checks for `resolvedPromise` in each method, instead of
        // consolidating them into `become`, since otherwise we'd create new
        // promises with the lines `become(whatever(value))`. See e.g. GH-252.
        function become(newPromise) {
            resolvedPromise = newPromise;
            if (Q.longStackSupport && hasStacks) {
                // Only hold a reference to the new promise if long stacks
                // are enabled to reduce memory usage
                promise.source = newPromise;
            }
            array_reduce(messages, function (undefined, message) {
                Q.nextTick(function () {
                    newPromise.promiseDispatch.apply(newPromise, message);
                });
            }, void 0);
            messages = void 0;
            progressListeners = void 0;
        }
        deferred.promise = promise;
        deferred.resolve = function (value) {
            if (resolvedPromise) {
                return;
            }
            become(Q(value));
        };
        deferred.fulfill = function (value) {
            if (resolvedPromise) {
                return;
            }
            become(fulfill(value));
        };
        deferred.reject = function (reason) {
            if (resolvedPromise) {
                return;
            }
            become(reject(reason));
        };
        deferred.notify = function (progress) {
            if (resolvedPromise) {
                return;
            }
            array_reduce(progressListeners, function (undefined, progressListener) {
                Q.nextTick(function () {
                    progressListener(progress);
                });
            }, void 0);
        };
        return deferred;
    }
    /**
     * Creates a Node-style callback that will resolve or reject the deferred
     * promise.
     * @returns a nodeback
     */
    defer.prototype.makeNodeResolver = function () {
        var self = this;
        return function (error, value) {
            if (error) {
                self.reject(error);
            }
            else if (arguments.length > 2) {
                self.resolve(array_slice(arguments, 1));
            }
            else {
                self.resolve(value);
            }
        };
    };
    /**
     * @param resolver {Function} a function that returns nothing and accepts
     * the resolve, reject, and notify functions for a deferred.
     * @returns a promise that may be resolved with the given resolve and reject
     * functions, or rejected by a thrown exception in resolver
     */
    Q.Promise = promise; // ES6
    Q.promise = promise;
    function promise(resolver) {
        if (typeof resolver !== "function") {
            throw new TypeError("resolver must be a function.");
        }
        var deferred = defer();
        try {
            resolver(deferred.resolve, deferred.reject, deferred.notify);
        }
        catch (reason) {
            deferred.reject(reason);
        }
        return deferred.promise;
    }
    promise.race = race; // ES6
    promise.all = all; // ES6
    promise.reject = reject; // ES6
    promise.resolve = Q; // ES6
    // XXX experimental.  This method is a way to denote that a local value is
    // serializable and should be immediately dispatched to a remote upon request,
    // instead of passing a reference.
    Q.passByCopy = function (object) {
        //freeze(object);
        //passByCopies.set(object, true);
        return object;
    };
    Promise.prototype.passByCopy = function () {
        //freeze(object);
        //passByCopies.set(object, true);
        return this;
    };
    /**
     * If two promises eventually fulfill to the same value, promises that value,
     * but otherwise rejects.
     * @param x {Any*}
     * @param y {Any*}
     * @returns {Any*} a promise for x and y if they are the same, but a rejection
     * otherwise.
     *
     */
    Q.join = function (x, y) {
        return Q(x).join(y);
    };
    Promise.prototype.join = function (that) {
        return Q([this, that]).spread(function (x, y) {
            if (x === y) {
                // TODO: "===" should be Object.is or equiv
                return x;
            }
            else {
                throw new Error("Q can't join: not the same: " + x + " " + y);
            }
        });
    };
    /**
     * Returns a promise for the first of an array of promises to become settled.
     * @param answers {Array[Any*]} promises to race
     * @returns {Any*} the first promise to be settled
     */
    Q.race = race;
    function race(answerPs) {
        return promise(function (resolve, reject) {
            // Switch to this once we can assume at least ES5
            // answerPs.forEach(function (answerP) {
            //     Q(answerP).then(resolve, reject);
            // });
            // Use this in the meantime
            for (var i = 0, len = answerPs.length; i < len; i++) {
                Q(answerPs[i]).then(resolve, reject);
            }
        });
    }
    Promise.prototype.race = function () {
        return this.then(Q.race);
    };
    /**
     * Constructs a Promise with a promise descriptor object and optional fallback
     * function.  The descriptor contains methods like when(rejected), get(name),
     * set(name, value), post(name, args), and delete(name), which all
     * return either a value, a promise for a value, or a rejection.  The fallback
     * accepts the operation name, a resolver, and any further arguments that would
     * have been forwarded to the appropriate method above had a method been
     * provided with the proper name.  The API makes no guarantees about the nature
     * of the returned object, apart from that it is usable whereever promises are
     * bought and sold.
     */
    Q.makePromise = Promise;
    function Promise(descriptor, fallback, inspect) {
        if (fallback === void 0) {
            fallback = function (op) {
                return reject(new Error("Promise does not support operation: " + op));
            };
        }
        if (inspect === void 0) {
            inspect = function () {
                return { state: "unknown" };
            };
        }
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, args) {
            var result;
            try {
                if (descriptor[op]) {
                    result = descriptor[op].apply(promise, args);
                }
                else {
                    result = fallback.call(promise, op, args);
                }
            }
            catch (exception) {
                result = reject(exception);
            }
            if (resolve) {
                resolve(result);
            }
        };
        promise.inspect = inspect;
        // XXX deprecated `valueOf` and `exception` support
        if (inspect) {
            var inspected = inspect();
            if (inspected.state === "rejected") {
                promise.exception = inspected.reason;
            }
            promise.valueOf = function () {
                var inspected = inspect();
                if (inspected.state === "pending" ||
                    inspected.state === "rejected") {
                    return promise;
                }
                return inspected.value;
            };
        }
        return promise;
    }
    Promise.prototype.toString = function () {
        return "[object Promise]";
    };
    Promise.prototype.then = function (fulfilled, rejected, progressed) {
        var self = this;
        var deferred = defer();
        var done = false; // ensure the untrusted promise makes at most a
        // single call to one of the callbacks
        function _fulfilled(value) {
            try {
                return typeof fulfilled === "function" ? fulfilled(value) : value;
            }
            catch (exception) {
                return reject(exception);
            }
        }
        function _rejected(exception) {
            if (typeof rejected === "function") {
                makeStackTraceLong(exception, self);
                try {
                    return rejected(exception);
                }
                catch (newException) {
                    return reject(newException);
                }
            }
            return reject(exception);
        }
        function _progressed(value) {
            return typeof progressed === "function" ? progressed(value) : value;
        }
        Q.nextTick(function () {
            self.promiseDispatch(function (value) {
                if (done) {
                    return;
                }
                done = true;
                deferred.resolve(_fulfilled(value));
            }, "when", [function (exception) {
                    if (done) {
                        return;
                    }
                    done = true;
                    deferred.resolve(_rejected(exception));
                }]);
        });
        // Progress propagator need to be attached in the current tick.
        self.promiseDispatch(void 0, "when", [void 0, function (value) {
                var newValue;
                var threw = false;
                try {
                    newValue = _progressed(value);
                }
                catch (e) {
                    threw = true;
                    if (Q.onerror) {
                        Q.onerror(e);
                    }
                    else {
                        throw e;
                    }
                }
                if (!threw) {
                    deferred.notify(newValue);
                }
            }]);
        return deferred.promise;
    };
    Q.tap = function (promise, callback) {
        return Q(promise).tap(callback);
    };
    /**
     * Works almost like "finally", but not called for rejections.
     * Original resolution value is passed through callback unaffected.
     * Callback may return a promise that will be awaited for.
     * @param {Function} callback
     * @returns {Q.Promise}
     * @example
     * doSomething()
     *   .then(...)
     *   .tap(console.log)
     *   .then(...);
     */
    Promise.prototype.tap = function (callback) {
        callback = Q(callback);
        return this.then(function (value) {
            return callback.fcall(value).thenResolve(value);
        });
    };
    /**
     * Registers an observer on a promise.
     *
     * Guarantees:
     *
     * 1. that fulfilled and rejected will be called only once.
     * 2. that either the fulfilled callback or the rejected callback will be
     *    called, but not both.
     * 3. that fulfilled and rejected will not be called in this turn.
     *
     * @param value      promise or immediate reference to observe
     * @param fulfilled  function to be called with the fulfilled value
     * @param rejected   function to be called with the rejection exception
     * @param progressed function to be called on any progress notifications
     * @return promise for the return value from the invoked callback
     */
    Q.when = when;
    function when(value, fulfilled, rejected, progressed) {
        return Q(value).then(fulfilled, rejected, progressed);
    }
    Promise.prototype.thenResolve = function (value) {
        return this.then(function () { return value; });
    };
    Q.thenResolve = function (promise, value) {
        return Q(promise).thenResolve(value);
    };
    Promise.prototype.thenReject = function (reason) {
        return this.then(function () { throw reason; });
    };
    Q.thenReject = function (promise, reason) {
        return Q(promise).thenReject(reason);
    };
    /**
     * If an object is not a promise, it is as "near" as possible.
     * If a promise is rejected, it is as "near" as possible too.
     * If it’s a fulfilled promise, the fulfillment value is nearer.
     * If it’s a deferred promise and the deferred has been resolved, the
     * resolution is "nearer".
     * @param object
     * @returns most resolved (nearest) form of the object
     */
    // XXX should we re-do this?
    Q.nearer = nearer;
    function nearer(value) {
        if (isPromise(value)) {
            var inspected = value.inspect();
            if (inspected.state === "fulfilled") {
                return inspected.value;
            }
        }
        return value;
    }
    /**
     * @returns whether the given object is a promise.
     * Otherwise it is a fulfilled value.
     */
    Q.isPromise = isPromise;
    function isPromise(object) {
        return object instanceof Promise;
    }
    Q.isPromiseAlike = isPromiseAlike;
    function isPromiseAlike(object) {
        return isObject(object) && typeof object.then === "function";
    }
    /**
     * @returns whether the given object is a pending promise, meaning not
     * fulfilled or rejected.
     */
    Q.isPending = isPending;
    function isPending(object) {
        return isPromise(object) && object.inspect().state === "pending";
    }
    Promise.prototype.isPending = function () {
        return this.inspect().state === "pending";
    };
    /**
     * @returns whether the given object is a value or fulfilled
     * promise.
     */
    Q.isFulfilled = isFulfilled;
    function isFulfilled(object) {
        return !isPromise(object) || object.inspect().state === "fulfilled";
    }
    Promise.prototype.isFulfilled = function () {
        return this.inspect().state === "fulfilled";
    };
    /**
     * @returns whether the given object is a rejected promise.
     */
    Q.isRejected = isRejected;
    function isRejected(object) {
        return isPromise(object) && object.inspect().state === "rejected";
    }
    Promise.prototype.isRejected = function () {
        return this.inspect().state === "rejected";
    };
    //// BEGIN UNHANDLED REJECTION TRACKING
    // This promise library consumes exceptions thrown in handlers so they can be
    // handled by a subsequent promise.  The exceptions get added to this array when
    // they are created, and removed when they are handled.  Note that in ES6 or
    // shimmed environments, this would naturally be a `Set`.
    var unhandledReasons = [];
    var unhandledRejections = [];
    var reportedUnhandledRejections = [];
    var trackUnhandledRejections = true;
    function resetUnhandledRejections() {
        unhandledReasons.length = 0;
        unhandledRejections.length = 0;
        if (!trackUnhandledRejections) {
            trackUnhandledRejections = true;
        }
    }
    function trackRejection(promise, reason) {
        if (!trackUnhandledRejections) {
            return;
        }
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                if (array_indexOf(unhandledRejections, promise) !== -1) {
                    process.emit("unhandledRejection", reason, promise);
                    reportedUnhandledRejections.push(promise);
                }
            });
        }
        unhandledRejections.push(promise);
        if (reason && typeof reason.stack !== "undefined") {
            unhandledReasons.push(reason.stack);
        }
        else {
            unhandledReasons.push("(no stack) " + reason);
        }
    }
    function untrackRejection(promise) {
        if (!trackUnhandledRejections) {
            return;
        }
        var at = array_indexOf(unhandledRejections, promise);
        if (at !== -1) {
            if (typeof process === "object" && typeof process.emit === "function") {
                Q.nextTick.runAfter(function () {
                    var atReport = array_indexOf(reportedUnhandledRejections, promise);
                    if (atReport !== -1) {
                        process.emit("rejectionHandled", unhandledReasons[at], promise);
                        reportedUnhandledRejections.splice(atReport, 1);
                    }
                });
            }
            unhandledRejections.splice(at, 1);
            unhandledReasons.splice(at, 1);
        }
    }
    Q.resetUnhandledRejections = resetUnhandledRejections;
    Q.getUnhandledReasons = function () {
        // Make a copy so that consumers can't interfere with our internal state.
        return unhandledReasons.slice();
    };
    Q.stopUnhandledRejectionTracking = function () {
        resetUnhandledRejections();
        trackUnhandledRejections = false;
    };
    resetUnhandledRejections();
    //// END UNHANDLED REJECTION TRACKING
    /**
     * Constructs a rejected promise.
     * @param reason value describing the failure
     */
    Q.reject = reject;
    function reject(reason) {
        var rejection = Promise({
            "when": function (rejected) {
                // note that the error has been handled
                if (rejected) {
                    untrackRejection(this);
                }
                return rejected ? rejected(reason) : this;
            }
        }, function fallback() {
            return this;
        }, function inspect() {
            return { state: "rejected", reason: reason };
        });
        // Note that the reason has not been handled.
        trackRejection(rejection, reason);
        return rejection;
    }
    /**
     * Constructs a fulfilled promise for an immediate reference.
     * @param value immediate reference
     */
    Q.fulfill = fulfill;
    function fulfill(value) {
        return Promise({
            "when": function () {
                return value;
            },
            "get": function (name) {
                return value[name];
            },
            "set": function (name, rhs) {
                value[name] = rhs;
            },
            "delete": function (name) {
                delete value[name];
            },
            "post": function (name, args) {
                // Mark Miller proposes that post with no name should apply a
                // promised function.
                if (name === null || name === void 0) {
                    return value.apply(void 0, args);
                }
                else {
                    return value[name].apply(value, args);
                }
            },
            "apply": function (thisp, args) {
                return value.apply(thisp, args);
            },
            "keys": function () {
                return object_keys(value);
            }
        }, void 0, function inspect() {
            return { state: "fulfilled", value: value };
        });
    }
    /**
     * Converts thenables to Q promises.
     * @param promise thenable promise
     * @returns a Q promise
     */
    function coerce(promise) {
        var deferred = defer();
        Q.nextTick(function () {
            try {
                promise.then(deferred.resolve, deferred.reject, deferred.notify);
            }
            catch (exception) {
                deferred.reject(exception);
            }
        });
        return deferred.promise;
    }
    /**
     * Annotates an object such that it will never be
     * transferred away from this process over any promise
     * communication channel.
     * @param object
     * @returns promise a wrapping of that object that
     * additionally responds to the "isDef" message
     * without a rejection.
     */
    Q.master = master;
    function master(object) {
        return Promise({
            "isDef": function () { }
        }, function fallback(op, args) {
            return dispatch(object, op, args);
        }, function () {
            return Q(object).inspect();
        });
    }
    /**
     * Spreads the values of a promised array of arguments into the
     * fulfillment callback.
     * @param fulfilled callback that receives variadic arguments from the
     * promised array
     * @param rejected callback that receives the exception if the promise
     * is rejected.
     * @returns a promise for the return value or thrown exception of
     * either callback.
     */
    Q.spread = spread;
    function spread(value, fulfilled, rejected) {
        return Q(value).spread(fulfilled, rejected);
    }
    Promise.prototype.spread = function (fulfilled, rejected) {
        return this.all().then(function (array) {
            return fulfilled.apply(void 0, array);
        }, rejected);
    };
    /**
     * The async function is a decorator for generator functions, turning
     * them into asynchronous generators.  Although generators are only part
     * of the newest ECMAScript 6 drafts, this code does not cause syntax
     * errors in older engines.  This code should continue to work and will
     * in fact improve over time as the language improves.
     *
     * ES6 generators are currently part of V8 version 3.19 with the
     * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
     * for longer, but under an older Python-inspired form.  This function
     * works on both kinds of generators.
     *
     * Decorates a generator function such that:
     *  - it may yield promises
     *  - execution will continue when that promise is fulfilled
     *  - the value of the yield expression will be the fulfilled value
     *  - it returns a promise for the return value (when the generator
     *    stops iterating)
     *  - the decorated function returns a promise for the return value
     *    of the generator or the first rejected promise among those
     *    yielded.
     *  - if an error is thrown in the generator, it propagates through
     *    every following yield until it is caught, or until it escapes
     *    the generator function altogether, and is translated into a
     *    rejection for the promise returned by the decorated generator.
     */
    Q.async = async;
    function async(makeGenerator) {
        return function () {
            // when verb is "send", arg is a value
            // when verb is "throw", arg is an exception
            function continuer(verb, arg) {
                var result;
                // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
                // engine that has a deployed base of browsers that support generators.
                // However, SM's generators use the Python-inspired semantics of
                // outdated ES6 drafts.  We would like to support ES6, but we'd also
                // like to make it possible to use generators in deployed browsers, so
                // we also support Python-style generators.  At some point we can remove
                // this block.
                if (typeof StopIteration === "undefined") {
                    // ES6 Generators
                    try {
                        result = generator[verb](arg);
                    }
                    catch (exception) {
                        return reject(exception);
                    }
                    if (result.done) {
                        return Q(result.value);
                    }
                    else {
                        return when(result.value, callback, errback);
                    }
                }
                else {
                    // SpiderMonkey Generators
                    // FIXME: Remove this case when SM does ES6 generators.
                    try {
                        result = generator[verb](arg);
                    }
                    catch (exception) {
                        if (isStopIteration(exception)) {
                            return Q(exception.value);
                        }
                        else {
                            return reject(exception);
                        }
                    }
                    return when(result, callback, errback);
                }
            }
            var generator = makeGenerator.apply(this, arguments);
            var callback = continuer.bind(continuer, "next");
            var errback = continuer.bind(continuer, "throw");
            return callback();
        };
    }
    /**
     * The spawn function is a small wrapper around async that immediately
     * calls the generator and also ends the promise chain, so that any
     * unhandled errors are thrown instead of forwarded to the error
     * handler. This is useful because it's extremely common to run
     * generators at the top-level to work with libraries.
     */
    Q.spawn = spawn;
    function spawn(makeGenerator) {
        Q.done(Q.async(makeGenerator)());
    }
    // FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
    /**
     * Throws a ReturnValue exception to stop an asynchronous generator.
     *
     * This interface is a stop-gap measure to support generator return
     * values in older Firefox/SpiderMonkey.  In browsers that support ES6
     * generators like Chromium 29, just use "return" in your generator
     * functions.
     *
     * @param value the return value for the surrounding generator
     * @throws ReturnValue exception with the value.
     * @example
     * // ES6 style
     * Q.async(function* () {
     *      var foo = yield getFooPromise();
     *      var bar = yield getBarPromise();
     *      return foo + bar;
     * })
     * // Older SpiderMonkey style
     * Q.async(function () {
     *      var foo = yield getFooPromise();
     *      var bar = yield getBarPromise();
     *      Q.return(foo + bar);
     * })
     */
    Q["return"] = _return;
    function _return(value) {
        throw new QReturnValue(value);
    }
    /**
     * The promised function decorator ensures that any promise arguments
     * are settled and passed as values (`this` is also settled and passed
     * as a value).  It will also ensure that the result of a function is
     * always a promise.
     *
     * @example
     * var add = Q.promised(function (a, b) {
     *     return a + b;
     * });
     * add(Q(a), Q(B));
     *
     * @param {function} callback The function to decorate
     * @returns {function} a function that has been decorated.
     */
    Q.promised = promised;
    function promised(callback) {
        return function () {
            return spread([this, all(arguments)], function (self, args) {
                return callback.apply(self, args);
            });
        };
    }
    /**
     * sends a message to a value in a future turn
     * @param object* the recipient
     * @param op the name of the message operation, e.g., "when",
     * @param args further arguments to be forwarded to the operation
     * @returns result {Promise} a promise for the result of the operation
     */
    Q.dispatch = dispatch;
    function dispatch(object, op, args) {
        return Q(object).dispatch(op, args);
    }
    Promise.prototype.dispatch = function (op, args) {
        var self = this;
        var deferred = defer();
        Q.nextTick(function () {
            self.promiseDispatch(deferred.resolve, op, args);
        });
        return deferred.promise;
    };
    /**
     * Gets the value of a property in a future turn.
     * @param object    promise or immediate reference for target object
     * @param name      name of property to get
     * @return promise for the property value
     */
    Q.get = function (object, key) {
        return Q(object).dispatch("get", [key]);
    };
    Promise.prototype.get = function (key) {
        return this.dispatch("get", [key]);
    };
    /**
     * Sets the value of a property in a future turn.
     * @param object    promise or immediate reference for object object
     * @param name      name of property to set
     * @param value     new value of property
     * @return promise for the return value
     */
    Q.set = function (object, key, value) {
        return Q(object).dispatch("set", [key, value]);
    };
    Promise.prototype.set = function (key, value) {
        return this.dispatch("set", [key, value]);
    };
    /**
     * Deletes a property in a future turn.
     * @param object    promise or immediate reference for target object
     * @param name      name of property to delete
     * @return promise for the return value
     */
    Q.del = // XXX legacy
        Q["delete"] = function (object, key) {
            return Q(object).dispatch("delete", [key]);
        };
    Promise.prototype.del = // XXX legacy
        Promise.prototype["delete"] = function (key) {
            return this.dispatch("delete", [key]);
        };
    /**
     * Invokes a method in a future turn.
     * @param object    promise or immediate reference for target object
     * @param name      name of method to invoke
     * @param value     a value to post, typically an array of
     *                  invocation arguments for promises that
     *                  are ultimately backed with `resolve` values,
     *                  as opposed to those backed with URLs
     *                  wherein the posted value can be any
     *                  JSON serializable object.
     * @return promise for the return value
     */
    // bound locally because it is used by other methods
    Q.mapply = // XXX As proposed by "Redsandro"
        Q.post = function (object, name, args) {
            return Q(object).dispatch("post", [name, args]);
        };
    Promise.prototype.mapply = // XXX As proposed by "Redsandro"
        Promise.prototype.post = function (name, args) {
            return this.dispatch("post", [name, args]);
        };
    /**
     * Invokes a method in a future turn.
     * @param object    promise or immediate reference for target object
     * @param name      name of method to invoke
     * @param ...args   array of invocation arguments
     * @return promise for the return value
     */
    Q.send = // XXX Mark Miller's proposed parlance
        Q.mcall = // XXX As proposed by "Redsandro"
            Q.invoke = function (object, name /*...args*/) {
                return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
            };
    Promise.prototype.send = // XXX Mark Miller's proposed parlance
        Promise.prototype.mcall = // XXX As proposed by "Redsandro"
            Promise.prototype.invoke = function (name /*...args*/) {
                return this.dispatch("post", [name, array_slice(arguments, 1)]);
            };
    /**
     * Applies the promised function in a future turn.
     * @param object    promise or immediate reference for target function
     * @param args      array of application arguments
     */
    Q.fapply = function (object, args) {
        return Q(object).dispatch("apply", [void 0, args]);
    };
    Promise.prototype.fapply = function (args) {
        return this.dispatch("apply", [void 0, args]);
    };
    /**
     * Calls the promised function in a future turn.
     * @param object    promise or immediate reference for target function
     * @param ...args   array of application arguments
     */
    Q["try"] =
        Q.fcall = function (object /* ...args*/) {
            return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
        };
    Promise.prototype.fcall = function ( /*...args*/) {
        return this.dispatch("apply", [void 0, array_slice(arguments)]);
    };
    /**
     * Binds the promised function, transforming return values into a fulfilled
     * promise and thrown errors into a rejected one.
     * @param object    promise or immediate reference for target function
     * @param ...args   array of application arguments
     */
    Q.fbind = function (object /*...args*/) {
        var promise = Q(object);
        var args = array_slice(arguments, 1);
        return function fbound() {
            return promise.dispatch("apply", [
                this,
                args.concat(array_slice(arguments))
            ]);
        };
    };
    Promise.prototype.fbind = function ( /*...args*/) {
        var promise = this;
        var args = array_slice(arguments);
        return function fbound() {
            return promise.dispatch("apply", [
                this,
                args.concat(array_slice(arguments))
            ]);
        };
    };
    /**
     * Requests the names of the owned properties of a promised
     * object in a future turn.
     * @param object    promise or immediate reference for target object
     * @return promise for the keys of the eventually settled object
     */
    Q.keys = function (object) {
        return Q(object).dispatch("keys", []);
    };
    Promise.prototype.keys = function () {
        return this.dispatch("keys", []);
    };
    /**
     * Turns an array of promises into a promise for an array.  If any of
     * the promises gets rejected, the whole array is rejected immediately.
     * @param {Array*} an array (or promise for an array) of values (or
     * promises for values)
     * @returns a promise for an array of the corresponding values
     */
    // By Mark Miller
    // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
    Q.all = all;
    function all(promises) {
        return when(promises, function (promises) {
            var pendingCount = 0;
            var deferred = defer();
            array_reduce(promises, function (undefined, promise, index) {
                var snapshot;
                if (isPromise(promise) &&
                    (snapshot = promise.inspect()).state === "fulfilled") {
                    promises[index] = snapshot.value;
                }
                else {
                    ++pendingCount;
                    when(promise, function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    }, deferred.reject, function (progress) {
                        deferred.notify({ index: index, value: progress });
                    });
                }
            }, void 0);
            if (pendingCount === 0) {
                deferred.resolve(promises);
            }
            return deferred.promise;
        });
    }
    Promise.prototype.all = function () {
        return all(this);
    };
    /**
     * Returns the first resolved promise of an array. Prior rejected promises are
     * ignored.  Rejects only if all promises are rejected.
     * @param {Array*} an array containing values or promises for values
     * @returns a promise fulfilled with the value of the first resolved promise,
     * or a rejected promise if all promises are rejected.
     */
    Q.any = any;
    function any(promises) {
        if (promises.length === 0) {
            return Q.resolve();
        }
        var deferred = Q.defer();
        var pendingCount = 0;
        array_reduce(promises, function (prev, current, index) {
            var promise = promises[index];
            pendingCount++;
            when(promise, onFulfilled, onRejected, onProgress);
            function onFulfilled(result) {
                deferred.resolve(result);
            }
            function onRejected(err) {
                pendingCount--;
                if (pendingCount === 0) {
                    var rejection = err || new Error("" + err);
                    rejection.message = ("Q can't get fulfillment value from any promise, all " +
                        "promises were rejected. Last error message: " + rejection.message);
                    deferred.reject(rejection);
                }
            }
            function onProgress(progress) {
                deferred.notify({
                    index: index,
                    value: progress
                });
            }
        }, undefined);
        return deferred.promise;
    }
    Promise.prototype.any = function () {
        return any(this);
    };
    /**
     * Waits for all promises to be settled, either fulfilled or
     * rejected.  This is distinct from `all` since that would stop
     * waiting at the first rejection.  The promise returned by
     * `allResolved` will never be rejected.
     * @param promises a promise for an array (or an array) of promises
     * (or values)
     * @return a promise for an array of promises
     */
    Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
    function allResolved(promises) {
        return when(promises, function (promises) {
            promises = array_map(promises, Q);
            return when(all(array_map(promises, function (promise) {
                return when(promise, noop, noop);
            })), function () {
                return promises;
            });
        });
    }
    Promise.prototype.allResolved = function () {
        return allResolved(this);
    };
    /**
     * @see Promise#allSettled
     */
    Q.allSettled = allSettled;
    function allSettled(promises) {
        return Q(promises).allSettled();
    }
    /**
     * Turns an array of promises into a promise for an array of their states (as
     * returned by `inspect`) when they have all settled.
     * @param {Array[Any*]} values an array (or promise for an array) of values (or
     * promises for values)
     * @returns {Array[State]} an array of states for the respective values.
     */
    Promise.prototype.allSettled = function () {
        return this.then(function (promises) {
            return all(array_map(promises, function (promise) {
                promise = Q(promise);
                function regardless() {
                    return promise.inspect();
                }
                return promise.then(regardless, regardless);
            }));
        });
    };
    /**
     * Captures the failure of a promise, giving an oportunity to recover
     * with a callback.  If the given promise is fulfilled, the returned
     * promise is fulfilled.
     * @param {Any*} promise for something
     * @param {Function} callback to fulfill the returned promise if the
     * given promise is rejected
     * @returns a promise for the return value of the callback
     */
    Q.fail = // XXX legacy
        Q["catch"] = function (object, rejected) {
            return Q(object).then(void 0, rejected);
        };
    Promise.prototype.fail = // XXX legacy
        Promise.prototype["catch"] = function (rejected) {
            return this.then(void 0, rejected);
        };
    /**
     * Attaches a listener that can respond to progress notifications from a
     * promise's originating deferred. This listener receives the exact arguments
     * passed to ``deferred.notify``.
     * @param {Any*} promise for something
     * @param {Function} callback to receive any progress notifications
     * @returns the given promise, unchanged
     */
    Q.progress = progress;
    function progress(object, progressed) {
        return Q(object).then(void 0, void 0, progressed);
    }
    Promise.prototype.progress = function (progressed) {
        return this.then(void 0, void 0, progressed);
    };
    /**
     * Provides an opportunity to observe the settling of a promise,
     * regardless of whether the promise is fulfilled or rejected.  Forwards
     * the resolution to the returned promise when the callback is done.
     * The callback can return a promise to defer completion.
     * @param {Any*} promise
     * @param {Function} callback to observe the resolution of the given
     * promise, takes no arguments.
     * @returns a promise for the resolution of the given promise when
     * ``fin`` is done.
     */
    Q.fin = // XXX legacy
        Q["finally"] = function (object, callback) {
            return Q(object)["finally"](callback);
        };
    Promise.prototype.fin = // XXX legacy
        Promise.prototype["finally"] = function (callback) {
            if (!callback || typeof callback.apply !== "function") {
                throw new Error("Q can't apply finally callback");
            }
            callback = Q(callback);
            return this.then(function (value) {
                return callback.fcall().then(function () {
                    return value;
                });
            }, function (reason) {
                // TODO attempt to recycle the rejection with "this".
                return callback.fcall().then(function () {
                    throw reason;
                });
            });
        };
    /**
     * Terminates a chain of promises, forcing rejections to be
     * thrown as exceptions.
     * @param {Any*} promise at the end of a chain of promises
     * @returns nothing
     */
    Q.done = function (object, fulfilled, rejected, progress) {
        return Q(object).done(fulfilled, rejected, progress);
    };
    Promise.prototype.done = function (fulfilled, rejected, progress) {
        var onUnhandledError = function (error) {
            // forward to a future turn so that ``when``
            // does not catch it and turn it into a rejection.
            Q.nextTick(function () {
                makeStackTraceLong(error, promise);
                if (Q.onerror) {
                    Q.onerror(error);
                }
                else {
                    throw error;
                }
            });
        };
        // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
        var promise = fulfilled || rejected || progress ?
            this.then(fulfilled, rejected, progress) :
            this;
        if (typeof process === "object" && process && process.domain) {
            onUnhandledError = process.domain.bind(onUnhandledError);
        }
        promise.then(void 0, onUnhandledError);
    };
    /**
     * Causes a promise to be rejected if it does not get fulfilled before
     * some milliseconds time out.
     * @param {Any*} promise
     * @param {Number} milliseconds timeout
     * @param {Any*} custom error message or Error object (optional)
     * @returns a promise for the resolution of the given promise if it is
     * fulfilled before the timeout, otherwise rejected.
     */
    Q.timeout = function (object, ms, error) {
        return Q(object).timeout(ms, error);
    };
    Promise.prototype.timeout = function (ms, error) {
        var deferred = defer();
        var timeoutId = setTimeout(function () {
            if (!error || "string" === typeof error) {
                error = new Error(error || "Timed out after " + ms + " ms");
                error.code = "ETIMEDOUT";
            }
            deferred.reject(error);
        }, ms);
        this.then(function (value) {
            clearTimeout(timeoutId);
            deferred.resolve(value);
        }, function (exception) {
            clearTimeout(timeoutId);
            deferred.reject(exception);
        }, deferred.notify);
        return deferred.promise;
    };
    /**
     * Returns a promise for the given value (or promised value), some
     * milliseconds after it resolved. Passes rejections immediately.
     * @param {Any*} promise
     * @param {Number} milliseconds
     * @returns a promise for the resolution of the given promise after milliseconds
     * time has elapsed since the resolution of the given promise.
     * If the given promise rejects, that is passed immediately.
     */
    Q.delay = function (object, timeout) {
        if (timeout === void 0) {
            timeout = object;
            object = void 0;
        }
        return Q(object).delay(timeout);
    };
    Promise.prototype.delay = function (timeout) {
        return this.then(function (value) {
            var deferred = defer();
            setTimeout(function () {
                deferred.resolve(value);
            }, timeout);
            return deferred.promise;
        });
    };
    /**
     * Passes a continuation to a Node function, which is called with the given
     * arguments provided as an array, and returns a promise.
     *
     *      Q.nfapply(FS.readFile, [__filename])
     *      .then(function (content) {
     *      })
     *
     */
    Q.nfapply = function (callback, args) {
        return Q(callback).nfapply(args);
    };
    Promise.prototype.nfapply = function (args) {
        var deferred = defer();
        var nodeArgs = array_slice(args);
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
    /**
     * Passes a continuation to a Node function, which is called with the given
     * arguments provided individually, and returns a promise.
     * @example
     * Q.nfcall(FS.readFile, __filename)
     * .then(function (content) {
     * })
     *
     */
    Q.nfcall = function (callback /*...args*/) {
        var args = array_slice(arguments, 1);
        return Q(callback).nfapply(args);
    };
    Promise.prototype.nfcall = function ( /*...args*/) {
        var nodeArgs = array_slice(arguments);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
    /**
     * Wraps a NodeJS continuation passing function and returns an equivalent
     * version that returns a promise.
     * @example
     * Q.nfbind(FS.readFile, __filename)("utf-8")
     * .then(console.log)
     * .done()
     */
    Q.nfbind =
        Q.denodeify = function (callback /*...args*/) {
            if (callback === undefined) {
                throw new Error("Q can't wrap an undefined function");
            }
            var baseArgs = array_slice(arguments, 1);
            return function () {
                var nodeArgs = baseArgs.concat(array_slice(arguments));
                var deferred = defer();
                nodeArgs.push(deferred.makeNodeResolver());
                Q(callback).fapply(nodeArgs).fail(deferred.reject);
                return deferred.promise;
            };
        };
    Promise.prototype.nfbind =
        Promise.prototype.denodeify = function ( /*...args*/) {
            var args = array_slice(arguments);
            args.unshift(this);
            return Q.denodeify.apply(void 0, args);
        };
    Q.nbind = function (callback, thisp /*...args*/) {
        var baseArgs = array_slice(arguments, 2);
        return function () {
            var nodeArgs = baseArgs.concat(array_slice(arguments));
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            function bound() {
                return callback.apply(thisp, arguments);
            }
            Q(bound).fapply(nodeArgs).fail(deferred.reject);
            return deferred.promise;
        };
    };
    Promise.prototype.nbind = function ( /*thisp, ...args*/) {
        var args = array_slice(arguments, 0);
        args.unshift(this);
        return Q.nbind.apply(void 0, args);
    };
    /**
     * Calls a method of a Node-style object that accepts a Node-style
     * callback with a given array of arguments, plus a provided callback.
     * @param object an object that has the named method
     * @param {String} name name of the method of object
     * @param {Array} args arguments to pass to the method; the callback
     * will be provided by Q and appended to these arguments.
     * @returns a promise for the value or error
     */
    Q.nmapply = // XXX As proposed by "Redsandro"
        Q.npost = function (object, name, args) {
            return Q(object).npost(name, args);
        };
    Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
        Promise.prototype.npost = function (name, args) {
            var nodeArgs = array_slice(args || []);
            var deferred = defer();
            nodeArgs.push(deferred.makeNodeResolver());
            this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
            return deferred.promise;
        };
    /**
     * Calls a method of a Node-style object that accepts a Node-style
     * callback, forwarding the given variadic arguments, plus a provided
     * callback argument.
     * @param object an object that has the named method
     * @param {String} name name of the method of object
     * @param ...args arguments to pass to the method; the callback will
     * be provided by Q and appended to these arguments.
     * @returns a promise for the value or error
     */
    Q.nsend = // XXX Based on Mark Miller's proposed "send"
        Q.nmcall = // XXX Based on "Redsandro's" proposal
            Q.ninvoke = function (object, name /*...args*/) {
                var nodeArgs = array_slice(arguments, 2);
                var deferred = defer();
                nodeArgs.push(deferred.makeNodeResolver());
                Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
                return deferred.promise;
            };
    Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
        Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
            Promise.prototype.ninvoke = function (name /*...args*/) {
                var nodeArgs = array_slice(arguments, 1);
                var deferred = defer();
                nodeArgs.push(deferred.makeNodeResolver());
                this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
                return deferred.promise;
            };
    /**
     * If a function would like to support both Node continuation-passing-style and
     * promise-returning-style, it can end its internal promise chain with
     * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
     * elects to use a nodeback, the result will be sent there.  If they do not
     * pass a nodeback, they will receive the result promise.
     * @param object a result (or a promise for a result)
     * @param {Function} nodeback a Node.js-style callback
     * @returns either the promise or nothing
     */
    Q.nodeify = nodeify;
    function nodeify(object, nodeback) {
        return Q(object).nodeify(nodeback);
    }
    Promise.prototype.nodeify = function (nodeback) {
        if (nodeback) {
            this.then(function (value) {
                Q.nextTick(function () {
                    nodeback(null, value);
                });
            }, function (error) {
                Q.nextTick(function () {
                    nodeback(error);
                });
            });
        }
        else {
            return this;
        }
    };
    Q.noConflict = function () {
        throw new Error("Q.noConflict only works when Q is used as a global");
    };
    // All code before this point will be filtered from stack traces.
    var qEndingLine = captureLine();
    return Q;
});
}).call(this,require('_process'),require("timers").setImmediate)

},{"_process":1,"timers":2}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzY3JpcHRzL0V4cG9ydHMudHMiLCJzY3JpcHRzL0dyaWQudHMiLCJzY3JpcHRzL0dyaWRNYW5hZ2VyLnRzIiwic2NyaXB0cy9Mb2NhdGlvbi50cyIsInNjcmlwdHMvTWFpbi50cyIsInNjcmlwdHMvTW92ZS50cyIsInNjcmlwdHMvT3JpZW50YXRpb24udHMiLCJzY3JpcHRzL1BpZWNlcy9MUGllY2UudHMiLCJzY3JpcHRzL1BpZWNlcy9QaWVjZS50cyIsInNjcmlwdHMvUGllY2VzL1NpbmdsZVBpZWNlLnRzIiwic2NyaXB0cy9Tb2x2ZXJzL0JGU1NvbHZlci50cyIsInNjcmlwdHMvU29sdmVycy9MU29sdmVyLnRzIiwic2NyaXB0cy9Tb2x2ZXJzL1NvbHZlci50cyIsInNjcmlwdHMvU29sdmVycy9TcGlyYWxTb2x2ZXIudHMiLCJzY3JpcHRzL1V0aWxzL0NvbG9yLnRzIiwidGhpcmRfcGFydHkvcS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RWhDLE9BQU8sQ0FBQyxDQUFDO0FBRVQsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwiZXhwb3J0IGxldCBROiBhbnkgPSB1bmRlZmluZWQ7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UShxOiBhbnkpIHtcclxuICBRID0gcTtcclxufVxyXG4iLCJpbXBvcnQgeyBTb2x2ZXIgfSBmcm9tIFwiLi9Tb2x2ZXJzL1NvbHZlclwiO1xyXG5pbXBvcnQgeyBNb3ZlIH0gZnJvbSBcIi4vTW92ZVwiO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL1V0aWxzL0NvbG9yXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZCB7XHJcbiAgcHVibGljIGdyaWQ6IENvbG9yW11bXTtcclxuICBwdWJsaWMgazogbnVtYmVyO1xyXG4gIHB1YmxpYyBzb2x2ZWQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlcikge1xyXG4gICAgdGhpcy5jb25zdHJ1Y3RHcmlkKGspOyAgXHJcbiAgICB0aGlzLnNvbHZlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5rID0gaztcclxuICB9XHJcblxyXG4gIHB1YmxpYyAqc29sdmUoc29sdmVyOiBTb2x2ZXIpIHtcclxuICAgIGxldCBtb3ZlOiBNb3ZlID0gdW5kZWZpbmVkO1xyXG4gICAgZG8ge1xyXG4gICAgICBtb3ZlID0gc29sdmVyLmdldE5leHRNb3ZlKCk7XHJcbiAgICAgIHlpZWxkIG1vdmU7XHJcbiAgICB9IHdoaWxlIChtb3ZlKTtcclxuICB9IFxyXG4gICBcclxuICBwcml2YXRlIGNvbnN0cnVjdEdyaWQoazogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmdyaWQgPSBbXTtcclxuICAgIGZvciAobGV0IHIgPSAwOyByIDwgKDEgPDwgayk7IHIrKykge1xyXG4gICAgICBsZXQgcm93ID0gW107XHJcbiAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgKDEgPDwgayk7IGMrKykge1xyXG4gICAgICAgIHJvdy5wdXNoKENvbG9yLldoaXRlKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmdyaWQucHVzaChyb3cpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL1V0aWxzL0NvbG9yXCI7XHJcbmltcG9ydCB7IEdyaWQgfSBmcm9tIFwiLi9HcmlkXCI7XHJcbmltcG9ydCB7IE1vdmUgfSBmcm9tIFwiLi9Nb3ZlXCI7XHJcbmltcG9ydCB7IFNvbHZlciB9IGZyb20gXCIuL1NvbHZlcnMvU29sdmVyXCI7XHJcbmltcG9ydCB7IFEgfSBmcm9tIFwiLi9FeHBvcnRzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZE1hbmFnZXIge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBwcml2YXRlIHJlYWRvbmx5IF9ncmlkOiBHcmlkO1xyXG5cclxuICBjb25zdHJ1Y3RvcihjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCwgazogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9jYW52YXNFbGVtZW50ID0gY2FudmFzRWxlbWVudDtcclxuICAgIHRoaXMuX2NvbnRleHQgPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB0aGlzLl9ncmlkID0gbmV3IEdyaWQoayk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgc29sdmUoc29sdmVyOiBTb2x2ZXIpIHtcclxuICAgIGxldCBkZWxheSA9IChtczogbnVtYmVyKSA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgbXMpKTtcclxuICAgIH0gXHJcbiAgICB0aGlzLmRyYXcoKTtcclxuICAgIHJldHVybiBRKCkudGhlbiggYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBzb2x2ZWQ6IEl0ZXJhdG9yPE1vdmU+ID0gdGhpcy5ncmlkLnNvbHZlKHNvbHZlcik7XHJcbiAgICAgIGNvbnN0IGN5Y2xlOiBJdGVyYXRvcjxDb2xvcj4gPSBDb2xvci5jeWNsZSh0aGlzLmdyaWQuayk7XHJcbiAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IG1vdmU6IE1vdmUgPSBzb2x2ZWQubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgICAgZm9yIChsZXQgY29vcmQgb2YgbW92ZS5waWVjZS5nZXRSZWxhdGl2ZUluZGljZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdyaWQuZ3JpZFttb3ZlLmxvY2F0aW9uLnJvdyArIGNvb3JkLnJvd11bbW92ZS5sb2NhdGlvbi5jb2wgKyBjb29yZC5jb2xdID0gY3ljbGUubmV4dCgpLnZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kcmF3KG1vdmUpO1xyXG4gICAgICAgICAgYXdhaXQgZGVsYXkoMSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2V4aXRlZCBsb29wJywgZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFEoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkcmF3KG1vdmU/OiBNb3ZlKSB7XHJcbiAgICBsZXQgd2lkdGg6IG51bWJlciA9IHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCAvICgxIDw8IHRoaXMuZ3JpZC5rKTtcclxuICAgIGxldCBoZWlnaHQ6IG51bWJlciA9IHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgLyAoMSA8PCB0aGlzLmdyaWQuayk7XHJcbiAgICBpZiAobW92ZSkge1xyXG4gICAgICBmb3IgKGxldCBpZHggb2YgbW92ZS5waWVjZS5nZXRSZWxhdGl2ZUluZGljZXMoKSkge1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IG1vdmUubG9jYXRpb24ucm93ICsgaWR4LnJvdztcclxuICAgICAgICBjb25zdCBjb2wgPSBtb3ZlLmxvY2F0aW9uLmNvbCArIGlkeC5jb2w7XHJcbiAgICAgICAgdGhpcy5kcmF3UGllY2Uod2lkdGgsIGhlaWdodCwgcm93LCBjb2wpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKGxldCByb3c6IG51bWJlciA9IDA7IHJvdyA8ICgxIDw8IHRoaXMuZ3JpZC5rKTsgcm93KyspIHtcclxuICAgICAgICBmb3IgKGxldCBjb2w6IG51bWJlciA9IDA7IGNvbCA8ICgxIDw8IHRoaXMuZ3JpZC5rKTsgY29sKyspIHtcclxuICAgICAgICAgIHRoaXMuZHJhd1BpZWNlKHdpZHRoLCBoZWlnaHQsIHJvdywgY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZHJhd1BpZWNlKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcclxuICAgIGxldCB4OiBudW1iZXIgPSBjb2wgKiB3aWR0aDtcclxuICAgIGxldCB5OiBudW1iZXIgPSByb3cgKiBoZWlnaHQ7XHJcbiAgICBsZXQgY29sb3I6IENvbG9yID0gdGhpcy5ncmlkLmdyaWRbcm93XVtjb2xdOyBcclxuICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgIHRoaXMuY29udGV4dC5yZWN0KHgsIHksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yLmhleFN0cmluZztcclxuICAgIHRoaXMuY29udGV4dC5maWxsKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgY2FudmFzRWxlbWVudCgpOiBIVE1MQ2FudmFzRWxlbWVudCB7IHJldHVybiB0aGlzLl9jYW52YXNFbGVtZW50OyB9XHJcbiAgZ2V0IGNvbnRleHQoKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHsgcmV0dXJuIHRoaXMuX2NvbnRleHQ7IH1cclxuICBnZXQgZ3JpZCgpOiBHcmlkIHsgcmV0dXJuIHRoaXMuX2dyaWQ7IH1cclxufVxyXG4iLCJleHBvcnQgY2xhc3MgTG9jYXRpb24ge1xyXG4gIHB1YmxpYyByb3c6IG51bWJlcjtcclxuICBwdWJsaWMgY29sOiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgdGhpcy5yb3cgPSByb3c7XHJcbiAgICB0aGlzLmNvbCA9IGNvbDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgR3JpZE1hbmFnZXIgfSBmcm9tIFwiLi9HcmlkTWFuYWdlclwiO1xyXG5pbXBvcnQgeyBOYWl2ZVNvbHZlciB9IGZyb20gXCIuL1NvbHZlcnMvTmFpdmVTb2x2ZXJcIjtcclxuaW1wb3J0IHsgQkZTU29sdmVyIH0gZnJvbSBcIi4vU29sdmVycy9CRlNTb2x2ZXJcIjtcclxuaW1wb3J0IHsgTFNvbHZlciB9IGZyb20gXCIuL1NvbHZlcnMvTFNvbHZlclwiO1xyXG5pbXBvcnQgeyBTcGlyYWxTb2x2ZXIgfSBmcm9tIFwiLi9Tb2x2ZXJzL1NwaXJhbFNvbHZlclwiO1xyXG5pbXBvcnQgKiBhcyBQcm8gZnJvbSBcIi4uL3RoaXJkX3BhcnR5L3EuanNcIjtcclxuaW1wb3J0ICogYXMgRXggZnJvbSBcIi4vRXhwb3J0c1wiO1xyXG5cclxuLy8gbWFrZSBRKCkgZ2xvYmFsXHJcbkV4LnNldFEoUHJvKTtcclxuXHJcbmNvbnN0IEsgPSA4O1xyXG5jb25zdCBiZnNTb2x2ZXIgPSBuZXcgQkZTU29sdmVyKEspO1xyXG5jb25zdCBzcGlyYWxTb2x2ZXIgPSBuZXcgU3BpcmFsU29sdmVyKEspO1xyXG5jb25zdCBsU29sdmVyID0gbmV3IExTb2x2ZXIoSyk7XHJcbmxldCBpZHggPSAwO1xyXG5mb3IgKGxldCBzb2x2ZXIgb2YgW2Jmc1NvbHZlciwgc3BpcmFsU29sdmVyLCBsU29sdmVyXSkge1xyXG4gIGNvbnN0IGM6IEhUTUxDYW52YXNFbGVtZW50ID0gPEhUTUxDYW52YXNFbGVtZW50PiB3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGNhbnZhcy0ke2lkeCsrfWApO1xyXG4gIGNvbnN0IGdyaWRNYW5hZ2VyID0gbmV3IEdyaWRNYW5hZ2VyKGMsIEspO1xyXG4gIGdyaWRNYW5hZ2VyLnNvbHZlKHNvbHZlcikudGhlbigoKSA9PiB7IGNvbnNvbGUubG9nKCdkb25lIScpOyB9KTtcclxufVxyXG4iLCJpbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gXCIuL0xvY2F0aW9uXCI7XHJcbmltcG9ydCB7IFBpZWNlIH0gZnJvbSBcIi4vUGllY2VzL1BpZWNlXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTW92ZSB7XHJcbiAgcHVibGljIHBpZWNlOiBQaWVjZTtcclxuICBwdWJsaWMgbG9jYXRpb246IExvY2F0aW9uO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwaWVjZTogUGllY2UsIGxvY2F0aW9uOiBMb2NhdGlvbikge1xyXG4gICAgdGhpcy5waWVjZSA9IHBpZWNlO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gIH1cclxufVxyXG4iLCJleHBvcnQgZW51bSBPcmllbnRhdGlvbiB7XHJcbiAgVXAsXHJcbiAgRG93bixcclxuICBMZWZ0LFxyXG4gIFJpZ2h0LFxyXG59XHJcbiIsImltcG9ydCB7IFBpZWNlIH0gZnJvbSBcIi4vUGllY2VcIjtcclxuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tIFwiLi4vTG9jYXRpb25cIjtcclxuaW1wb3J0IHsgT3JpZW50YXRpb24gfSBmcm9tIFwiLi4vT3JpZW50YXRpb25cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBMUGllY2UgZXh0ZW5kcyBQaWVjZSB7XHJcbiAgcHVibGljIGdldFJlbGF0aXZlSW5kaWNlcygpOiBMb2NhdGlvbltdIHtcclxuICAgIHN3aXRjaCAoK3RoaXMub3JpZW50YXRpb24pIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqICAjXHJcbiAgICAgICAqICMjXHJcbiAgICAgICAqL1xyXG4gICAgICBjYXNlIE9yaWVudGF0aW9uLlVwOlxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oMCwgMCksXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oLTEsIDApLFxyXG4gICAgICAgICAgbmV3IExvY2F0aW9uKDAsIC0xKSxcclxuICAgICAgICBdO1xyXG4gICAgICAvKipcclxuICAgICAgICogIyNcclxuICAgICAgICogI1xyXG4gICAgICAgKi9cclxuICAgICAgY2FzZSBPcmllbnRhdGlvbi5Eb3duOlxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oMCwgMCksXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oKzEsIDApLFxyXG4gICAgICAgICAgbmV3IExvY2F0aW9uKDAsICsxKSxcclxuICAgICAgICBdO1xyXG4gICAgICAvKipcclxuICAgICAgICogIyNcclxuICAgICAgICogICNcclxuICAgICAgICovXHJcbiAgICAgIGNhc2UgT3JpZW50YXRpb24uTGVmdDpcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgbmV3IExvY2F0aW9uKDAsIDApLFxyXG4gICAgICAgICAgbmV3IExvY2F0aW9uKDAsIC0xKSxcclxuICAgICAgICAgIG5ldyBMb2NhdGlvbigrMSwgMCksXHJcbiAgICAgICAgXTtcclxuICAgICAgLyoqXHJcbiAgICAgICAqICNcclxuICAgICAgICogIyNcclxuICAgICAgICovXHJcbiAgICAgIGNhc2UgT3JpZW50YXRpb24uUmlnaHQ6XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgIG5ldyBMb2NhdGlvbigwLCAwKSxcclxuICAgICAgICAgIG5ldyBMb2NhdGlvbigwLCArMSksXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oLTEsIDApLFxyXG4gICAgICAgIF07XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgT3JpZW50YXRpb24gJyR7b3JpZW50YXRpb259JyBub3Qga25vd24uYCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihvcmllbnRhdGlvbj86IE9yaWVudGF0aW9uKSB7XHJcbiAgICBzdXBlcihvcmllbnRhdGlvbik7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IExvY2F0aW9uIH0gZnJvbSBcIi4uL0xvY2F0aW9uXCI7XHJcbmltcG9ydCB7IE9yaWVudGF0aW9uIH0gZnJvbSBcIi4uL09yaWVudGF0aW9uXCI7XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGllY2Uge1xyXG4gIHB1YmxpYyBvcmllbnRhdGlvbjogT3JpZW50YXRpb247XHJcbiAgcHVibGljIGFic3RyYWN0IGdldFJlbGF0aXZlSW5kaWNlcyhvcmllbnRhdGlvbj86IE9yaWVudGF0aW9uKTogTG9jYXRpb25bXTtcclxuICBjb25zdHJ1Y3RvcihvcmllbnRhdGlvbj86IE9yaWVudGF0aW9uKSB7XHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IFBpZWNlIH0gZnJvbSBcIi4vUGllY2VcIjtcclxuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tIFwiLi4vTG9jYXRpb25cIjtcclxuaW1wb3J0IHsgT3JpZW50YXRpb24gfSBmcm9tIFwiLi4vT3JpZW50YXRpb25cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTaW5nbGVQaWVjZSBleHRlbmRzIFBpZWNlIHtcclxuICBwdWJsaWMgZ2V0UmVsYXRpdmVJbmRpY2VzKCk6IExvY2F0aW9uW10ge1xyXG4gICAgcmV0dXJuIFtuZXcgTG9jYXRpb24oMCwgMCldO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3Iob3JpZW50YXRpb24/OiBPcmllbnRhdGlvbikge1xyXG4gICAgc3VwZXIob3JpZW50YXRpb24pO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBNb3ZlIH0gZnJvbSBcIi4uL01vdmVcIjtcclxuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tIFwiLi4vTG9jYXRpb25cIjtcclxuaW1wb3J0IHsgU29sdmVyIH0gZnJvbSBcIi4vU29sdmVyXCI7XHJcbmltcG9ydCB7IFNpbmdsZVBpZWNlIH0gZnJvbSBcIi4uL1BpZWNlcy9TaW5nbGVQaWVjZVwiO1xyXG5pbXBvcnQgeyBMUGllY2UgfSBmcm9tIFwiLi4vUGllY2VzL0xQaWVjZVwiO1xyXG5pbXBvcnQgeyBPcmllbnRhdGlvbiB9IGZyb20gXCIuLi9PcmllbnRhdGlvblwiO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBCRlNTb2x2ZXIgZXh0ZW5kcyBTb2x2ZXIge1xyXG4gIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uO1xyXG4gIHByaXZhdGUgZ3JpZDogYm9vbGVhbltdW107XHJcbiAgcHJpdmF0ZSBxdWV1ZTogTW92ZVtdO1xyXG5cclxuICBwdWJsaWMgcmVzZXQoazogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBzdXBlci5yZXNldChrKTtcclxuICAgIHRoaXMucmVzZXRHcmlkKGspXHJcbiAgICB0aGlzLnF1ZXVlID0gW25ldyBNb3ZlKG5ldyBTaW5nbGVQaWVjZSgpLCBuZXcgTG9jYXRpb24oMCwgMCkpXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRHcmlkKGs6IG51bWJlcikge1xyXG4gICAgdGhpcy5ncmlkID0gW107XHJcbiAgICBmb3IgKGxldCByID0gMDsgciA8ICgxIDw8IGspOyByKyspIHtcclxuICAgICAgbGV0IHJvdzogYm9vbGVhbltdID0gW107XHJcbiAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgKDEgPDwgayk7IGMrKykge1xyXG4gICAgICAgIHJvdy5wdXNoKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmdyaWQucHVzaChyb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldE5leHRNb3ZlKCk6IE1vdmUge1xyXG4gICAgd2hpbGUgKHRoaXMucXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCB0b3BNb3ZlOiBNb3ZlID0gdGhpcy5xdWV1ZVswXTtcclxuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpO1xyXG4gICAgICBpZiAodGhpcy5maXRzKHRvcE1vdmUpKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbG9jIG9mIHRvcE1vdmUucGllY2UuZ2V0UmVsYXRpdmVJbmRpY2VzKCkpIHtcclxuICAgICAgICAgIHRoaXMuZ3JpZFt0b3BNb3ZlLmxvY2F0aW9uLnJvdyArIGxvYy5yb3ddW3RvcE1vdmUubG9jYXRpb24uY29sICsgbG9jLmNvbF0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgIHRoaXMucXVldWUucHVzaChcclxuICAgICAgICAgICAgbmV3IE1vdmUoXHJcbiAgICAgICAgICAgICAgbmV3IExQaWVjZShPcmllbnRhdGlvbi5VcCksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKHRvcE1vdmUubG9jYXRpb24ucm93ICsgbG9jLnJvdyArIDEsIHRvcE1vdmUubG9jYXRpb24uY29sICsgbG9jLmNvbCArIDEpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLnF1ZXVlLnB1c2goXHJcbiAgICAgICAgICAgIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uRG93biksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKHRvcE1vdmUubG9jYXRpb24ucm93ICsgbG9jLnJvdyAtIDEsIHRvcE1vdmUubG9jYXRpb24uY29sICsgbG9jLmNvbCAtIDEpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLnF1ZXVlLnB1c2goXHJcbiAgICAgICAgICAgIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uTGVmdCksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKHRvcE1vdmUubG9jYXRpb24ucm93ICsgbG9jLnJvdyAtIDEsIHRvcE1vdmUubG9jYXRpb24uY29sICsgbG9jLmNvbCArIDEpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLnF1ZXVlLnB1c2goXHJcbiAgICAgICAgICAgIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uUmlnaHQpLFxyXG4gICAgICAgICAgICAgIG5ldyBMb2NhdGlvbih0b3BNb3ZlLmxvY2F0aW9uLnJvdyArIGxvYy5yb3cgKyAxLCB0b3BNb3ZlLmxvY2F0aW9uLmNvbCArIGxvYy5jb2wgLSAxKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9wTW92ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaXRzKG1vdmU6IE1vdmUpOiBib29sZWFuIHtcclxuICAgIGNvbnNvbGUubG9nKG1vdmUpO1xyXG4gICAgY29uc3QgbW92ZUxvY2F0aW9uOiBMb2NhdGlvbiA9IG1vdmUubG9jYXRpb247XHJcbiAgICBmb3IgKGxldCByZWxhdGl2ZUluZGV4IG9mIG1vdmUucGllY2UuZ2V0UmVsYXRpdmVJbmRpY2VzKCkpIHtcclxuICAgICAgY29uc3Qgcm93UGxhY2VtZW50ID0gbW92ZUxvY2F0aW9uLnJvdyArIHJlbGF0aXZlSW5kZXgucm93O1xyXG4gICAgICBjb25zdCBjb2xQbGFjZW1lbnQgPSBtb3ZlTG9jYXRpb24uY29sICsgcmVsYXRpdmVJbmRleC5jb2w7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoISgoMCA8PSByb3dQbGFjZW1lbnQgJiYgcm93UGxhY2VtZW50IDwgdGhpcy5ncmlkLmxlbmd0aCkgJiZcclxuICAgICAgICAgICAoMCA8PSBjb2xQbGFjZW1lbnQgJiYgY29sUGxhY2VtZW50IDwgdGhpcy5ncmlkWzBdLmxlbmd0aCkpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JpZFtyb3dQbGFjZW1lbnRdW2NvbFBsYWNlbWVudF0pIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoazogbnVtYmVyKSB7XHJcbiAgICBzdXBlcihrKTtcclxuICAgIHRoaXMucmVzZXQoayk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE1vdmUgfSBmcm9tIFwiLi4vTW92ZVwiO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gXCIuLi9Mb2NhdGlvblwiO1xyXG5pbXBvcnQgeyBTb2x2ZXIgfSBmcm9tIFwiLi9Tb2x2ZXJcIjtcclxuaW1wb3J0IHsgU2luZ2xlUGllY2UgfSBmcm9tIFwiLi4vUGllY2VzL1NpbmdsZVBpZWNlXCI7XHJcbmltcG9ydCB7IExQaWVjZSB9IGZyb20gXCIuLi9QaWVjZXMvTFBpZWNlXCI7XHJcbmltcG9ydCB7IE9yaWVudGF0aW9uIH0gZnJvbSBcIi4uL09yaWVudGF0aW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTFNvbHZlciBleHRlbmRzIFNvbHZlciB7XHJcbiAgcHJpdmF0ZSBtb3ZlczogSXRlcmF0b3I8TW92ZT47XHJcblxyXG4gIHB1YmxpYyByZXNldChrOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHN1cGVyLnJlc2V0KGspO1xyXG4gICAgdGhpcy5tb3ZlcyA9IHRoaXMuZ2V0TW92ZXMoayk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TmV4dE1vdmUoKTogTW92ZSB7XHJcbiAgICBjb25zdCBtb3ZlOiBNb3ZlID0gdGhpcy5tb3Zlcy5uZXh0KCkudmFsdWU7XHJcbiAgICByZXR1cm4gbW92ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHF1YWRyYW50c1xyXG4gICAqIDAgMVxyXG4gICAqIDMgMlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcm90YXRlKG1vdmU6IE1vdmUsIHF1YWRyYW50OiBudW1iZXIsIGs6IG51bWJlcik6IE1vdmUge1xyXG4gICAgbGV0IG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiA9IG1vdmUucGllY2Uub3JpZW50YXRpb247XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IChxdWFkcmFudCAlIDQpICYmIHF1YWRyYW50ICUgMiA9PT0gMTsgaSsrKSB7XHJcbiAgICAgIHN3aXRjaCAoK29yaWVudGF0aW9uKSB7XHJcbiAgICAgICAgY2FzZSBPcmllbnRhdGlvbi5VcDpcclxuICAgICAgICAgIG9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uTGVmdDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgT3JpZW50YXRpb24uUmlnaHQ6XHJcbiAgICAgICAgICBvcmllbnRhdGlvbiA9IE9yaWVudGF0aW9uLlVwO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBPcmllbnRhdGlvbi5Eb3duOlxyXG4gICAgICAgICAgb3JpZW50YXRpb24gPSBPcmllbnRhdGlvbi5SaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgT3JpZW50YXRpb24uTGVmdDpcclxuICAgICAgICAgIG9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uRG93bjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCByb3RhdGVkUGllY2U6IExQaWVjZSA9IG5ldyBMUGllY2Uob3JpZW50YXRpb24pO1xyXG5cclxuICAgIGxldCByb3cgPSAwO1xyXG4gICAgbGV0IGNvbCA9IDA7XHJcbiAgICBzd2l0Y2ggKHF1YWRyYW50ICUgNCkge1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBjb2wgPSAoMSA8PCAoayAtIDEpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHJvdyA9ICgxIDw8IChrIC0gMSkpO1xyXG4gICAgICAgIGNvbCA9ICgxIDw8IChrIC0gMSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgcm93ID0gKDEgPDwgKGsgLSAxKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBsZXQgcnJvdyA9IG1vdmUubG9jYXRpb24ucm93O1xyXG4gICAgbGV0IHJjb2wgPSBtb3ZlLmxvY2F0aW9uLmNvbDtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IChxdWFkcmFudCAlIDQpICYmIHF1YWRyYW50ICUgMiA9PT0gMTsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG9sZFJSb3cgPSBycm93O1xyXG4gICAgICBycm93ID0gKDEgPDwgKGsgLSAxKSkgLSByY29sIC0gMTtcclxuICAgICAgcmNvbCA9IG9sZFJSb3c7XHJcbiAgICB9XHJcbiAgICBjb25zdCByb3RhdGVkTG9jYXRpb246IExvY2F0aW9uID0gbmV3IExvY2F0aW9uKFxyXG4gICAgICByb3cgKyBycm93LCBcclxuICAgICAgY29sICsgcmNvbCBcclxuICAgICk7XHJcbiAgICBjb25zdCByb3RhdGVkTW92ZTogTW92ZSA9IG5ldyBNb3ZlKHJvdGF0ZWRQaWVjZSwgcm90YXRlZExvY2F0aW9uKTtcclxuICAgIHJldHVybiByb3RhdGVkTW92ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgKmdldE1vdmVzKGs6IG51bWJlcik6IEl0ZXJhdG9yPE1vdmU+IHtcclxuICAgIGlmIChrID09PSAwKSB7XHJcbiAgICAgIHlpZWxkIG5ldyBNb3ZlKG5ldyBTaW5nbGVQaWVjZSgpLCBuZXcgTG9jYXRpb24oMCwgMCkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgdG9wTGVmdDogSXRlcmF0b3I8TW92ZT4gPSB0aGlzLmdldE1vdmVzKGsgLSAxKTtcclxuICAgICAgbGV0IG1vdmVzOiBNb3ZlW10gPSBbXTtcclxuXHJcbiAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dE1vdmU6IE1vdmUgPSB0b3BMZWZ0Lm5leHQoKS52YWx1ZTtcclxuICAgICAgICBpZiAoIW5leHRNb3ZlKSB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgbW92ZXMucHVzaChuZXh0TW92ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAobGV0IG1vdmUgb2YgbW92ZXMpIHtcclxuICAgICAgICBpZiAobW92ZS5waWVjZSBpbnN0YW5jZW9mIFNpbmdsZVBpZWNlKSB7XHJcbiAgICAgICAgICB5aWVsZCBtb3ZlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobW92ZS5waWVjZSBpbnN0YW5jZW9mIExQaWVjZSkge1xyXG4gICAgICAgICAgeWllbGQgdGhpcy5yb3RhdGUobW92ZSwgMCwgayk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB5aWVsZCBuZXcgTW92ZShcclxuICAgICAgICBuZXcgTFBpZWNlKE9yaWVudGF0aW9uLlVwKSwgXHJcbiAgICAgICAgbmV3IExvY2F0aW9uKDEgPDwgKGsgLSAxKSwgMSA8PCAoayAtIDEpKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgZm9yIChsZXQgcXVhZHJhbnQgb2YgWzEsIDIsIDNdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgbW92ZSBvZiBtb3Zlcykge1xyXG4gICAgICAgICAgaWYgKG1vdmUucGllY2UgaW5zdGFuY2VvZiBMUGllY2UpIHtcclxuICAgICAgICAgICAgeWllbGQgdGhpcy5yb3RhdGUobW92ZSwgcXVhZHJhbnQsIGspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbiIsImltcG9ydCB7IE1vdmUgfSBmcm9tIFwiLi4vTW92ZVwiO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNvbHZlciB7XHJcbiAgcHJvdGVjdGVkIGs6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHJlc2V0KGs6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5rID0gaztcclxuICB9XHJcbiAgXHJcbiAgcHVibGljIGFic3RyYWN0IGdldE5leHRNb3ZlKCk6IE1vdmU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlcikge1xyXG4gICAgdGhpcy5yZXNldChrKTtcclxuICB9IFxyXG59XHJcbiIsImltcG9ydCB7IE1vdmUgfSBmcm9tIFwiLi4vTW92ZVwiO1xyXG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gXCIuLi9Mb2NhdGlvblwiO1xyXG5pbXBvcnQgeyBTb2x2ZXIgfSBmcm9tIFwiLi9Tb2x2ZXJcIjtcclxuaW1wb3J0IHsgU2luZ2xlUGllY2UgfSBmcm9tIFwiLi4vUGllY2VzL1NpbmdsZVBpZWNlXCI7XHJcbmltcG9ydCB7IExQaWVjZSB9IGZyb20gXCIuLi9QaWVjZXMvTFBpZWNlXCI7XHJcbmltcG9ydCB7IE9yaWVudGF0aW9uIH0gZnJvbSBcIi4uL09yaWVudGF0aW9uXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgU3BpcmFsU29sdmVyIGV4dGVuZHMgU29sdmVyIHtcclxuICBwcml2YXRlIG1vdmVzOiBJdGVyYXRvcjxNb3ZlPjtcclxuXHJcbiAgcHVibGljIHJlc2V0KGs6IG51bWJlcik6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoayk7XHJcbiAgICB0aGlzLm1vdmVzID0gdGhpcy5nZXRNb3ZlcyhrKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXROZXh0TW92ZSgpOiBNb3ZlIHtcclxuICAgIGNvbnN0IG1vdmU6IE1vdmUgPSB0aGlzLm1vdmVzLm5leHQoKS52YWx1ZTtcclxuICAgIGNvbnNvbGUubG9nKG1vdmUpO1xyXG4gICAgcmV0dXJuIG1vdmU7XHJcbiAgfVxyXG4gIFxyXG4gIHByaXZhdGUgKmdldE1vdmVzKGs6IG51bWJlcik6IEl0ZXJhdG9yPE1vdmU+IHtcclxuICAgIGlmIChrID09PSAwKSB7XHJcbiAgICAgIHlpZWxkIG5ldyBNb3ZlKG5ldyBTaW5nbGVQaWVjZSgpLCBuZXcgTG9jYXRpb24oMCwgMCkpO1xyXG4gICAgfSBlbHNlIGlmIChrID09PSAxKSB7XHJcbiAgICAgIHlpZWxkIG5ldyBNb3ZlKG5ldyBTaW5nbGVQaWVjZSgpLCBuZXcgTG9jYXRpb24oMCwgMCkpO1xyXG4gICAgICB5aWVsZCBuZXcgTW92ZShuZXcgTFBpZWNlKE9yaWVudGF0aW9uLlVwKSwgbmV3IExvY2F0aW9uKDEsIDEpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGlubmVyRnJhbWU6IEl0ZXJhdG9yPE1vdmU+ID0gdGhpcy5nZXRNb3ZlcyhrIC0gMSk7XHJcbiAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dE1vdmU6IE1vdmUgPSBpbm5lckZyYW1lLm5leHQoKS52YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZyhuZXh0TW92ZSk7XHJcbiAgICAgICAgaWYgKCFuZXh0TW92ZSkge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHlpZWxkIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgbmV4dE1vdmUucGllY2UsXHJcbiAgICAgICAgICBuZXcgTG9jYXRpb24oXHJcbiAgICAgICAgICAgICgxIDw8IChrIC0gMikpICsgbmV4dE1vdmUubG9jYXRpb24ucm93LFxyXG4gICAgICAgICAgICAoMSA8PCAoayAtIDIpKSArIG5leHRNb3ZlLmxvY2F0aW9uLmNvbFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmIChrID09PSAyKSB7XHJcbiAgICAgICAgeWllbGQgbmV3IE1vdmUobmV3IExQaWVjZShPcmllbnRhdGlvbi5Eb3duKSwgbmV3IExvY2F0aW9uKDAsIDApKTtcclxuICAgICAgICB5aWVsZCBuZXcgTW92ZShuZXcgTFBpZWNlKE9yaWVudGF0aW9uLkxlZnQpLCBuZXcgTG9jYXRpb24oMCwgMykpO1xyXG4gICAgICAgIHlpZWxkIG5ldyBNb3ZlKG5ldyBMUGllY2UoT3JpZW50YXRpb24uVXApLCBuZXcgTG9jYXRpb24oMywgMykpO1xyXG4gICAgICAgIHlpZWxkIG5ldyBNb3ZlKG5ldyBMUGllY2UoT3JpZW50YXRpb24uUmlnaHQpLCBuZXcgTG9jYXRpb24oMywgMCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGJ1aWxkIG91dGVyIGZyYW1lXHJcbiAgICAgICAgZm9yIChsZXQgbGF5ZXIgPSAoMSA8PCAoayAtIDIpKSAtIDI7IGxheWVyID49IDA7IGxheWVyIC09IDIpIHtcclxuICAgICAgICAgIC8vIHRvcFxyXG4gICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgKDEgPDwgKGsgLSAyKSk7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHlpZWxkIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uUmlnaHQpLFxyXG4gICAgICAgICAgICAgIG5ldyBMb2NhdGlvbihsYXllciArIDEsIDMgKiBjb2wpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHlpZWxkIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uTGVmdCksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKGxheWVyLCAzICogY29sICsgMilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgKDEgPDwgKGsgLSAyKSk7IHJvdysrKSB7XHJcbiAgICAgICAgICAgIHlpZWxkIG5ldyBNb3ZlKFxyXG4gICAgICAgICAgICAgIG5ldyBMUGllY2UoT3JpZW50YXRpb24uRG93biksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKDMgKiByb3csICgxIDw8IGspIC0gbGF5ZXIgLSAyKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB5aWVsZCBuZXcgTW92ZShcclxuICAgICAgICAgICAgICBuZXcgTFBpZWNlKE9yaWVudGF0aW9uLlVwKSxcclxuICAgICAgICAgICAgICBuZXcgTG9jYXRpb24oMyAqIHJvdyArIDIsICgxIDw8IGspIC0gbGF5ZXIgLSAxKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGJvdHRvbVxyXG4gICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgMSA8PCAoayAtIDIpOyBjb2wrKykge1xyXG4gICAgICAgICAgICB5aWVsZCBuZXcgTW92ZShcclxuICAgICAgICAgICAgICBuZXcgTFBpZWNlKE9yaWVudGF0aW9uLkxlZnQpLFxyXG4gICAgICAgICAgICAgIG5ldyBMb2NhdGlvbigoMSA8PCBrKSAtIGxheWVyIC0gMiwgKDEgPDwgaykgLSAzICogY29sIC0gMSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgeWllbGQgbmV3IE1vdmUoXHJcbiAgICAgICAgICAgICAgbmV3IExQaWVjZShPcmllbnRhdGlvbi5SaWdodCksXHJcbiAgICAgICAgICAgICAgbmV3IExvY2F0aW9uKCgxIDw8IGspIC0gbGF5ZXIgLSAxLCAoMSA8PCBrKSAtIDMgKiBjb2wgLSAzKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8ICgxIDw8IChrIC0gMikpOyByb3crKykge1xyXG4gICAgICAgICAgICB5aWVsZCBuZXcgTW92ZShcclxuICAgICAgICAgICAgICBuZXcgTFBpZWNlKE9yaWVudGF0aW9uLlVwKSxcclxuICAgICAgICAgICAgICBuZXcgTG9jYXRpb24oKDEgPDwgaykgLSAzICogcm93IC0gMSwgbGF5ZXIgKyAxKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB5aWVsZCBuZXcgTW92ZShcclxuICAgICAgICAgICAgICBuZXcgTFBpZWNlKE9yaWVudGF0aW9uLkRvd24pLFxyXG4gICAgICAgICAgICAgIG5ldyBMb2NhdGlvbigoMSA8PCBrKSAtIDMgKiByb3cgLSAzLCBsYXllcilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBDb2xvciB7XHJcbiAgcHJpdmF0ZSBfcjogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2c6IG51bWJlcjtcclxuICBwcml2YXRlIF9iOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfYTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX2hleFN0cmluZzogc3RyaW5nO1xyXG4gIHByaXZhdGUgX3JnYmFTdHJpbmc6IHN0cmluZztcclxuXHJcbiAgcHJpdmF0ZSBzdGF0aWMgX3JlZDogQ29sb3IgPSBuZXcgQ29sb3IoMHhmNCwgMHgzNiwgMHg0Myk7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX29yYW5nZTogQ29sb3IgPSBuZXcgQ29sb3IoMHhmZiwgMHgwMCwgMHg5OCk7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX3llbGxvdzogQ29sb3IgPSBuZXcgQ29sb3IoMHhmZiwgMHgzYiwgMHhlYik7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX2dyZWVuOiBDb2xvciA9IG5ldyBDb2xvcigweDRjLCAweDUwLCAweGFmKTtcclxuICBwcml2YXRlIHN0YXRpYyBfYmx1ZTogQ29sb3IgPSBuZXcgQ29sb3IoMHgyMSwgMHhmMywgMHg5Nik7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX2luZGlnbzogQ29sb3IgPSBuZXcgQ29sb3IoMHgzZiwgMHhiNSwgMHg1MSk7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX3Zpb2xldDogQ29sb3IgPSBuZXcgQ29sb3IoMHg5YywgMHhiMCwgMHgyNyk7XHJcbiAgcHJpdmF0ZSBzdGF0aWMgX3doaXRlOiBDb2xvciA9IG5ldyBDb2xvcigweGZmLCAweGZmLCAweGZmKTtcclxuICBwcml2YXRlIHN0YXRpYyBfYmxhY2s6IENvbG9yID0gbmV3IENvbG9yKDB4MDAsIDB4MDAsIDB4MDApO1xyXG5cclxuICBzdGF0aWMgZ2V0IFJlZCgpOiBDb2xvciB7IHJldHVybiBDb2xvci5fcmVkOyB9XHJcbiAgc3RhdGljIGdldCBPcmFuZ2UoKTogQ29sb3IgeyByZXR1cm4gQ29sb3IuX29yYW5nZTsgfVxyXG4gIHN0YXRpYyBnZXQgWWVsbG93KCk6IENvbG9yIHsgcmV0dXJuIENvbG9yLl95ZWxsb3c7IH1cclxuICBzdGF0aWMgZ2V0IEdyZWVuKCk6IENvbG9yIHsgcmV0dXJuIENvbG9yLl9ncmVlbjsgfVxyXG4gIHN0YXRpYyBnZXQgQmx1ZSgpOiBDb2xvciB7IHJldHVybiBDb2xvci5fYmx1ZTsgfVxyXG4gIHN0YXRpYyBnZXQgSW5kaWdvKCk6IENvbG9yIHsgcmV0dXJuIENvbG9yLl9pbmRpZ287IH1cclxuICBzdGF0aWMgZ2V0IFZpb2xldCgpOiBDb2xvciB7IHJldHVybiBDb2xvci5fdmlvbGV0OyB9XHJcbiAgc3RhdGljIGdldCBXaGl0ZSgpOiBDb2xvciB7IHJldHVybiBDb2xvci5fd2hpdGU7IH1cclxuICBzdGF0aWMgZ2V0IEJsYWNrKCk6IENvbG9yIHsgcmV0dXJuIENvbG9yLl9ibGFjazsgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyLCBhOiBudW1iZXIgPSAweGZmKSB7XHJcbiAgICBbciwgZywgYiwgYV0uZm9yRWFjaChjb2xvciA9PiBcclxuICAgICAgY29uc29sZS5hc3NlcnQoXHJcbiAgICAgICAgMCA8PSBjb2xvciAmJiBjb2xvciA8PSAweGZmLFxyXG4gICAgICAgICdIdWVzIG11c3QgYmUgaW4gdGhlIGludGVydmFsIFswLCAyNTVdLicgKyBbciwgZywgYiwgYV1cclxuICAgICAgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuX3IgPSByO1xyXG4gICAgdGhpcy5fZyA9IGc7XHJcbiAgICB0aGlzLl9iID0gYjtcclxuICAgIHRoaXMuX2EgPSBhO1xyXG5cclxuICAgIHRoaXMuX2hleFN0cmluZyA9ICcjJyArIFxyXG4gICAgICBbdGhpcy5fciwgdGhpcy5fYiwgdGhpcy5fZ11cclxuICAgICAgICAubWFwKChjKSA9PiB0aGlzLnBhZChjLnRvU3RyaW5nKDE2KSkpXHJcbiAgICAgICAgLmpvaW4oJycpO1xyXG4gICAgXHJcbiAgICB0aGlzLl9yZ2JhU3RyaW5nID0gJ3JnYmEoJyArIFt0aGlzLl9yLCB0aGlzLl9nLCB0aGlzLl9iLCB0aGlzLl9hXS5qb2luKCkgKyAnKSc7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljICpyYWluYm93KGs6IG51bWJlcikge1xyXG4gICAgY29uc29sZS5hc3NlcnQoMCA8PSAyICogayAmJiAyICogayA8PSAyNCk7XHJcbiAgICBjb25zdCBudW1Db2xvcnMgPSAxIDw8ICgyICogayk7XHJcbiAgICBjb25zb2xlLmxvZyhrLCBudW1Db2xvcnMpO1xyXG4gICAgY29uc3QgeCA9IDEgPDwgKDI0IC0gMiAqIGspO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2xvcnM7IGkrKykge1xyXG4gICAgICBjb25zdCBjb2xvck51bSA9IGkgKiB4O1xyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcigoY29sb3JOdW0gPj4gMHgxMCkgJiAweGZmLCAoY29sb3JOdW0gPj4gMHg4KSAmIDB4ZmYsIGNvbG9yTnVtICYgMHhmZik7XHJcbiAgICAgIGNvbnNvbGUubG9nKGksIHgsIGNvbG9yTnVtKTtcclxuICAgICAgY29uc29sZS5sb2coY29sb3IpO1xyXG4gICAgICB5aWVsZCBjb2xvcjtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCdmaW5zaGVkIGNvbG9yaW5nJyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljICpjeWNsZShrOiBudW1iZXIpIHtcclxuICAgIGNvbnNvbGUuYXNzZXJ0KDAgPD0gMiAqIGsgJiYgMiAqIGsgPD0gMjQpO1xyXG4gICAgY29uc3QgbnVtQ29sb3JzID0gMSA8PCAoMiAqIGspO1xyXG4gICAgXHJcbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBudW1Db2xvcnM7IGlkeCsrICkge1xyXG4gICAgICB5aWVsZCBuZXcgQ29sb3IoTWF0aC5mbG9vcigweGZmICogKGlkeCAvIG51bUNvbG9ycykpLCAwLCAwLCAxKTtcclxuICAgIH1cclxuXHJcbi8vICAgIGxldCBpZHggPSAwO1xyXG4vLyAgICBmb3IgKGxldCBiID0gMDsgYiA8IDB4ZmYgJiYgaWR4IDwgbnVtQ29sb3JzOyBiKyspIHtcclxuLy8gICAgICBmb3IgKGxldCBnID0gMDsgZyA8IDB4ZmYgJiYgaWR4IDwgbnVtQ29sb3JzOyBnKyspIHtcclxuLy8gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgMHhmZiAmJiBpZHggPCBudW1Db2xvcnM7IHIrKykge1xyXG4vLyAgICAgICAgICBmb3IgKGxldCBhID0gMDsgYSA8IDB4ZmYgJiYgaWR4IDwgbnVtQ29sb3JzOyBhKyspIHtcclxuLy8gICAgICAgICAgICB5aWVsZCBuZXcgQ29sb3IociwgZywgYiwgYSk7XHJcbi8vICAgICAgICAgIH1cclxuLy8gICAgICAgIH1cclxuLy8gICAgICB9XHJcbi8vICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgaGV4U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5faGV4U3RyaW5nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCByZ2JhU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmdiYVN0cmluZztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGFkKG51bTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBudW0ubGVuZ3RoID09PSAyID8gbnVtIDogJzAnICsgbnVtO1xyXG4gIH1cclxufVxyXG4iLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxyXG4vKiFcclxuICpcclxuICogQ29weXJpZ2h0IDIwMDktMjAxNyBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXHJcbiAqIGxpY2Vuc2UgZm91bmQgYXQgaHR0cHM6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9xL2Jsb2IvdjEvTElDRU5TRVxyXG4gKlxyXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXHJcbiAqIENvcHlyaWdodCAyMDA3LTIwMDkgVHlsZXIgQ2xvc2UgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgWCBsaWNlbnNlIGZvdW5kXHJcbiAqIGF0IGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UuaHRtbFxyXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxyXG4gKlxyXG4gKiBXaXRoIHBhcnRzIGJ5IE1hcmsgTWlsbGVyXHJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKlxyXG4gKi9cclxuXHJcbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgLy8gVGhpcyBmaWxlIHdpbGwgZnVuY3Rpb24gcHJvcGVybHkgYXMgYSA8c2NyaXB0PiB0YWcsIG9yIGEgbW9kdWxlXHJcbiAgICAvLyB1c2luZyBDb21tb25KUyBhbmQgTm9kZUpTIG9yIFJlcXVpcmVKUyBtb2R1bGUgZm9ybWF0cy4gIEluXHJcbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cclxuICAgIC8vIGV4ZWN1dGVkIGFzIGEgc2ltcGxlIDxzY3JpcHQ+LCBpdCBjcmVhdGVzIGEgUSBnbG9iYWwgaW5zdGVhZC5cclxuXHJcbiAgICAvLyBNb250YWdlIFJlcXVpcmVcclxuICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICBib290c3RyYXAoXCJwcm9taXNlXCIsIGRlZmluaXRpb24pO1xyXG5cclxuICAgIC8vIENvbW1vbkpTXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcclxuXHJcbiAgICAvLyBSZXF1aXJlSlNcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XHJcblxyXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIGlmICghc2VzLm9rKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlcy5tYWtlUSA9IGRlZmluaXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgIC8vIDxzY3JpcHQ+XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAvLyBQcmVmZXIgd2luZG93IG92ZXIgc2VsZiBmb3IgYWRkLW9uIHNjcmlwdHMuIFVzZSBzZWxmIGZvclxyXG4gICAgICAgIC8vIG5vbi13aW5kb3dlZCBjb250ZXh0cy5cclxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgYHdpbmRvd2Agb2JqZWN0LCBzYXZlIHRoZSBwcmV2aW91cyBRIGdsb2JhbFxyXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXHJcbiAgICAgICAgdmFyIHByZXZpb3VzUSA9IGdsb2JhbC5RO1xyXG4gICAgICAgIGdsb2JhbC5RID0gZGVmaW5pdGlvbigpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYSBub0NvbmZsaWN0IGZ1bmN0aW9uIHNvIFEgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGVcclxuICAgICAgICAvLyBnbG9iYWwgbmFtZXNwYWNlLlxyXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGdsb2JhbC5RID0gcHJldmlvdXNRO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcclxuICAgIH1cclxuXHJcbn0pKGZ1bmN0aW9uICgpIHtcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XHJcbnRyeSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxufSBjYXRjaCAoZSkge1xyXG4gICAgaGFzU3RhY2tzID0gISFlLnN0YWNrO1xyXG59XHJcblxyXG4vLyBBbGwgY29kZSBhZnRlciB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMgcmVwb3J0ZWRcclxuLy8gYnkgUS5cclxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xyXG52YXIgcUZpbGVOYW1lO1xyXG5cclxuLy8gc2hpbXNcclxuXHJcbi8vIHVzZWQgZm9yIGZhbGxiYWNrIGluIFwiYWxsUmVzb2x2ZWRcIlxyXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xyXG5cclxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cclxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXHJcbnZhciBuZXh0VGljayA9KGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxyXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcclxuICAgIHZhciB0YWlsID0gaGVhZDtcclxuICAgIHZhciBmbHVzaGluZyA9IGZhbHNlO1xyXG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xyXG4gICAgdmFyIGlzTm9kZUpTID0gZmFsc2U7XHJcbiAgICAvLyBxdWV1ZSBmb3IgbGF0ZSB0YXNrcywgdXNlZCBieSB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nXHJcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xyXG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xyXG4gICAgICAgIHZhciB0YXNrLCBkb21haW47XHJcblxyXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcclxuICAgICAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcclxuICAgICAgICAgICAgdGFzayA9IGhlYWQudGFzaztcclxuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xyXG4gICAgICAgICAgICBkb21haW4gPSBoZWFkLmRvbWFpbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcclxuICAgICAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcnVuU2luZ2xlKHRhc2ssIGRvbWFpbik7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAobGF0ZXJRdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGFzayA9IGxhdGVyUXVldWUucG9wKCk7XHJcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmx1c2hpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIHJ1bnMgYSBzaW5nbGUgZnVuY3Rpb24gaW4gdGhlIGFzeW5jIHF1ZXVlXHJcbiAgICBmdW5jdGlvbiBydW5TaW5nbGUodGFzaywgZG9tYWluKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGFzaygpO1xyXG5cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xyXG4gICAgICAgICAgICAgICAgLy8gSW4gbm9kZSwgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgY29uc2lkZXJlZCBmYXRhbCBlcnJvcnMuXHJcbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBjb250aW51YXRpb24gaWYgdGhlIHVuY2F1Z2h0IGV4Y2VwdGlvbiBpcyBzdXBwcmVzc2VkXHJcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cclxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXHJcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IGU7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cclxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gYXN5bmNocm9ub3VzbHkgdG8gYXZvaWQgc2xvdy1kb3ducy5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRvbWFpbikge1xyXG4gICAgICAgICAgICBkb21haW4uZXhpdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZXh0VGljayA9IGZ1bmN0aW9uICh0YXNrKSB7XHJcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcclxuICAgICAgICAgICAgdGFzazogdGFzayxcclxuICAgICAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcclxuICAgICAgICAgICAgbmV4dDogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcclxuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgcHJvY2Vzcy50b1N0cmluZygpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XHJcbiAgICAgICAgLy8gRW5zdXJlIFEgaXMgaW4gYSByZWFsIE5vZGUgZW52aXJvbm1lbnQsIHdpdGggYSBgcHJvY2Vzcy5uZXh0VGlja2AuXHJcbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcclxuICAgICAgICAvLyAqIE1vY2hhIHRlc3QgcnVubmVyIC0gZXhwb3NlcyBhIGBwcm9jZXNzYCBnbG9iYWwgd2l0aG91dCBhIGBuZXh0VGlja2BcclxuICAgICAgICAvLyAqIEJyb3dzZXJpZnkgLSBleHBvc2VzIGEgYHByb2Nlc3MubmV4VGlja2AgZnVuY3Rpb24gdGhhdCB1c2VzXHJcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxyXG4gICAgICAgIC8vICAgIGl0IGlzIGZhc3Rlci4gQnJvd3NlcmlmeSdzIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkc1xyXG4gICAgICAgIC8vICAgXCJbb2JqZWN0IE9iamVjdF1cIiwgd2hpbGUgaW4gYSByZWFsIE5vZGUgZW52aXJvbm1lbnRcclxuICAgICAgICAvLyAgIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cclxuICAgICAgICBpc05vZGVKUyA9IHRydWU7XHJcblxyXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZsdXNoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcclxuICAgICAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxyXG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XHJcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxyXG4gICAgICAgIC8vIHdvcmtpbmcgbWVzc2FnZSBwb3J0cyB0aGUgZmlyc3QgdGltZSBhIHBhZ2UgbG9hZHMuXHJcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xyXG4gICAgICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xyXG4gICAgICAgICAgICBmbHVzaCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHJlcXVlc3RQb3J0VGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gT3BlcmEgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhIG1lc3NhZ2UgcGF5bG9hZCwgcmVnYXJkbGVzcyBvZlxyXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cclxuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcclxuICAgICAgICAgICAgcmVxdWVzdFBvcnRUaWNrKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xyXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy8gcnVucyBhIHRhc2sgYWZ0ZXIgYWxsIG90aGVyIHRhc2tzIGhhdmUgYmVlbiBydW5cclxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXHJcbiAgICAvLyBhZnRlciBhbGwgYHRoZW5gZCB0YXNrcyBoYXZlIGJlZW4gcnVuLlxyXG4gICAgbmV4dFRpY2sucnVuQWZ0ZXIgPSBmdW5jdGlvbiAodGFzaykge1xyXG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcclxuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XHJcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG5leHRUaWNrO1xyXG59KSgpO1xyXG5cclxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxyXG4vLyBtb2RpZmljYXRpb25zLlxyXG4vLyBUaGVyZSBpcyBubyBzaXR1YXRpb24gd2hlcmUgdGhpcyBpcyBuZWNlc3NhcnkuXHJcbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXHJcbi8vIGRlZXBseSBmcm96ZW4gYW55d2F5LCBhbmQgaWYgeW91IGRvbuKAmXQgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSxcclxuLy8gdGhpcyBpcyBqdXN0IHBsYWluIHBhcmFub2lkLlxyXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXHJcbi8vIHRoZSBtaW5pZmllZCBjb2RlIGJ5IHJlZHVjaW5nIHguY2FsbCgpIHRvIG1lcmVseSB4KClcclxuLy8gU2VlIE1hcmsgTWlsbGVy4oCZcyBleHBsYW5hdGlvbiBvZiB3aGF0IHRoaXMgZG9lcy5cclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXHJcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcclxuZnVuY3Rpb24gdW5jdXJyeVRoaXMoZikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufVxyXG4vLyBUaGlzIGlzIGVxdWl2YWxlbnQsIGJ1dCBzbG93ZXI6XHJcbi8vIHVuY3VycnlUaGlzID0gRnVuY3Rpb25fYmluZC5iaW5kKEZ1bmN0aW9uX2JpbmQuY2FsbCk7XHJcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXHJcblxyXG52YXIgYXJyYXlfc2xpY2UgPSB1bmN1cnJ5VGhpcyhBcnJheS5wcm90b3R5cGUuc2xpY2UpO1xyXG5cclxudmFyIGFycmF5X3JlZHVjZSA9IHVuY3VycnlUaGlzKFxyXG4gICAgQXJyYXkucHJvdG90eXBlLnJlZHVjZSB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIGJhc2lzKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcclxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgLy8gY29uY2VybmluZyB0aGUgaW5pdGlhbCB2YWx1ZSwgaWYgb25lIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBhcnJheSwgYWNjb3VudGluZ1xyXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgaXMgaXMgYSBzcGFyc2UgYXJyYXlcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBiYXNpcyA9IHRoaXNbaW5kZXgrK107XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKytpbmRleCA+PSBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZWR1Y2VcclxuICAgICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxyXG4gICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgYmFzaXMgPSBjYWxsYmFjayhiYXNpcywgdGhpc1tpbmRleF0sIGluZGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzaXM7XHJcbiAgICB9XHJcbik7XHJcblxyXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxyXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgLy8gbm90IGEgdmVyeSBnb29kIHNoaW0sIGJ1dCBnb29kIGVub3VnaCBmb3Igb3VyIG9uZSB1c2Ugb2YgaXRcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbik7XHJcblxyXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXHJcbiAgICBBcnJheS5wcm90b3R5cGUubWFwIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3ApIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcclxuICAgICAgICBhcnJheV9yZWR1Y2Uoc2VsZiwgZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGNvbGxlY3QucHVzaChjYWxsYmFjay5jYWxsKHRoaXNwLCB2YWx1ZSwgaW5kZXgsIHNlbGYpKTtcclxuICAgICAgICB9LCB2b2lkIDApO1xyXG4gICAgICAgIHJldHVybiBjb2xsZWN0O1xyXG4gICAgfVxyXG4pO1xyXG5cclxudmFyIG9iamVjdF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcclxuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cclxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xyXG4gICAgcmV0dXJuIG5ldyBUeXBlKCk7XHJcbn07XHJcblxyXG52YXIgb2JqZWN0X2RlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5IHx8IGZ1bmN0aW9uIChvYmosIHByb3AsIGRlc2NyaXB0b3IpIHtcclxuICAgIG9ialtwcm9wXSA9IGRlc2NyaXB0b3IudmFsdWU7XHJcbiAgICByZXR1cm4gb2JqO1xyXG59O1xyXG5cclxudmFyIG9iamVjdF9oYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xyXG5cclxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgdmFyIGtleXMgPSBbXTtcclxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcclxuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xyXG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4ga2V5cztcclxufTtcclxuXHJcbnZhciBvYmplY3RfdG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgPT09IE9iamVjdCh2YWx1ZSk7XHJcbn1cclxuXHJcbi8vIGdlbmVyYXRvciByZWxhdGVkIHNoaW1zXHJcblxyXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxyXG5mdW5jdGlvbiBpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxyXG4gICAgICAgIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIFFSZXR1cm5WYWx1ZVxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGhlbHBlciBhbmQgUS5yZXR1cm4gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW5cclxuLy8gU3BpZGVyTW9ua2V5LlxyXG52YXIgUVJldHVyblZhbHVlO1xyXG5pZiAodHlwZW9mIFJldHVyblZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcclxufSBlbHNlIHtcclxuICAgIFFSZXR1cm5WYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIGxvbmcgc3RhY2sgdHJhY2VzXHJcblxyXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XHJcblxyXG5mdW5jdGlvbiBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpIHtcclxuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcclxuICAgIC8vIGNydWZ0LCB0aGVuIGNvbmNhdGVuYXRpbmcgd2l0aCB0aGUgc3RhY2sgdHJhY2Ugb2YgYHByb21pc2VgLiBTZWUgIzU3LlxyXG4gICAgaWYgKGhhc1N0YWNrcyAmJlxyXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcclxuICAgICAgICB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICBlcnJvciAhPT0gbnVsbCAmJlxyXG4gICAgICAgIGVycm9yLnN0YWNrXHJcbiAgICApIHtcclxuICAgICAgICB2YXIgc3RhY2tzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChwLnN0YWNrICYmICghZXJyb3IuX19taW5pbXVtU3RhY2tDb3VudGVyX18gfHwgZXJyb3IuX19taW5pbXVtU3RhY2tDb3VudGVyX18gPiBwLnN0YWNrQ291bnRlcikpIHtcclxuICAgICAgICAgICAgICAgIG9iamVjdF9kZWZpbmVQcm9wZXJ0eShlcnJvciwgXCJfX21pbmltdW1TdGFja0NvdW50ZXJfX1wiLCB7dmFsdWU6IHAuc3RhY2tDb3VudGVyLCBjb25maWd1cmFibGU6IHRydWV9KTtcclxuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcclxuXHJcbiAgICAgICAgdmFyIGNvbmNhdGVkU3RhY2tzID0gc3RhY2tzLmpvaW4oXCJcXG5cIiArIFNUQUNLX0pVTVBfU0VQQVJBVE9SICsgXCJcXG5cIik7XHJcbiAgICAgICAgdmFyIHN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xyXG4gICAgICAgIG9iamVjdF9kZWZpbmVQcm9wZXJ0eShlcnJvciwgXCJzdGFja1wiLCB7dmFsdWU6IHN0YWNrLCBjb25maWd1cmFibGU6IHRydWV9KTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmlsdGVyU3RhY2tTdHJpbmcoc3RhY2tTdHJpbmcpIHtcclxuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgdmFyIGRlc2lyZWRMaW5lcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XHJcblxyXG4gICAgICAgIGlmICghaXNJbnRlcm5hbEZyYW1lKGxpbmUpICYmICFpc05vZGVGcmFtZShsaW5lKSAmJiBsaW5lKSB7XHJcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XHJcbiAgICByZXR1cm4gc3RhY2tMaW5lLmluZGV4T2YoXCIobW9kdWxlLmpzOlwiKSAhPT0gLTEgfHxcclxuICAgICAgICAgICBzdGFja0xpbmUuaW5kZXhPZihcIihub2RlLmpzOlwiKSAhPT0gLTE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpIHtcclxuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXHJcbiAgICAvLyBJbiBJRTEwIGZ1bmN0aW9uIG5hbWUgY2FuIGhhdmUgc3BhY2VzIChcIkFub255bW91cyBmdW5jdGlvblwiKSBPX29cclxuICAgIHZhciBhdHRlbXB0MSA9IC9hdCAuKyBcXCgoLispOihcXGQrKTooPzpcXGQrKVxcKSQvLmV4ZWMoc3RhY2tMaW5lKTtcclxuICAgIGlmIChhdHRlbXB0MSkge1xyXG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDFbMV0sIE51bWJlcihhdHRlbXB0MVsyXSldO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFub255bW91cyBmdW5jdGlvbnM6IFwiYXQgZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXJcIlxyXG4gICAgdmFyIGF0dGVtcHQyID0gL2F0IChbXiBdKyk6KFxcZCspOig/OlxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xyXG4gICAgaWYgKGF0dGVtcHQyKSB7XHJcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MlsxXSwgTnVtYmVyKGF0dGVtcHQyWzJdKV07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmlyZWZveCBzdHlsZTogXCJmdW5jdGlvbkBmaWxlbmFtZTpsaW5lTnVtYmVyIG9yIEBmaWxlbmFtZTpsaW5lTnVtYmVyXCJcclxuICAgIHZhciBhdHRlbXB0MyA9IC8uKkAoLispOihcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcclxuICAgIGlmIChhdHRlbXB0Mykge1xyXG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDNbMV0sIE51bWJlcihhdHRlbXB0M1syXSldO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0ludGVybmFsRnJhbWUoc3RhY2tMaW5lKSB7XHJcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XHJcblxyXG4gICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xyXG4gICAgdmFyIGxpbmVOdW1iZXIgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XHJcblxyXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcclxuICAgICAgICBsaW5lTnVtYmVyID49IHFTdGFydGluZ0xpbmUgJiZcclxuICAgICAgICBsaW5lTnVtYmVyIDw9IHFFbmRpbmdMaW5lO1xyXG59XHJcblxyXG4vLyBkaXNjb3ZlciBvd24gZmlsZSBuYW1lIGFuZCBsaW5lIG51bWJlciByYW5nZSBmb3IgZmlsdGVyaW5nIHN0YWNrXHJcbi8vIHRyYWNlc1xyXG5mdW5jdGlvbiBjYXB0dXJlTGluZSgpIHtcclxuICAgIGlmICghaGFzU3RhY2tzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcclxuICAgICAgICB2YXIgZmlyc3RMaW5lID0gbGluZXNbMF0uaW5kZXhPZihcIkBcIikgPiAwID8gbGluZXNbMV0gOiBsaW5lc1syXTtcclxuICAgICAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKGZpcnN0TGluZSk7XHJcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcUZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xyXG4gICAgICAgIHJldHVybiBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmXHJcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4obmFtZSArIFwiIGlzIGRlcHJlY2F0ZWQsIHVzZSBcIiArIGFsdGVybmF0aXZlICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluc3RlYWQuXCIsIG5ldyBFcnJvcihcIlwiKS5zdGFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShjYWxsYmFjaywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIGVuZCBvZiBzaGltc1xyXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxyXG4gKiBjb2VyY2VzIHByb21pc2VzIGZyb20gZGlmZmVyZW50IHN5c3RlbXMuXHJcbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlIG9yIHByb21pc2VcclxuICovXHJcbmZ1bmN0aW9uIFEodmFsdWUpIHtcclxuICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBhIFByb21pc2UsIHJldHVybiBpdCBkaXJlY3RseS4gIFRoaXMgZW5hYmxlc1xyXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXHJcbiAgICAvLyBidXQgdG8gdG9sZXJhYmx5IGNvZXJjZSBub24tcHJvbWlzZXMgdG8gcHJvbWlzZXMuXHJcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXHJcbiAgICBpZiAoaXNQcm9taXNlQWxpa2UodmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvZXJjZSh2YWx1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmdWxmaWxsKHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5RLnJlc29sdmUgPSBRO1xyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuIG9mIHRoZSBldmVudCBsb29wLlxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrXHJcbiAqL1xyXG5RLm5leHRUaWNrID0gbmV4dFRpY2s7XHJcblxyXG4vKipcclxuICogQ29udHJvbHMgd2hldGhlciBvciBub3QgbG9uZyBzdGFjayB0cmFjZXMgd2lsbCBiZSBvblxyXG4gKi9cclxuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XHJcblxyXG4vKipcclxuICogVGhlIGNvdW50ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0b3BwaW5nIHBvaW50IGZvciBidWlsZGluZ1xyXG4gKiBsb25nIHN0YWNrIHRyYWNlcy4gSW4gbWFrZVN0YWNrVHJhY2VMb25nIHdlIHdhbGsgYmFja3dhcmRzIHRocm91Z2hcclxuICogdGhlIGxpbmtlZCBsaXN0IG9mIHByb21pc2VzLCBvbmx5IHN0YWNrcyB3aGljaCB3ZXJlIGNyZWF0ZWQgYmVmb3JlXHJcbiAqIHRoZSByZWplY3Rpb24gYXJlIGNvbmNhdGVuYXRlZC5cclxuICovXHJcbnZhciBsb25nU3RhY2tDb3VudGVyID0gMTtcclxuXHJcbi8vIGVuYWJsZSBsb25nIHN0YWNrcyBpZiBRX0RFQlVHIGlzIHNldFxyXG5pZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmVudiAmJiBwcm9jZXNzLmVudi5RX0RFQlVHKSB7XHJcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIHtwcm9taXNlLCByZXNvbHZlLCByZWplY3R9IG9iamVjdC5cclxuICpcclxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcclxuICogcHJvbWlzZS4gVG8gZnVsZmlsbCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGFueSB2YWx1ZSB0aGF0IGlzXHJcbiAqIG5vdCBhIHRoZW5hYmxlLiBUbyByZWplY3QgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhIHJlamVjdGVkXHJcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxyXG4gKiBwcm9taXNlIHRvIGFub3RoZXIgdGhlbmFibGUsIHRodXMgcHV0dGluZyBpdCBpbiB0aGUgc2FtZSBzdGF0ZSwgaW52b2tlXHJcbiAqIGByZXNvbHZlYCB3aXRoIHRoYXQgb3RoZXIgdGhlbmFibGUuXHJcbiAqL1xyXG5RLmRlZmVyID0gZGVmZXI7XHJcbmZ1bmN0aW9uIGRlZmVyKCkge1xyXG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxyXG4gICAgLy8gYmVlbiByZXNvbHZlZC4gIElmIGl0IGlzIFwidW5kZWZpbmVkXCIsIGl0IGhhcyBiZWVuIHJlc29sdmVkLiAgRWFjaFxyXG4gICAgLy8gZWxlbWVudCBvZiB0aGUgbWVzc2FnZXMgYXJyYXkgaXMgaXRzZWxmIGFuIGFycmF5IG9mIGNvbXBsZXRlIGFyZ3VtZW50cyB0b1xyXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXHJcbiAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBgcmVzb2x2ZWAgZnVuY3Rpb24gYmVjYXVzZSBpdCBoYW5kbGVzIGJvdGggZnVsbHlcclxuICAgIC8vIG5vbi10aGVuYWJsZSB2YWx1ZXMgYW5kIG90aGVyIHRoZW5hYmxlcyBncmFjZWZ1bGx5LlxyXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcclxuXHJcbiAgICB2YXIgZGVmZXJyZWQgPSBvYmplY3RfY3JlYXRlKGRlZmVyLnByb3RvdHlwZSk7XHJcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xyXG5cclxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBvcGVyYW5kcykge1xyXG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcclxuICAgICAgICBpZiAobWVzc2FnZXMpIHtcclxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChhcmdzKTtcclxuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXHJcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVycy5wdXNoKG9wZXJhbmRzWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShyZXNvbHZlZFByb21pc2UsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFhYWCBkZXByZWNhdGVkXHJcbiAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcclxuICAgICAgICBpZiAoaXNQcm9taXNlKG5lYXJlclZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXNvbHZlZFByb21pc2UgPSBuZWFyZXJWYWx1ZTsgLy8gc2hvcnRlbiBjaGFpblxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmVhcmVyVmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHByb21pc2UuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXJlc29sdmVkUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkUHJvbWlzZS5pbnNwZWN0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChRLmxvbmdTdGFja1N1cHBvcnQgJiYgaGFzU3RhY2tzKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXHJcbiAgICAgICAgICAgIC8vIGFjY2Vzc29yIGFyb3VuZDsgdGhhdCBjYXVzZXMgbWVtb3J5IGxlYWtzIGFzIHBlciBHSC0xMTEuIEp1c3RcclxuICAgICAgICAgICAgLy8gcmVpZnkgdGhlIHN0YWNrIHRyYWNlIGFzIGEgc3RyaW5nIEFTQVAuXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vIEF0IHRoZSBzYW1lIHRpbWUsIGN1dCBvZmYgdGhlIGZpcnN0IGxpbmU7IGl0J3MgYWx3YXlzIGp1c3RcclxuICAgICAgICAgICAgLy8gXCJbb2JqZWN0IFByb21pc2VdXFxuXCIsIGFzIHBlciB0aGUgYHRvU3RyaW5nYC5cclxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xyXG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrQ291bnRlciA9IGxvbmdTdGFja0NvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTk9URTogd2UgZG8gdGhlIGNoZWNrcyBmb3IgYHJlc29sdmVkUHJvbWlzZWAgaW4gZWFjaCBtZXRob2QsIGluc3RlYWQgb2ZcclxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XHJcbiAgICAvLyBwcm9taXNlcyB3aXRoIHRoZSBsaW5lcyBgYmVjb21lKHdoYXRldmVyKHZhbHVlKSlgLiBTZWUgZS5nLiBHSC0yNTIuXHJcblxyXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcclxuICAgICAgICByZXNvbHZlZFByb21pc2UgPSBuZXdQcm9taXNlO1xyXG5cclxuICAgICAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xyXG4gICAgICAgICAgICAvLyBPbmx5IGhvbGQgYSByZWZlcmVuY2UgdG8gdGhlIG5ldyBwcm9taXNlIGlmIGxvbmcgc3RhY2tzXHJcbiAgICAgICAgICAgIC8vIGFyZSBlbmFibGVkIHRvIHJlZHVjZSBtZW1vcnkgdXNhZ2VcclxuICAgICAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbmV3UHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkobmV3UHJvbWlzZSwgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIHZvaWQgMCk7XHJcblxyXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xyXG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xyXG4gICAgfVxyXG5cclxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xyXG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcclxuICAgIH07XHJcblxyXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcclxuICAgIH07XHJcbiAgICBkZWZlcnJlZC5yZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xyXG4gICAgfTtcclxuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xyXG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXJyYXlfcmVkdWNlKHByb2dyZXNzTGlzdGVuZXJzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBwcm9ncmVzc0xpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIHZvaWQgMCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBkZWZlcnJlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBOb2RlLXN0eWxlIGNhbGxiYWNrIHRoYXQgd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgZGVmZXJyZWRcclxuICogcHJvbWlzZS5cclxuICogQHJldHVybnMgYSBub2RlYmFja1xyXG4gKi9cclxuZGVmZXIucHJvdG90eXBlLm1ha2VOb2RlUmVzb2x2ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCB2YWx1ZSkge1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICBzZWxmLnJlc29sdmUoYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSByZXNvbHZlciB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG5vdGhpbmcgYW5kIGFjY2VwdHNcclxuICogdGhlIHJlc29sdmUsIHJlamVjdCwgYW5kIG5vdGlmeSBmdW5jdGlvbnMgZm9yIGEgZGVmZXJyZWQuXHJcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcclxuICogZnVuY3Rpb25zLCBvciByZWplY3RlZCBieSBhIHRocm93biBleGNlcHRpb24gaW4gcmVzb2x2ZXJcclxuICovXHJcblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxyXG5RLnByb21pc2UgPSBwcm9taXNlO1xyXG5mdW5jdGlvbiBwcm9taXNlKHJlc29sdmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcclxuICAgIH1cclxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJlc29sdmVyKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcclxuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xyXG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbn1cclxuXHJcbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxyXG5wcm9taXNlLmFsbCA9IGFsbDsgLy8gRVM2XHJcbnByb21pc2UucmVqZWN0ID0gcmVqZWN0OyAvLyBFUzZcclxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XHJcblxyXG4vLyBYWFggZXhwZXJpbWVudGFsLiAgVGhpcyBtZXRob2QgaXMgYSB3YXkgdG8gZGVub3RlIHRoYXQgYSBsb2NhbCB2YWx1ZSBpc1xyXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcclxuLy8gaW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVmZXJlbmNlLlxyXG5RLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XHJcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xyXG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUucGFzc0J5Q29weSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vZnJlZXplKG9iamVjdCk7XHJcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXHJcbiAqIGJ1dCBvdGhlcndpc2UgcmVqZWN0cy5cclxuICogQHBhcmFtIHgge0FueSp9XHJcbiAqIEBwYXJhbSB5IHtBbnkqfVxyXG4gKiBAcmV0dXJucyB7QW55Kn0gYSBwcm9taXNlIGZvciB4IGFuZCB5IGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBidXQgYSByZWplY3Rpb25cclxuICogb3RoZXJ3aXNlLlxyXG4gKlxyXG4gKi9cclxuUS5qb2luID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcclxuICAgIHJldHVybiBRKFt0aGlzLCB0aGF0XSkuc3ByZWFkKGZ1bmN0aW9uICh4LCB5KSB7XHJcbiAgICAgICAgaWYgKHggPT09IHkpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XHJcbiAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXHJcbiAqIEBwYXJhbSBhbnN3ZXJzIHtBcnJheVtBbnkqXX0gcHJvbWlzZXMgdG8gcmFjZVxyXG4gKiBAcmV0dXJucyB7QW55Kn0gdGhlIGZpcnN0IHByb21pc2UgdG8gYmUgc2V0dGxlZFxyXG4gKi9cclxuUS5yYWNlID0gcmFjZTtcclxuZnVuY3Rpb24gcmFjZShhbnN3ZXJQcykge1xyXG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcclxuICAgICAgICAvLyBhbnN3ZXJQcy5mb3JFYWNoKGZ1bmN0aW9uIChhbnN3ZXJQKSB7XHJcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgIC8vIH0pO1xyXG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBRKGFuc3dlclBzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50aGVuKFEucmFjZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXHJcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXHJcbiAqIHNldChuYW1lLCB2YWx1ZSksIHBvc3QobmFtZSwgYXJncyksIGFuZCBkZWxldGUobmFtZSksIHdoaWNoIGFsbFxyXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcclxuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxyXG4gKiBoYXZlIGJlZW4gZm9yd2FyZGVkIHRvIHRoZSBhcHByb3ByaWF0ZSBtZXRob2QgYWJvdmUgaGFkIGEgbWV0aG9kIGJlZW5cclxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxyXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcclxuICogYm91Z2h0IGFuZCBzb2xkLlxyXG4gKi9cclxuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XHJcbmZ1bmN0aW9uIFByb21pc2UoZGVzY3JpcHRvciwgZmFsbGJhY2ssIGluc3BlY3QpIHtcclxuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcclxuICAgICAgICAgICAgKSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcclxuICAgICAgICBpbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xyXG5cclxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXNvbHZlKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XHJcblxyXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XHJcbiAgICBpZiAoaW5zcGVjdCkge1xyXG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XHJcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcclxuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcclxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByb21pc2U7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xyXG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xyXG5cclxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGZ1bGZpbGxlZCA9PT0gXCJmdW5jdGlvblwiID8gZnVsZmlsbGVkKHZhbHVlKSA6IHZhbHVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9yZWplY3RlZChleGNlcHRpb24pIHtcclxuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld0V4Y2VwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9wcm9ncmVzc2VkKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XHJcbiAgICAgICAgfSwgXCJ3aGVuXCIsIFtmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgIGlmIChkb25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9yZWplY3RlZChleGNlcHRpb24pKTtcclxuICAgICAgICB9XSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQcm9ncmVzcyBwcm9wYWdhdG9yIG5lZWQgdG8gYmUgYXR0YWNoZWQgaW4gdGhlIGN1cnJlbnQgdGljay5cclxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBuZXdWYWx1ZTtcclxuICAgICAgICB2YXIgdGhyZXcgPSBmYWxzZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBuZXdWYWx1ZSA9IF9wcm9ncmVzc2VkKHZhbHVlKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aHJldykge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxufTtcclxuXHJcblEudGFwID0gZnVuY3Rpb24gKHByb21pc2UsIGNhbGxiYWNrKSB7XHJcbiAgICByZXR1cm4gUShwcm9taXNlKS50YXAoY2FsbGJhY2spO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cclxuICogT3JpZ2luYWwgcmVzb2x1dGlvbiB2YWx1ZSBpcyBwYXNzZWQgdGhyb3VnaCBjYWxsYmFjayB1bmFmZmVjdGVkLlxyXG4gKiBDYWxsYmFjayBtYXkgcmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgYXdhaXRlZCBmb3IuXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXHJcbiAqIEByZXR1cm5zIHtRLlByb21pc2V9XHJcbiAqIEBleGFtcGxlXHJcbiAqIGRvU29tZXRoaW5nKClcclxuICogICAudGhlbiguLi4pXHJcbiAqICAgLnRhcChjb25zb2xlLmxvZylcclxuICogICAudGhlbiguLi4pO1xyXG4gKi9cclxuUHJvbWlzZS5wcm90b3R5cGUudGFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xyXG5cclxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlcnMgYW4gb2JzZXJ2ZXIgb24gYSBwcm9taXNlLlxyXG4gKlxyXG4gKiBHdWFyYW50ZWVzOlxyXG4gKlxyXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxyXG4gKiAyLiB0aGF0IGVpdGhlciB0aGUgZnVsZmlsbGVkIGNhbGxiYWNrIG9yIHRoZSByZWplY3RlZCBjYWxsYmFjayB3aWxsIGJlXHJcbiAqICAgIGNhbGxlZCwgYnV0IG5vdCBib3RoLlxyXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cclxuICpcclxuICogQHBhcmFtIHZhbHVlICAgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIHRvIG9ic2VydmVcclxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxyXG4gKiBAcGFyYW0gcmVqZWN0ZWQgICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgcmVqZWN0aW9uIGV4Y2VwdGlvblxyXG4gKiBAcGFyYW0gcHJvZ3Jlc3NlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcclxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcclxuICovXHJcblEud2hlbiA9IHdoZW47XHJcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcclxuICAgIHJldHVybiBRKHZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpO1xyXG59XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XHJcbn07XHJcblxyXG5RLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHByb21pc2UsIHZhbHVlKSB7XHJcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IHJlYXNvbjsgfSk7XHJcbn07XHJcblxyXG5RLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgcmVhc29uKSB7XHJcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVqZWN0KHJlYXNvbik7XHJcbn07XHJcblxyXG4vKipcclxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxyXG4gKiBJZiBhIHByb21pc2UgaXMgcmVqZWN0ZWQsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlIHRvby5cclxuICogSWYgaXTigJlzIGEgZnVsZmlsbGVkIHByb21pc2UsIHRoZSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZWFyZXIuXHJcbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXHJcbiAqIHJlc29sdXRpb24gaXMgXCJuZWFyZXJcIi5cclxuICogQHBhcmFtIG9iamVjdFxyXG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcclxuICovXHJcblxyXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XHJcblEubmVhcmVyID0gbmVhcmVyO1xyXG5mdW5jdGlvbiBuZWFyZXIodmFsdWUpIHtcclxuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XHJcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IHZhbHVlLmluc3BlY3QoKTtcclxuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG4vKipcclxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcHJvbWlzZS5cclxuICogT3RoZXJ3aXNlIGl0IGlzIGEgZnVsZmlsbGVkIHZhbHVlLlxyXG4gKi9cclxuUS5pc1Byb21pc2UgPSBpc1Byb21pc2U7XHJcbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmplY3QpIHtcclxuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xyXG59XHJcblxyXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XHJcbmZ1bmN0aW9uIGlzUHJvbWlzZUFsaWtlKG9iamVjdCkge1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XHJcbiAqIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cclxuICovXHJcblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xyXG5mdW5jdGlvbiBpc1BlbmRpbmcob2JqZWN0KSB7XHJcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgdmFsdWUgb3IgZnVsZmlsbGVkXHJcbiAqIHByb21pc2UuXHJcbiAqL1xyXG5RLmlzRnVsZmlsbGVkID0gaXNGdWxmaWxsZWQ7XHJcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xyXG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xyXG59XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxyXG4gKi9cclxuUS5pc1JlamVjdGVkID0gaXNSZWplY3RlZDtcclxuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcclxuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicmVqZWN0ZWRcIjtcclxufTtcclxuXHJcbi8vLy8gQkVHSU4gVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xyXG5cclxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcclxuLy8gaGFuZGxlZCBieSBhIHN1YnNlcXVlbnQgcHJvbWlzZS4gIFRoZSBleGNlcHRpb25zIGdldCBhZGRlZCB0byB0aGlzIGFycmF5IHdoZW5cclxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxyXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cclxudmFyIHVuaGFuZGxlZFJlYXNvbnMgPSBbXTtcclxudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcclxudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xyXG52YXIgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcclxuXHJcbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcclxuICAgIHVuaGFuZGxlZFJlYXNvbnMubGVuZ3RoID0gMDtcclxuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMubGVuZ3RoID0gMDtcclxuXHJcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xyXG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xyXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgUS5uZXh0VGljay5ydW5BZnRlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbWl0KFwidW5oYW5kbGVkUmVqZWN0aW9uXCIsIHJlYXNvbiwgcHJvbWlzZSk7XHJcbiAgICAgICAgICAgICAgICByZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMucHVzaChwcm9taXNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMucHVzaChwcm9taXNlKTtcclxuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XHJcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYXQgPSBhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xyXG4gICAgaWYgKGF0ICE9PSAtMSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgUS5uZXh0VGljay5ydW5BZnRlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXRSZXBvcnQgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5lbWl0KFwicmVqZWN0aW9uSGFuZGxlZFwiLCB1bmhhbmRsZWRSZWFzb25zW2F0XSwgcHJvbWlzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdCwgMSk7XHJcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5zcGxpY2UoYXQsIDEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcclxuXHJcblEuZ2V0VW5oYW5kbGVkUmVhc29ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cclxuICAgIHJldHVybiB1bmhhbmRsZWRSZWFzb25zLnNsaWNlKCk7XHJcbn07XHJcblxyXG5RLnN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpO1xyXG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XHJcbn07XHJcblxyXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcclxuXHJcbi8vLy8gRU5EIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIGEgcmVqZWN0ZWQgcHJvbWlzZS5cclxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXHJcbiAqL1xyXG5RLnJlamVjdCA9IHJlamVjdDtcclxuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xyXG4gICAgdmFyIHJlamVjdGlvbiA9IFByb21pc2Uoe1xyXG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcclxuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXHJcbiAgICAgICAgICAgIGlmIChyZWplY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdW50cmFja1JlamVjdGlvbih0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZChyZWFzb24pIDogdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sIGZ1bmN0aW9uIGluc3BlY3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxyXG4gICAgdHJhY2tSZWplY3Rpb24ocmVqZWN0aW9uLCByZWFzb24pO1xyXG5cclxuICAgIHJldHVybiByZWplY3Rpb247XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3RzIGEgZnVsZmlsbGVkIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UuXHJcbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlXHJcbiAqL1xyXG5RLmZ1bGZpbGwgPSBmdWxmaWxsO1xyXG5mdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZSh7XHJcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24gKG5hbWUsIHJocykge1xyXG4gICAgICAgICAgICB2YWx1ZVtuYW1lXSA9IHJocztcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZGVsZXRlXCI6IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtuYW1lXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicG9zdFwiOiBmdW5jdGlvbiAobmFtZSwgYXJncykge1xyXG4gICAgICAgICAgICAvLyBNYXJrIE1pbGxlciBwcm9wb3NlcyB0aGF0IHBvc3Qgd2l0aCBubyBuYW1lIHNob3VsZCBhcHBseSBhXHJcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJhcHBseVwiOiBmdW5jdGlvbiAodGhpc3AsIGFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHRoaXNwLCBhcmdzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwia2V5c1wiOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3Rfa2V5cyh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgdm9pZCAwLCBmdW5jdGlvbiBpbnNwZWN0KCkge1xyXG4gICAgICAgIHJldHVybiB7IHN0YXRlOiBcImZ1bGZpbGxlZFwiLCB2YWx1ZTogdmFsdWUgfTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydHMgdGhlbmFibGVzIHRvIFEgcHJvbWlzZXMuXHJcbiAqIEBwYXJhbSBwcm9taXNlIHRoZW5hYmxlIHByb21pc2VcclxuICogQHJldHVybnMgYSBRIHByb21pc2VcclxuICovXHJcbmZ1bmN0aW9uIGNvZXJjZShwcm9taXNlKSB7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xyXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcclxuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcclxuICogdHJhbnNmZXJyZWQgYXdheSBmcm9tIHRoaXMgcHJvY2VzcyBvdmVyIGFueSBwcm9taXNlXHJcbiAqIGNvbW11bmljYXRpb24gY2hhbm5lbC5cclxuICogQHBhcmFtIG9iamVjdFxyXG4gKiBAcmV0dXJucyBwcm9taXNlIGEgd3JhcHBpbmcgb2YgdGhhdCBvYmplY3QgdGhhdFxyXG4gKiBhZGRpdGlvbmFsbHkgcmVzcG9uZHMgdG8gdGhlIFwiaXNEZWZcIiBtZXNzYWdlXHJcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXHJcbiAqL1xyXG5RLm1hc3RlciA9IG1hc3RlcjtcclxuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xyXG4gICAgcmV0dXJuIFByb21pc2Uoe1xyXG4gICAgICAgIFwiaXNEZWZcIjogZnVuY3Rpb24gKCkge31cclxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XHJcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpO1xyXG4gICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTcHJlYWRzIHRoZSB2YWx1ZXMgb2YgYSBwcm9taXNlZCBhcnJheSBvZiBhcmd1bWVudHMgaW50byB0aGVcclxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXHJcbiAqIEBwYXJhbSBmdWxmaWxsZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB2YXJpYWRpYyBhcmd1bWVudHMgZnJvbSB0aGVcclxuICogcHJvbWlzZWQgYXJyYXlcclxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxyXG4gKiBpcyByZWplY3RlZC5cclxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9yIHRocm93biBleGNlcHRpb24gb2ZcclxuICogZWl0aGVyIGNhbGxiYWNrLlxyXG4gKi9cclxuUS5zcHJlYWQgPSBzcHJlYWQ7XHJcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xyXG4gICAgcmV0dXJuIFEodmFsdWUpLnNwcmVhZChmdWxmaWxsZWQsIHJlamVjdGVkKTtcclxufVxyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcclxuICAgIHJldHVybiB0aGlzLmFsbCgpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcclxuICAgIH0sIHJlamVjdGVkKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgYXN5bmMgZnVuY3Rpb24gaXMgYSBkZWNvcmF0b3IgZm9yIGdlbmVyYXRvciBmdW5jdGlvbnMsIHR1cm5pbmdcclxuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XHJcbiAqIG9mIHRoZSBuZXdlc3QgRUNNQVNjcmlwdCA2IGRyYWZ0cywgdGhpcyBjb2RlIGRvZXMgbm90IGNhdXNlIHN5bnRheFxyXG4gKiBlcnJvcnMgaW4gb2xkZXIgZW5naW5lcy4gIFRoaXMgY29kZSBzaG91bGQgY29udGludWUgdG8gd29yayBhbmQgd2lsbFxyXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cclxuICpcclxuICogRVM2IGdlbmVyYXRvcnMgYXJlIGN1cnJlbnRseSBwYXJ0IG9mIFY4IHZlcnNpb24gMy4xOSB3aXRoIHRoZVxyXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cclxuICogZm9yIGxvbmdlciwgYnV0IHVuZGVyIGFuIG9sZGVyIFB5dGhvbi1pbnNwaXJlZCBmb3JtLiAgVGhpcyBmdW5jdGlvblxyXG4gKiB3b3JrcyBvbiBib3RoIGtpbmRzIG9mIGdlbmVyYXRvcnMuXHJcbiAqXHJcbiAqIERlY29yYXRlcyBhIGdlbmVyYXRvciBmdW5jdGlvbiBzdWNoIHRoYXQ6XHJcbiAqICAtIGl0IG1heSB5aWVsZCBwcm9taXNlc1xyXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcclxuICogIC0gdGhlIHZhbHVlIG9mIHRoZSB5aWVsZCBleHByZXNzaW9uIHdpbGwgYmUgdGhlIGZ1bGZpbGxlZCB2YWx1ZVxyXG4gKiAgLSBpdCByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSAod2hlbiB0aGUgZ2VuZXJhdG9yXHJcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcclxuICogIC0gdGhlIGRlY29yYXRlZCBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxyXG4gKiAgICBvZiB0aGUgZ2VuZXJhdG9yIG9yIHRoZSBmaXJzdCByZWplY3RlZCBwcm9taXNlIGFtb25nIHRob3NlXHJcbiAqICAgIHlpZWxkZWQuXHJcbiAqICAtIGlmIGFuIGVycm9yIGlzIHRocm93biBpbiB0aGUgZ2VuZXJhdG9yLCBpdCBwcm9wYWdhdGVzIHRocm91Z2hcclxuICogICAgZXZlcnkgZm9sbG93aW5nIHlpZWxkIHVudGlsIGl0IGlzIGNhdWdodCwgb3IgdW50aWwgaXQgZXNjYXBlc1xyXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxyXG4gKiAgICByZWplY3Rpb24gZm9yIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBkZWNvcmF0ZWQgZ2VuZXJhdG9yLlxyXG4gKi9cclxuUS5hc3luYyA9IGFzeW5jO1xyXG5mdW5jdGlvbiBhc3luYyhtYWtlR2VuZXJhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcclxuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJ0aHJvd1wiLCBhcmcgaXMgYW4gZXhjZXB0aW9uXHJcbiAgICAgICAgZnVuY3Rpb24gY29udGludWVyKHZlcmIsIGFyZykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgLy8gVW50aWwgVjggMy4xOSAvIENocm9taXVtIDI5IGlzIHJlbGVhc2VkLCBTcGlkZXJNb25rZXkgaXMgdGhlIG9ubHlcclxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cclxuICAgICAgICAgICAgLy8gSG93ZXZlciwgU00ncyBnZW5lcmF0b3JzIHVzZSB0aGUgUHl0aG9uLWluc3BpcmVkIHNlbWFudGljcyBvZlxyXG4gICAgICAgICAgICAvLyBvdXRkYXRlZCBFUzYgZHJhZnRzLiAgV2Ugd291bGQgbGlrZSB0byBzdXBwb3J0IEVTNiwgYnV0IHdlJ2QgYWxzb1xyXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXHJcbiAgICAgICAgICAgIC8vIHdlIGFsc28gc3VwcG9ydCBQeXRob24tc3R5bGUgZ2VuZXJhdG9ycy4gIEF0IHNvbWUgcG9pbnQgd2UgY2FuIHJlbW92ZVxyXG4gICAgICAgICAgICAvLyB0aGlzIGJsb2NrLlxyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTdG9wSXRlcmF0aW9uID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBFUzYgR2VuZXJhdG9yc1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdC52YWx1ZSwgY2FsbGJhY2ssIGVycmJhY2spO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BpZGVyTW9ua2V5IEdlbmVyYXRvcnNcclxuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFEoZXhjZXB0aW9uLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LCBjYWxsYmFjaywgZXJyYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG1ha2VHZW5lcmF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250aW51ZXIuYmluZChjb250aW51ZXIsIFwibmV4dFwiKTtcclxuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcclxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XHJcbiAqIGNhbGxzIHRoZSBnZW5lcmF0b3IgYW5kIGFsc28gZW5kcyB0aGUgcHJvbWlzZSBjaGFpbiwgc28gdGhhdCBhbnlcclxuICogdW5oYW5kbGVkIGVycm9ycyBhcmUgdGhyb3duIGluc3RlYWQgb2YgZm9yd2FyZGVkIHRvIHRoZSBlcnJvclxyXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cclxuICogZ2VuZXJhdG9ycyBhdCB0aGUgdG9wLWxldmVsIHRvIHdvcmsgd2l0aCBsaWJyYXJpZXMuXHJcbiAqL1xyXG5RLnNwYXduID0gc3Bhd247XHJcbmZ1bmN0aW9uIHNwYXduKG1ha2VHZW5lcmF0b3IpIHtcclxuICAgIFEuZG9uZShRLmFzeW5jKG1ha2VHZW5lcmF0b3IpKCkpO1xyXG59XHJcblxyXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaW50ZXJmYWNlIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluIFNwaWRlck1vbmtleS5cclxuLyoqXHJcbiAqIFRocm93cyBhIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB0byBzdG9wIGFuIGFzeW5jaHJvbm91cyBnZW5lcmF0b3IuXHJcbiAqXHJcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cclxuICogdmFsdWVzIGluIG9sZGVyIEZpcmVmb3gvU3BpZGVyTW9ua2V5LiAgSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEVTNlxyXG4gKiBnZW5lcmF0b3JzIGxpa2UgQ2hyb21pdW0gMjksIGp1c3QgdXNlIFwicmV0dXJuXCIgaW4geW91ciBnZW5lcmF0b3JcclxuICogZnVuY3Rpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHJldHVybiB2YWx1ZSBmb3IgdGhlIHN1cnJvdW5kaW5nIGdlbmVyYXRvclxyXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cclxuICogQGV4YW1wbGVcclxuICogLy8gRVM2IHN0eWxlXHJcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcclxuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xyXG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XHJcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcclxuICogfSlcclxuICogLy8gT2xkZXIgU3BpZGVyTW9ua2V5IHN0eWxlXHJcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xyXG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XHJcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcclxuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xyXG4gKiB9KVxyXG4gKi9cclxuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XHJcbmZ1bmN0aW9uIF9yZXR1cm4odmFsdWUpIHtcclxuICAgIHRocm93IG5ldyBRUmV0dXJuVmFsdWUodmFsdWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXHJcbiAqIGFyZSBzZXR0bGVkIGFuZCBwYXNzZWQgYXMgdmFsdWVzIChgdGhpc2AgaXMgYWxzbyBzZXR0bGVkIGFuZCBwYXNzZWRcclxuICogYXMgYSB2YWx1ZSkuICBJdCB3aWxsIGFsc28gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdCBvZiBhIGZ1bmN0aW9uIGlzXHJcbiAqIGFsd2F5cyBhIHByb21pc2UuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAqICAgICByZXR1cm4gYSArIGI7XHJcbiAqIH0pO1xyXG4gKiBhZGQoUShhKSwgUShCKSk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBkZWNvcmF0ZVxyXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXHJcbiAqL1xyXG5RLnByb21pc2VkID0gcHJvbWlzZWQ7XHJcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBzcHJlYWQoW3RoaXMsIGFsbChhcmd1bWVudHMpXSwgZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cclxuICogQHBhcmFtIG9iamVjdCogdGhlIHJlY2lwaWVudFxyXG4gKiBAcGFyYW0gb3AgdGhlIG5hbWUgb2YgdGhlIG1lc3NhZ2Ugb3BlcmF0aW9uLCBlLmcuLCBcIndoZW5cIixcclxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cclxuICogQHJldHVybnMgcmVzdWx0IHtQcm9taXNlfSBhIHByb21pc2UgZm9yIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvblxyXG4gKi9cclxuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xyXG5mdW5jdGlvbiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKSB7XHJcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKG9wLCBhcmdzKTtcclxufVxyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiAob3AsIGFyZ3MpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XHJcbiAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cclxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcclxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIGdldFxyXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxyXG4gKi9cclxuUS5nZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcclxuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cclxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcclxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxyXG4gKiBAcGFyYW0gdmFsdWUgICAgIG5ldyB2YWx1ZSBvZiBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcclxuICovXHJcblEuc2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVsZXRlcyBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXHJcbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XHJcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcclxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXHJcbiAqL1xyXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcclxuUVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XHJcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJkZWxldGVcIiwgW2tleV0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cclxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcclxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcclxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxyXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XHJcbiAqICAgICAgICAgICAgICAgICAgYXJlIHVsdGltYXRlbHkgYmFja2VkIHdpdGggYHJlc29sdmVgIHZhbHVlcyxcclxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcclxuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxyXG4gKiAgICAgICAgICAgICAgICAgIEpTT04gc2VyaWFsaXphYmxlIG9iamVjdC5cclxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXHJcbiAqL1xyXG4vLyBib3VuZCBsb2NhbGx5IGJlY2F1c2UgaXQgaXMgdXNlZCBieSBvdGhlciBtZXRob2RzXHJcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcclxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFyZ3NdKTtcclxufTtcclxuXHJcblByb21pc2UucHJvdG90eXBlLm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXHJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XHJcbn07XHJcblxyXG4vKipcclxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxyXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxyXG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxyXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGludm9jYXRpb24gYXJndW1lbnRzXHJcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxyXG4gKi9cclxuUS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcclxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXHJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMildKTtcclxufTtcclxuXHJcblByb21pc2UucHJvdG90eXBlLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxyXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXHJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSldKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxyXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSBhcmdzICAgICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXHJcbiAqL1xyXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcclxuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXHJcbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cclxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcclxuICovXHJcblFbXCJ0cnlcIl0gPVxyXG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcclxuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMpXSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXHJcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cclxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxyXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xyXG4gKi9cclxuUS5mYmluZCA9IGZ1bmN0aW9uIChvYmplY3QgLyouLi5hcmdzKi8pIHtcclxuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xyXG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZib3VuZCgpIHtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcclxuICAgICAgICAgICAgdGhpcyxcclxuICAgICAgICAgICAgYXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSlcclxuICAgICAgICBdKTtcclxuICAgIH07XHJcbn07XHJcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XHJcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XHJcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xyXG4gICAgICAgICAgICB0aGlzLFxyXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxyXG4gICAgICAgIF0pO1xyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxyXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cclxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcclxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxyXG4gKi9cclxuUS5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XHJcbn07XHJcblxyXG4vKipcclxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5LiAgSWYgYW55IG9mXHJcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXHJcbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcclxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcclxuICovXHJcbi8vIEJ5IE1hcmsgTWlsbGVyXHJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxyXG5RLmFsbCA9IGFsbDtcclxuZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XHJcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XHJcbiAgICAgICAgdmFyIHBlbmRpbmdDb3VudCA9IDA7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcclxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXHJcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICsrcGVuZGluZ0NvdW50O1xyXG4gICAgICAgICAgICAgICAgd2hlbihcclxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tcGVuZGluZ0NvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdm9pZCAwKTtcclxuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gYWxsKHRoaXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxyXG4gKiBpZ25vcmVkLiAgUmVqZWN0cyBvbmx5IGlmIGFsbCBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXHJcbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSBjb250YWluaW5nIHZhbHVlcyBvciBwcm9taXNlcyBmb3IgdmFsdWVzXHJcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXHJcbiAqIG9yIGEgcmVqZWN0ZWQgcHJvbWlzZSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxyXG4gKi9cclxuUS5hbnkgPSBhbnk7XHJcblxyXG5mdW5jdGlvbiBhbnkocHJvbWlzZXMpIHtcclxuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gUS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xyXG4gICAgdmFyIHBlbmRpbmdDb3VudCA9IDA7XHJcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xyXG4gICAgICAgIHZhciBwcm9taXNlID0gcHJvbWlzZXNbaW5kZXhdO1xyXG5cclxuICAgICAgICBwZW5kaW5nQ291bnQrKztcclxuXHJcbiAgICAgICAgd2hlbihwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgb25Qcm9ncmVzcyk7XHJcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnIpIHtcclxuICAgICAgICAgICAgcGVuZGluZ0NvdW50LS07XHJcbiAgICAgICAgICAgIGlmIChwZW5kaW5nQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWplY3Rpb24gPSBlcnIgfHwgbmV3IEVycm9yKFwiXCIgKyBlcnIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlamVjdGlvbi5tZXNzYWdlID0gKFwiUSBjYW4ndCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgZnJvbSBhbnkgcHJvbWlzZSwgYWxsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICBcInByb21pc2VzIHdlcmUgcmVqZWN0ZWQuIExhc3QgZXJyb3IgbWVzc2FnZTogXCIgKyByZWplY3Rpb24ubWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlamVjdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gb25Qcm9ncmVzcyhwcm9ncmVzcykge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe1xyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb2dyZXNzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sIHVuZGVmaW5lZCk7XHJcblxyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBhbnkodGhpcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXHJcbiAqIHJlamVjdGVkLiAgVGhpcyBpcyBkaXN0aW5jdCBmcm9tIGBhbGxgIHNpbmNlIHRoYXQgd291bGQgc3RvcFxyXG4gKiB3YWl0aW5nIGF0IHRoZSBmaXJzdCByZWplY3Rpb24uICBUaGUgcHJvbWlzZSByZXR1cm5lZCBieVxyXG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXHJcbiAqIEBwYXJhbSBwcm9taXNlcyBhIHByb21pc2UgZm9yIGFuIGFycmF5IChvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcclxuICogKG9yIHZhbHVlcylcclxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXHJcbiAqL1xyXG5RLmFsbFJlc29sdmVkID0gZGVwcmVjYXRlKGFsbFJlc29sdmVkLCBcImFsbFJlc29sdmVkXCIsIFwiYWxsU2V0dGxlZFwiKTtcclxuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcclxuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcclxuICAgICAgICBwcm9taXNlcyA9IGFycmF5X21hcChwcm9taXNlcywgUSk7XHJcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocHJvbWlzZSwgbm9vcCwgbm9vcCk7XHJcbiAgICAgICAgfSkpLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAc2VlIFByb21pc2UjYWxsU2V0dGxlZFxyXG4gKi9cclxuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcclxuZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlcykge1xyXG4gICAgcmV0dXJuIFEocHJvbWlzZXMpLmFsbFNldHRsZWQoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXHJcbiAqIHJldHVybmVkIGJ5IGBpbnNwZWN0YCkgd2hlbiB0aGV5IGhhdmUgYWxsIHNldHRsZWQuXHJcbiAqIEBwYXJhbSB7QXJyYXlbQW55Kl19IHZhbHVlcyBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcclxuICogQHJldHVybnMge0FycmF5W1N0YXRlXX0gYW4gYXJyYXkgb2Ygc3RhdGVzIGZvciB0aGUgcmVzcGVjdGl2ZSB2YWx1ZXMuXHJcbiAqL1xyXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocHJvbWlzZXMpIHtcclxuICAgICAgICByZXR1cm4gYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZ2FyZGxlc3MoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5pbnNwZWN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYXB0dXJlcyB0aGUgZmFpbHVyZSBvZiBhIHByb21pc2UsIGdpdmluZyBhbiBvcG9ydHVuaXR5IHRvIHJlY292ZXJcclxuICogd2l0aCBhIGNhbGxiYWNrLiAgSWYgdGhlIGdpdmVuIHByb21pc2UgaXMgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcclxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXHJcbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIGZ1bGZpbGwgdGhlIHJldHVybmVkIHByb21pc2UgaWYgdGhlXHJcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcclxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFja1xyXG4gKi9cclxuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxyXG5RW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCByZWplY3RlZCkge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuZmFpbCA9IC8vIFhYWCBsZWdhY3lcclxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBdHRhY2hlcyBhIGxpc3RlbmVyIHRoYXQgY2FuIHJlc3BvbmQgdG8gcHJvZ3Jlc3Mgbm90aWZpY2F0aW9ucyBmcm9tIGFcclxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcclxuICogcGFzc2VkIHRvIGBgZGVmZXJyZWQubm90aWZ5YGAuXHJcbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcclxuICogQHJldHVybnMgdGhlIGdpdmVuIHByb21pc2UsIHVuY2hhbmdlZFxyXG4gKi9cclxuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xyXG5mdW5jdGlvbiBwcm9ncmVzcyhvYmplY3QsIHByb2dyZXNzZWQpIHtcclxuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XHJcbn1cclxuXHJcblByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gKHByb2dyZXNzZWQpIHtcclxuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIGFuIG9wcG9ydHVuaXR5IHRvIG9ic2VydmUgdGhlIHNldHRsaW5nIG9mIGEgcHJvbWlzZSxcclxuICogcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIEZvcndhcmRzXHJcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXHJcbiAqIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBjb21wbGV0aW9uLlxyXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cclxuICogcHJvbWlzZSwgdGFrZXMgbm8gYXJndW1lbnRzLlxyXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIHdoZW5cclxuICogYGBmaW5gYCBpcyBkb25lLlxyXG4gKi9cclxuUS5maW4gPSAvLyBYWFggbGVnYWN5XHJcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcclxuICAgIHJldHVybiBRKG9iamVjdClbXCJmaW5hbGx5XCJdKGNhbGxiYWNrKTtcclxufTtcclxuXHJcblByb21pc2UucHJvdG90eXBlLmZpbiA9IC8vIFhYWCBsZWdhY3lcclxuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBpZiAoIWNhbGxiYWNrIHx8IHR5cGVvZiBjYWxsYmFjay5hcHBseSAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCBhcHBseSBmaW5hbGx5IGNhbGxiYWNrXCIpO1xyXG4gICAgfVxyXG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcclxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAvLyBUT0RPIGF0dGVtcHQgdG8gcmVjeWNsZSB0aGUgcmVqZWN0aW9uIHdpdGggXCJ0aGlzXCIuXHJcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRlcm1pbmF0ZXMgYSBjaGFpbiBvZiBwcm9taXNlcywgZm9yY2luZyByZWplY3Rpb25zIHRvIGJlXHJcbiAqIHRocm93biBhcyBleGNlcHRpb25zLlxyXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXHJcbiAqIEByZXR1cm5zIG5vdGhpbmdcclxuICovXHJcblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XHJcbiAgICByZXR1cm4gUShvYmplY3QpLmRvbmUoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xyXG4gICAgdmFyIG9uVW5oYW5kbGVkRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxyXG4gICAgICAgIC8vIGRvZXMgbm90IGNhdGNoIGl0IGFuZCB0dXJuIGl0IGludG8gYSByZWplY3Rpb24uXHJcbiAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XHJcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXHJcbiAgICB2YXIgcHJvbWlzZSA9IGZ1bGZpbGxlZCB8fCByZWplY3RlZCB8fCBwcm9ncmVzcyA/XHJcbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XHJcbiAgICAgICAgdGhpcztcclxuXHJcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xyXG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhdXNlcyBhIHByb21pc2UgdG8gYmUgcmVqZWN0ZWQgaWYgaXQgZG9lcyBub3QgZ2V0IGZ1bGZpbGxlZCBiZWZvcmVcclxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXHJcbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzIHRpbWVvdXRcclxuICogQHBhcmFtIHtBbnkqfSBjdXN0b20gZXJyb3IgbWVzc2FnZSBvciBFcnJvciBvYmplY3QgKG9wdGlvbmFsKVxyXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXHJcbiAqIGZ1bGZpbGxlZCBiZWZvcmUgdGhlIHRpbWVvdXQsIG90aGVyd2lzZSByZWplY3RlZC5cclxuICovXHJcblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS50aW1lb3V0KG1zLCBlcnJvcik7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24gKG1zLCBlcnJvcikge1xyXG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcclxuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIWVycm9yIHx8IFwic3RyaW5nXCIgPT09IHR5cGVvZiBlcnJvcikge1xyXG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvciB8fCBcIlRpbWVkIG91dCBhZnRlciBcIiArIG1zICsgXCIgbXNcIik7XHJcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgfSwgbXMpO1xyXG5cclxuICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcclxuICAgIH0sIGZ1bmN0aW9uIChleGNlcHRpb24pIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcclxuICAgIH0sIGRlZmVycmVkLm5vdGlmeSk7XHJcblxyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnaXZlbiB2YWx1ZSAob3IgcHJvbWlzZWQgdmFsdWUpLCBzb21lXHJcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXHJcbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzXHJcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXHJcbiAqIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UuXHJcbiAqIElmIHRoZSBnaXZlbiBwcm9taXNlIHJlamVjdHMsIHRoYXQgaXMgcGFzc2VkIGltbWVkaWF0ZWx5LlxyXG4gKi9cclxuUS5kZWxheSA9IGZ1bmN0aW9uIChvYmplY3QsIHRpbWVvdXQpIHtcclxuICAgIGlmICh0aW1lb3V0ID09PSB2b2lkIDApIHtcclxuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xyXG4gICAgICAgIG9iamVjdCA9IHZvaWQgMDtcclxuICAgIH1cclxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xyXG4gICAgICAgIH0sIHRpbWVvdXQpO1xyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXHJcbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxyXG4gKlxyXG4gKiAgICAgIFEubmZhcHBseShGUy5yZWFkRmlsZSwgW19fZmlsZW5hbWVdKVxyXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAqICAgICAgfSlcclxuICpcclxuICovXHJcblEubmZhcHBseSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xyXG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XHJcbn07XHJcblxyXG5Qcm9taXNlLnByb3RvdHlwZS5uZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XHJcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzKTtcclxuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcclxuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cclxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBRLm5mY2FsbChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSlcclxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuICogfSlcclxuICpcclxuICovXHJcblEubmZjYWxsID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XHJcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XHJcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcclxufTtcclxuXHJcblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xyXG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcclxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XHJcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XHJcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxyXG4gKiB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXHJcbiAqIEBleGFtcGxlXHJcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXHJcbiAqIC50aGVuKGNvbnNvbGUubG9nKVxyXG4gKiAuZG9uZSgpXHJcbiAqL1xyXG5RLm5mYmluZCA9XHJcblEuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XHJcbiAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgd3JhcCBhbiB1bmRlZmluZWQgZnVuY3Rpb25cIik7XHJcbiAgICB9XHJcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcclxuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XHJcbiAgICAgICAgUShjYWxsYmFjaykuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUubmZiaW5kID1cclxuUHJvbWlzZS5wcm90b3R5cGUuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XHJcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XHJcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XHJcbiAgICByZXR1cm4gUS5kZW5vZGVpZnkuYXBwbHkodm9pZCAwLCBhcmdzKTtcclxufTtcclxuXHJcblEubmJpbmQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwIC8qLi4uYXJncyovKSB7XHJcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcclxuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XHJcbiAgICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUShib3VuZCkuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUubmJpbmQgPSBmdW5jdGlvbiAoLyp0aGlzcCwgLi4uYXJncyovKSB7XHJcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMCk7XHJcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XHJcbiAgICByZXR1cm4gUS5uYmluZC5hcHBseSh2b2lkIDAsIGFyZ3MpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxyXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXHJcbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xyXG4gKiB3aWxsIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cclxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcclxuICovXHJcblEubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXHJcblEubnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XHJcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xyXG59O1xyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXHJcblByb21pc2UucHJvdG90eXBlLm5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcclxuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MgfHwgW10pO1xyXG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcclxuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcclxuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcclxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxyXG4gKiBjYWxsYmFjaywgZm9yd2FyZGluZyB0aGUgZ2l2ZW4gdmFyaWFkaWMgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWRcclxuICogY2FsbGJhY2sgYXJndW1lbnQuXHJcbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxyXG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxyXG4gKiBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXHJcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXHJcbiAqL1xyXG5RLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcclxuUS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXHJcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcclxuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xyXG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xyXG4gICAgUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxufTtcclxuXHJcblByb21pc2UucHJvdG90eXBlLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcclxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxyXG5Qcm9taXNlLnByb3RvdHlwZS5uaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcclxuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xyXG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xyXG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogSWYgYSBmdW5jdGlvbiB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgYm90aCBOb2RlIGNvbnRpbnVhdGlvbi1wYXNzaW5nLXN0eWxlIGFuZFxyXG4gKiBwcm9taXNlLXJldHVybmluZy1zdHlsZSwgaXQgY2FuIGVuZCBpdHMgaW50ZXJuYWwgcHJvbWlzZSBjaGFpbiB3aXRoXHJcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcclxuICogZWxlY3RzIHRvIHVzZSBhIG5vZGViYWNrLCB0aGUgcmVzdWx0IHdpbGwgYmUgc2VudCB0aGVyZS4gIElmIHRoZXkgZG8gbm90XHJcbiAqIHBhc3MgYSBub2RlYmFjaywgdGhleSB3aWxsIHJlY2VpdmUgdGhlIHJlc3VsdCBwcm9taXNlLlxyXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlYmFjayBhIE5vZGUuanMtc3R5bGUgY2FsbGJhY2tcclxuICogQHJldHVybnMgZWl0aGVyIHRoZSBwcm9taXNlIG9yIG5vdGhpbmdcclxuICovXHJcblEubm9kZWlmeSA9IG5vZGVpZnk7XHJcbmZ1bmN0aW9uIG5vZGVpZnkob2JqZWN0LCBub2RlYmFjaykge1xyXG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcclxufVxyXG5cclxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xyXG4gICAgaWYgKG5vZGViYWNrKSB7XHJcbiAgICAgICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIG5vZGViYWNrKG51bGwsIHZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn07XHJcblxyXG5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIlEubm9Db25mbGljdCBvbmx5IHdvcmtzIHdoZW4gUSBpcyB1c2VkIGFzIGEgZ2xvYmFsXCIpO1xyXG59O1xyXG5cclxuLy8gQWxsIGNvZGUgYmVmb3JlIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcy5cclxudmFyIHFFbmRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcclxuXHJcbnJldHVybiBRO1xyXG5cclxufSk7XHJcbiJdfQ==
