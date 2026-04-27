/** @type {HTMLDivElement} */
let score = /** @type {HTMLDivElement} */ (document.getElementById("score"));

/** @type {HTMLDivElement} */
let gameOverScreen = /** @type {HTMLDivElement} */ (document.getElementById("go"));

/** @type {HTMLButtonElement} */
let gameModeEasyBtn = /** @type {HTMLButtonElement} */ (document.getElementById("easy"));

/** @type {HTMLButtonElement} */
let gameModeMediumBtn = /** @type {HTMLButtonElement} */ (document.getElementById("medium"));

/** @type {HTMLButtonElement} */
let gameModeHardBtn = /** @type {HTMLButtonElement} */ (document.getElementById("hard"));

/** @type {HTMLDivElement} */
let gameModeHardHTP = /** @type {HTMLDivElement} */ (document.getElementById("howtoplay-walls"));

/** @type {HTMLDivElement} */
let htp = /** @type {HTMLDivElement} */ (document.getElementById("htp"));

/** @type {HTMLSpanElement} */
let hs = /** @type {HTMLSpanElement} */ (document.getElementById("hs"));

/** @type {HTMLCanvasElement} */
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));

/** @type {CanvasRenderingContext2D} */
let context = canvas.getContext("2d");

let gameSpeed = 4;
let pointsMultiplayer = 1;
let gameMode = "easy";

let bw = 400;
let bh = 400;
let p = 1;
let size = 20;

/** @type {number | undefined} */
let update;

let snake = [{ x: 10, y: 10 }];
let snakeLength = 1;
let points = (snakeLength - 1) * pointsMultiplayer;

let speedX = 1;
let speedY = 0;

let head = snake[0];

let newHead = {
    x: head.x + speedX,
    y: head.y + speedY
};

let foodX = 0;
let foodY = 0;

let walls = [];

let gameOver = false;
let gameStarted = false;

function startGame() {
    if (gameStarted === false) {
        gameStarted = true;
        gameModeBtnDisabled(true);

        reset();

        document.addEventListener("keydown", changeDirection);
        update = setInterval(updateSnake, 1000 / gameSpeed);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function gameModeBtnDisabled(value) {
    gameModeEasyBtn.disabled = value;
    gameModeMediumBtn.disabled = value;
    gameModeHardBtn.disabled = value;
}

function displayPoints() {
    score.innerHTML = "<b>" + points + "</b><span class='score-multiplayer'>x " + pointsMultiplayer + "</span>";
}

function addPoints() {
    displayPoints();
    setHighScore();
}

function setHighScore() {
    let highscore = Number(localStorage.getItem("highscore")) || 0;

    if (points > highscore) {
        localStorage.setItem("highscore", points.toString());
        hs.innerHTML = localStorage.getItem("highscore");
    }
    
}

function displayGameOverScreen() {
    gameOver = true;
    gameOverScreen.innerHTML = "Game Over"
    gameOverScreen.style.animation = "fadeIn 0.2s";

    gameOverScreen.addEventListener("animationend", () => {
        gameOverScreen.style.opacity = "1";
    }, { once: true });

    gameModeBtnDisabled(false);
    gameStarted = false;
}

function hideGameOverScreen() {
    gameOverScreen.style.animation = "fadeOut 0.2s";

    gameOverScreen.addEventListener("animationend", () => {
    gameOverScreen.style.opacity = "0";
    }, { once: true });
    gameOver = false;

    gameModeBtnDisabled(true);
}

function gameOverConditions() {
    for (let i = 1; i < snake.length; i++) {
        if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
            displayGameOverScreen();
            return;
        }
    }

    for (let wall of walls) {
        if (gameMode === "hard") {
            if (newHead.x === wall.x && newHead.y === wall.y) {
                displayGameOverScreen();
                return;
            }
        }
    }
}

function drawBoard() {
    for (let x = 0; x <= bw; x += size) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    for (let x = 0; x <= bh; x += size) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    drawBoard();
    let highscore = localStorage.getItem("highscore");

    hs.innerHTML = highscore !== null ? highscore : "0";
});

function updateSnake() {
    if (gameOver) return;

    head = snake[0];

    newHead = {
        x: head.x + speedX,
        y: head.y + speedY
    };

    const maxX = bw / size - 2;
    const maxY = bh / size - 2;

    if (newHead.x > maxX) newHead.x = 0;
    else if (newHead.x < 0) newHead.x = maxX;

    if (newHead.y > maxY) newHead.y = 0;
    else if (newHead.y < 0) newHead.y = maxY;

    snake.unshift(newHead);

    if (newHead.x === foodX && newHead.y === foodY) {
        collideWithFood();
    }

    gameOverConditions();

    if (snake.length > snakeLength) {
        let tail = snake.pop();
        context.fillStyle = "white";
        context.fillRect(tail.x * size, tail.y * size, size, size);
    }
    
    context.fillStyle = "rgb(137,36,36)";

    for (let segment of snake) {
        drawSegment(segment.x, segment.y);
    }
}

function drawSegment(x, y) {
    context.beginPath();
    context.roundRect(x * size, y * size, size, size, 4);
    context.fill();
}

function spawnFood() {
    let collision = true;

    while (collision) {
        foodX = getRandomInt(19);
        foodY = getRandomInt(19);

        collision = false;

        for (let i = 0; i < snake.length; i++) {
            let segment = snake[i];

            if (segment.x === foodX && segment.y === foodY) {
                collision = true;
            }
        }

        for (let i = 0; i < walls.length; i++) {
            let wall = walls[i];

            if (wall.x === foodX && wall.y === foodY) {
                collision = true;
            }
        }
    }

    context.fillStyle = "rgb(60, 137, 36)";
    drawSegment(foodX, foodY);
}

function collideWithFood() {
    spawnFood();
    snakeLength++;
    points = (snakeLength - 1) * pointsMultiplayer;
    addPoints();

    if (gameMode === "hard") {
        spawnWalls();
    }
}


function spawnWalls() {
    let collision = true;
    let wallX, wallY;

    while (collision) {
        wallX = getRandomInt(19);
        wallY = getRandomInt(19);

        collision = false;

        for (let i = 0; i < snake.length; i++) {
            let segment = snake[i];

            if (segment.x === wallX && segment.y === wallY) {
                collision = true;
            }
        }

        for (let i = 0; i < walls.length; i++) {
            let wall = walls[i];

            if (wall.x === wallX && wall.y === wallY) {
                collision = true;
            }
        }

        if (wallX === foodX && wallY === foodY) {
            collision = true;
        }
    }

    walls.push({ x: wallX, y: wallY });

    context.fillStyle = "rgb(0, 0, 0)";
    drawSegment(wallX, wallY);
}
function reset() {
    clearInterval(update);

    walls = [];
    context.fillStyle = "white";
    context.fillRect(0, 0, 400, 400);

    snake = [{ x: 10, y: 10 }];
    snakeLength = 1;
    points = 0;
    speedX = 1;
    speedY = 0;

    displayPoints();

    spawnFood();

    hideGameOverScreen();
}

function displayHTP(value) {
    if (value === false) {
        gameModeHardHTP.style.animation = "fadeOut 0.2s";

        gameModeHardHTP.addEventListener("animationend", () => {
        gameModeHardHTP.style.opacity = "0";
        }, { once: true });

        htp.style.animation = "paddingHTP0 0.2s";

        htp.addEventListener("animationend", () => {
        htp.style.paddingBottom = "0";
        }, { once: true });
    } else {
        htp.style.animation = "paddingHTP15 0.2s";

        htp.addEventListener("animationend", () => {
        htp.style.paddingBottom = "15px";
        }, { once: true });

        gameModeHardHTP.style.animation = "fadeIn 0.2s";

        gameModeHardHTP.addEventListener("animationend", () => {
        gameModeHardHTP.style.opacity = "1";
        }, { once: true });
    }

}

let htpDisplayed = false;

function setGameModeParams(gs, pm, mode) {
    gameModeEasyBtn.classList.remove("active");
    gameModeMediumBtn.classList.remove("active");
    gameModeHardBtn.classList.remove("active");
    if (htpDisplayed === true) {
        displayHTP(false);
    }
    

    gameSpeed = gs;
    pointsMultiplayer = pm;
    if (mode == "easy") {
        gameModeEasyBtn.classList.add("active");
    } else if (mode == "medium") {
        gameModeMediumBtn.classList.add("active");
    } else {
        gameModeHardBtn.classList.add("active");
        displayHTP(true);
        htpDisplayed = true;
    }
    
}

function setGameMode(mode) {
    if (mode === "easy") {
        setGameModeParams(4, 1, mode);
    } else if (mode === "medium") {
        setGameModeParams(7, 2, mode);
    } else {
        setGameModeParams(10, 3, mode);
    }

    displayPoints();

    gameMode = mode;
}

function changeDirection(e) {
    if (e.code === "ArrowUp" && speedY !== 1) {
        speedX = 0;
        speedY = -1;
    } else if (e.code === "ArrowDown" && speedY !== -1) {
        speedX = 0;
        speedY = 1;
    } else if (e.code === "ArrowLeft" && speedX !== 1) {
        speedX = -1;
        speedY = 0;
    } else if (e.code === "ArrowRight" && speedX !== -1) {
        speedX = 1;
        speedY = 0;
    }
}

// LISTENERS

document.getElementById("start").addEventListener("click", startGame);

document.getElementById("go").addEventListener("click", startGame);


document.getElementById("easy").addEventListener("click", function() {
    setGameMode("easy");
});

document.getElementById("medium").addEventListener("click", function() {
    setGameMode("medium");
});

document.getElementById("hard").addEventListener("click", function() {
    setGameMode("hard");
});