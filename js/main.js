const KEYCODE_ENTER = 13; //useful keycode
const KEYCODE_SPACE = 32; //useful keycode
const KEYCODE_UP = 38; //useful keycode
const KEYCODE_LEFT = 37; //useful keycode
const KEYCODE_RIGHT = 39; //useful keycode
const KEYCODE_W = 87; //useful keycode
const KEYCODE_A = 65; //useful keycode
const KEYCODE_D = 68; //useful keycode
const KEYCODE_C = 67; //useful keycode
const KEYCODE_F = 70; //useful keycode
const KEYCODE_Q = 81; //useful keycode
const KEYCODE_S = 83; //useful keycode
const KEYCODE_T = 84; //useful keycode

var LevelAnimation = true;
var aNumber;
var levelAnimationType = '';

var Masonry; //Массив bблоков (Brick)
var mCount; //количество разбиваемых в игре
var bSkip; //анимация неразб. блока
var bW = 49; //ширина блока
var bH = 25; //высота блока
const amountH = 11;
const amountV = 22;

var blastWaves;

var Teleports;

var Bonuses;
var bFactor = 1; //коэффициент увеличения времени действия бонусов
//  Счетчики время действия бонусов уровня
var floor; //bonus Floor
var shield; //bonus Shield
var absent; //bonus Absent

var Pests; //массив вредителей (Pest)
var pestCount = 0; //текущще количество
var maxPestCount; //максимальное количество
var maxPestCount_KIM; //запоминалка для вост. количества после отмены бонуса absent
var timeToPest; //пауза до следуещего
var nextPest; //ticks до тех пор, пока не появится новый вредие
const PEST_TIME = 400;

var Balls; //Массив шаров (Ball)
var bColor; //цвет шара с бонусом
var bRadius = 9; //радиус шара
var bCount; //количество шаров в игре
var oldX, oldY;
var xResult;
var yResult;
var brickCollision;
const dColor = "#ff68f9"; //цвет шара по умолчанию

var currentLevel;
var lives; //количество "жизней"
var score; //текущий счет
var scoreThreshold;
var lTargetX, lTargetY; //цель молнии

var Platform; //Платформа (platformObject)
var pBonusColor = [];
var pDefaultColor = ["#343a42", "#343a42"];
var pCurrentColor = pDefaultColor;
var pDefaultWidth = 100;
var platformNoMove;
var px; //mouse paused

var Bullets; //Массив снарядов (Bullet)
var rof; //Rate of fire

var shift; //смещение платформы
var shiftSpeed; //скорость смещения

var canvas; //Канвас
var stage; //Сцена
var ctx; //Канвасконтекст для салюта

var messageField;
var Img = new Object();
var iAmFed;

//register key functions
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    stage = new createjs.Stage(canvas);

    messageField = new createjs.Text("Welcome: Click to play", "bold 24px Arial", "#000000");
    messageField.maxWidth = 1000;
    messageField.textAlign = "center";
    messageField.textBaseline = "middle";
    messageField.x = canvas.width / 2;
    messageField.y = canvas.height / 3;
    stage.addChild(messageField);

    var ua = window.navigator.userAgent.toLowerCase();
    if ((/trident/gi).test(ua) || (/msie/gi).test(ua)) {
        messageField.text = "IE not supported...";
        stage.update();
        return;
    }

    //good bonus images
    Img.live = new Image();
    Img.live.src = "image/live.png";
    Img.magnet = new Image();
    Img.magnet.src = "image/magnet.png";
    Img.ack = new Image();
    Img.ack.src = "image/ack.png";
    Img.triple = new Image();
    Img.triple.src = "image/triple.png";
    Img.floor = new Image();
    Img.floor.src = "image/floor.png";
    Img.enlarge = new Image();
    Img.enlarge.src = "image/enlarge.png";
    Img.ram = new Image();
    Img.ram.src = "image/ram.png";
    Img.absent = new Image();
    Img.absent.src = "image/absent.png";
    Img.slow = new Image();
    Img.slow.src = "image/slow.png";
    Img.next = new Image();
    Img.next.src = "image/next.png";
    Img.random_p = new Image();
    Img.random_p.src = "image/random+.png";

    //bad bonus images
    Img.shield = new Image();
    Img.shield.src = "image/shield.png";
    Img.death = new Image();
    Img.death.src = "image/death.png";
    Img.quick = new Image();
    Img.quick.src = "image/quick.png";
    Img.reduce = new Image();
    Img.reduce.src = "image/reduce.png";
    Img.pest = new Image();
    Img.pest.src = "image/pest.png";
    Img.nobonus = new Image();
    Img.nobonus.src = "image/nobonus.png";
    Img.anew = new Image();
    Img.anew.src = "image/anew.png";
    Img.invisibility = new Image();
    Img.invisibility.src = "image/invisibility.png";
    Img.random_m = new Image();
    Img.random_m.src = "image/random-.png";

    stage.canvas.style.cursor = "none";
    //stage.canvas.style.cursor = "crosshair";
    stage.update();

    watchRestart();
}

function tick(event) {

    var choice;

    if (LevelAnimation) {
        aNumber++;
        switch (levelAnimationType) {
            case "startLevel":
                if (aNumber > 100) {
                    stopLevelAnimation(levelAnimationType);
                    startLevelAnimation("p_born");
                } else {
                    stage.alpha = aNumber / 100;
                    stage.update();
                }
                break;
            case "p_born":
                if (aNumber > 100) {
                    stopLevelAnimation(levelAnimationType);
                } else {
                    platformResize(aNumber);
                    Platform.width = aNumber;
                    if (!(aNumber % 2))
                        Platform.x--;
                }
                break;
            case "thunderbolt":
                if (aNumber > 25) {
                    stopLevelAnimation(levelAnimationType);
                }
        }
        return;
    }

    if (lives > 0 && mCount > 0 && !event.paused) {
        if (messageField)
            stage.removeChild(messageField);
        Platform.x += shift;
        if (Platform.x < 0) {
            Platform.x = 0;
        } else if (Platform.x > stage.canvas.width - Platform.width) {
            Platform.x = stage.canvas.width - Platform.width;
        }


        if (bSkip === 0) {
            for (let msn in Masonry) {
                var m = Masonry[msn];
                if (m.type === "h")
                    m.color.style = "#e6e6fa";
            }
        }

        for (let b in Bullets) {
            var o = Bullets[b];
            if (!o || !o.active) {
                continue;
            }

            o.tick(event);

            if (o.x - o.h <= 0) {
                o.active = false;
                continue;
            }

            for (let msn in Masonry) {
                m = Masonry[msn];
                if (!m || !m.active) {
                    continue;
                }

                if (o.bulletCollision(m.x, m.y, bW, bH)) {
                    o.active = false;
                    stage.removeChild(o);
                    switch (m.type) {
                        case "b":
                        case "c":
                        case "d":
                        case "e":
                        case "f":
                        case "g":
                            m.strength--;
                            scoreUp(1);
                            document.getElementById('score').innerHTML = score;
                            if (m.strength === 0) {
                                m.color.style = "transparent";
                                m.active = false;
                                mCount--;
                                spotBonus(m.x, m.y, m.bonus);
                            } else {
                                m.color.style = mix(m.m_color, m.d_color, 25 * (m.strength - 1));
                            }
                            break;
                        case "h":
                            m.color.style = "#f2f2fc";
                            bSkip = 2; //перекрасить и пропустить n-1 тик
                            break;
                        case "i":
                            stage.removeChild(m);
                            scoreUp(1);
                            mCount--;
                            m.touching = true;
                            disruption();
                    }
                }
            } //Bullets for

            for (let pst in Pests) {
                var p = Pests[pst];
                if (!p || !p.active) {
                    continue;
                }

                if (p.hitRadius(o.x, o.y, 1.5, 3)) {
                    if (nextPest <= 0 && maxPestCount > 0 && pestCount < maxPestCount) {
                        var index = getPest();
                        Pests[index].floatOnScreen(canvas.width, canvas.height);
                        nextPest = timeToPest + timeToPest * Math.random();
                        pestCount++;
                    }
                    //remove
                    stage.removeChild(p);
                    p.active = false;
                    o.active = false;
                    stage.removeChild(o);
                    if (pestCount < maxPestCount) {
                        nextPest--;
                    }
                    // play sound
                    //createjs.Sound.play("break", {interrupt: createjs.Sound.INTERUPT_LATE, offset: 0.8});
                }
            }
        } //Pests for

        for (let b in Balls) {
            o = Balls[b];
            if (!o || !o.active) {
                continue;
            }
            oldX = o.x;
            oldY = o.y;

            o.tick(event);

            if (o.launched) {

                if (o.x - o.radius <= 0) {
                    o.x = o.radius + 1;
                    o.y = oldY;
                    o.vX = -o.vX;
                    o.inTeleport = false;
                    o.wallBlows++;
                    if (o.wallBlows >= 5) {
                        o.vY -= 1;
                    }
                    continue;
                }

                if (o.x + o.radius >= stage.canvas.width) {
                    o.x = stage.canvas.width - o.radius - 1;
                    o.y = oldY;
                    o.vX = -o.vX;
                    o.wallBlows++;
                    if (o.wallBlows >= 5) {
                        o.vY -= 1;
                    }
                    o.inTeleport = false;
                    continue;
                }

                if (o.y - o.radius <= 0) {
                    o.x = oldX;
                    o.y = o.radius + 1;
                    o.vY = -o.vY;
                    o.wallBlows = 0;
                    o.inTeleport = false;
                    continue;
                }

                brickCollision = 0;

                xResult = yResult = 0;
                for (let msn in Masonry) {
                    m = Masonry[msn];
                    if (!m || !m.active) {
                        continue;
                    }

                    if (isPointToRect(o.x, o.y, o.radius, m.x, m.y, bW, bH) && m.type === "h") {
                        m.touching = true;
                        brickCollision++;
                        break;
                    }

                }

                if (brickCollision === 0) {
                    for (let msn in Masonry) {
                        m = Masonry[msn];
                        if (!m || !m.active) {
                            continue;
                        }
                        if (isCircleToRect(o.x, o.y, o.radius, m.x, m.y, bW, bH)) {
                            if (m.type === "j" && o.inTeleport) {
                                continue;
                            }
                            m.touching = true;
                            if (isPointToRect(o.x, o.y, o.radius, m.x, m.y, bW, bH) && m.type === "h") {
                                break;
                            }
                            o.wallBlows = 0;
                            brickCollision++;
                            iAmFed = 0;
                        }
                    }
                }

                for (let msn in Masonry) {
                    m = Masonry[msn];
                    if (!m || !m.touching) {
                        continue;
                    }

                    if (o.bonus !== "ram") {
                        //вынимаем, отражаем //////////////////
                        o.ballBrickCollision(m.x, m.y, bW, bH, m.type);
                        ///////////////////////////////////////
                        switch (m.type) {
                            case "b":
                            case "c":
                            case "d":
                            case "e":
                            case "f":
                            case "g":
                                o.inTeleport = false;
                                if (o.bonus !== "shield") {
                                    m.strength--;
                                    scoreUp(1);
                                    document.getElementById('score').innerHTML = score;
                                    if (m.strength === 0) {
                                        m.color.style = "transparent";
                                        m.active = false;
                                        mCount--;
                                        if (o.bonus !== "nobonus") {
                                            spotBonus(m.x, m.y, m.bonus);
                                        }
                                    } else {
                                        m.color.style = mix(m.m_color, m.d_color, 25 * (m.strength - 1));
                                    }
                                }
                                break;
                            case "h":
                                o.inTeleport = false;
                                m.color.style = "#f2f2fc";
                                bSkip = 2; //перекрасить и пропустить n-1 тик
                                break;
                            case "i":
                                o.inTeleport = false;
                                stage.removeChild(m);
                                scoreUp(1);
                                mCount--;
                                disruption();
                                brickCollision = -1;
                                break;
                            case "j":
                                o.inTeleport = true;
                                var n = teleportIn();
                                if (n >= 0) {
                                    brickCollision = 0;
                                    o.x = Masonry[n].x + 25;
                                    o.y = Masonry[n].y + 12;
                                    do {
                                        var angle = Math.random() * (Math.PI * 2);
                                        o.vX = Math.sin(angle) * (25 + bRadius);
                                        o.vY = Math.cos(angle) * (15 + bRadius);
                                        var img_data = ctx.getImageData(o.x + o.vX, o.y + o.vY, 1, 1).data;
                                        var R = img_data[0];
                                        var G = img_data[1];
                                        var B = img_data[2];
                                    } while (R === 230 && G === 230 && B === 250)
                                    o.vX = Math.round(Math.sin(angle) * 5);
                                    o.vY = Math.round(Math.cos(angle) * 5);
                                }
                        }
                    } else {
                        if (m.type !== "j") {
                            if (m.type !== "h") {
                                scoreUp(1);
                                mCount--;
                            }
                            m.type = "b"; //разбиваемый
                            m.bonus = "none";
                            m.strength = 0;
                            m.color.style = "transparent";
                            m.active = false;
                        }
                    }
                    m.touching = false;
                }

                if (brickCollision > 0 && o.bonus !== "ram") {
                    if (xResult > yResult) {
                        o.vY = -o.vY;
                    } else if (xResult < yResult) {
                        o.vX = -o.vX;
                    } else if (xResult === yResult) {
                        o.vX = -o.vX;
                        o.vY = -o.vY;
                    }

                    choice = Math.random() >= 0.5;
                    if (choice)
                        o.vX += .05;
                    else
                        o.vX -= .05;

                    choice = Math.random() >= 0.5;
                    if (choice)
                        o.vY += .05;
                    else
                        o.vY -= .05;

                } else if (brickCollision < 0) {
                    o.vY = -o.vY * 1.2;
                    o.vX = -o.vX * 1.2;
                }

                if (o.ballPlatformCollision(Platform.x, Platform.y, Platform.width, 15)) {
                    //createjs.Ticker.paused = true;
                    iAmFed++;
                    if (iAmFed >= 15 && mCount === 1) {
                        for (let msn in Masonry) {
                            m = Masonry[msn];
                            if (!m || !m.active) {
                                continue;
                            }
                            lTargetX = m.x + (bW / 2) - 12;
                            lTargetY = m.y + bH;
                            stage.removeChild(m);
                        }
                        startLevelAnimation("thunderbolt");
                    }
                    switch (Platform.bonus) {
                        case "magnet":
                            o.launched = false;
                            o.ballPlatformOffset = o.x - Platform.x;
                            o.y = Platform.y - o.radius;
                            o.vX = 0;
                            o.vY = -5;
                            break;
                        case "none":
                            o.ballPlatformOffset = Math.round(Platform.width / 2);
                    }
                } else if (o.y + o.radius > stage.canvas.height && (floor === 0)) {
                    o.active = false;
                    bCount--;
                    stage.removeChild(o);
                    if (bCount <= 0) {
                        startLevelAnimation("p_born");
                        lives--;
                        document.getElementById('lives').innerHTML = lives;
                    }
                    //если есть сетка
                } else if (floor > 0 && (o.y + o.radius >= stage.canvas.height)) {
                    o.vY = -o.vY;
                }

            } else {
                if (Platform.x + o.ballPlatformOffset - o.radius <= 0) {
                    o.ballPlatformOffset = o.radius + 1;
                } else if (Platform.x + o.ballPlatformOffset + o.radius >= stage.canvas.width) {
                    o.ballPlatformOffset = Platform.width - o.radius - 1;
                }
                o.x = Platform.x + o.ballPlatformOffset;
                o.y = Platform.y - o.radius;
            }
            if (o.bonus !== "none") {
                if (o.bonusTime > 0) {
                    o.bonusTime--;
                    if (o.bonusTime < 101) {
                        switch (o.bonus) {
                            case "ram":
                            case "pest":
                            case "shield":
                            case "nobonus":
                            case "invisibility":
                                if (isD(o.bonusTime)) {
                                    o.color.style = dColor;
                                } else {
                                    o.color.style = bColor;
                                }
                                break;
                        }
                    }
                } else {
                    ballSetBonus(0, "none");
                }
            }
        } //Balls for

        for (let i = 0; i < Balls.length; i++) {
            if (Balls[i].active === false) {
                Balls.splice(i, 1);
                i--;
            }
        }

        if (nextPest <= 0 && maxPestCount > 0) {
            var index = getPest();
            Pests[index].floatOnScreen(canvas.width, canvas.height);
            nextPest = timeToPest + timeToPest * Math.random();
            pestCount++;
        } else {
            if (pestCount < maxPestCount) {
                nextPest--;
            }
        }

        //handle pests (nested in one loop to prevent excess loops)
        for (let pst in Pests) {
            o = Pests[pst];
            if (!o || !o.active) {
                continue;
            }

            if (o.hitRadius(Platform.x + Platform.width / 2, Platform.y + 7.5, Platform.width / 2, 7.5)) {
                if (nextPest <= 0 && maxPestCount > 0 && pestCount < maxPestCount) {
                    var index = getPest();
                    Pests[index].floatOnScreen(canvas.width, canvas.height);
                    nextPest = timeToPest + timeToPest * Math.random();
                    pestCount++;
                }
                //remove
                stage.removeChild(o);
                o.active = false;
            }

            //handle pest movement and looping
            if (outOfBounds(o, o.bounds)) {
                placeInBounds(o, o.bounds);
            }

            o.tick(event);

            if (o || o.active) {

                for (let b in Balls) {
                    var p = Balls[b];
                    if (!p || !p.active) {
                        continue;
                    }

                    if (o.hitRadius(p.x, p.y, p.radius, p.radius)) {
                        if (nextPest <= 0 && maxPestCount > 0 && pestCount < maxPestCount) {
                            var index = getPest();
                            Pests[index].floatOnScreen(canvas.width, canvas.height);
                            nextPest = timeToPest + timeToPest * Math.random();
                            pestCount++;
                        }
                        if (p.bonus !== "pest") {
                            //remove
                            stage.removeChild(o);
                            o.active = false;
                            if (pestCount < maxPestCount) {
                                nextPest--;
                            }
                        }
                        // play sound
                        //createjs.Sound.play("break", {interrupt: createjs.Sound.INTERUPT_LATE, offset: 0.8});

                        //ускоряем шарик
                        p.vX *= 1.05;
                        p.vY *= 1.05;

                        if (p.bonus != "ram") {
                            p.vY = -p.vY;
                            p.vX = -p.vX;
                        }
                        scoreUp(2);
                        document.getElementById('score').innerHTML = score;
                    }

                }
            }
        }

        for (let i = 0; i < Pests.length; i++) {
            if (Pests[i].active === false) {
                Pests.splice(i, 1);
                i--;
            }
        }
        pestCount = Pests.length;

        for (let i = 0; i < Bullets.length; i++) {
            if (Bullets[i].active === false) {
                Bullets.splice(i, 1);
                i--;
            }
        }

        for (let b in blastWaves) {
            o = blastWaves[b];
            if (!o || !o.active) {
                continue;
            }
            o.tick(event);
        }

        for (let bns in Bonuses) {
            o = Bonuses[bns];
            if (!o || !o.active) {
                continue;
            }
            if (o.platformBonusCollision(Platform.x, Platform.y, Platform.width)) {
                var bonusList = ["live", "slow", "magnet", "ack", "triple", "ram", "absent", "next", "enlarge",
                    "floor", "", "", "random_p", "death", "quick", "shield", "pest", "reduce", "nobonus",
                    "anew", "invisibility", "", "", "", "", "random_m"
                ];
                if (o.gift === "random_p")
                    o.gift = bonusList[randomInteger(0, 9)];
                else if (o.gift === "random_m")
                    o.gift = bonusList[randomInteger(13, 20)];
                switch (o.gift) {
                    case "live":
                        scoreUp(1);
                        platformSetBonus("live");
                        break
                    case "slow":
                        scoreUp(1);
                        ballSetBonus(0, "slow");
                        break;
                    case "magnet":
                        scoreUp(1);
                        platformSetBonus("magnet");
                        break;
                    case "ack":
                        scoreUp(1);
                        platformSetBonus("ack");
                        break;
                    case "enlarge":
                        scoreUp(1);
                        platformSetBonus("enlarge");
                        break;
                    case "ram":
                        scoreUp(1);
                        ballSetBonus(Balls[0], "ram");
                        break;
                    case "absent":
                        scoreUp(1);
                        maxPestCount = 0;
                        absent = 1000 * bFactor;
                        for (let pst in Pests) {
                            o = Pests[pst];
                            stage.removeChild(o);
                            o.active = false;
                        }
                        pestCount = 0;
                        break;
                    case "triple":
                        scoreUp(1);
                        ballSetBonus(Balls[Balls.length - 1], "triple");
                        break;
                    case "next":
                        currentLevel++;
                        startLevel(currentLevel);
                        break;
                    case "floor":
                        scoreUp(1);
                        floor = 1000 * bFactor;
                        document.getElementById('gameCanvas').style.borderBottomColor = "#464e58";
                        break;
                    case "death":
                        scoreUp(100);
                        platformSetBonus("death");
                        break
                    case "anew":
                        scoreUp(1);
                        startLevel(currentLevel);
                        break;
                    case "quick":
                        scoreUp(10);
                        ballSetBonus(0, "quick");
                        break;
                    case "pest":
                        scoreUp(2);
                        ballSetBonus(0, "pest");
                        break;
                    case "nobonus":
                        scoreUp(2);
                        ballSetBonus(0, "nobonus");
                        break;
                    case "shield":
                        scoreUp(10);
                        ballSetBonus(0, "shield");
                        break;
                    case "reduce":
                        scoreUp(10);
                        platformSetBonus("reduce");
                        break;
                    case "invisibility":
                        scoreUp(50);
                        ballSetBonus(0, "invisibility");
                        break;
                }
                document.getElementById('score').innerHTML = score;
                o.gift = "";
                o.active = false;
                stage.removeChild(o);
            } else if (o.y > stage.canvas.height + 15) {
                o.active = false;
            }
            o.tick(event);
        }

        for (let i = 0; i < Bonuses.length; i++) {
            if (Bonuses[i].active === false) {
                Bonuses.splice(i, 1);
                i--;
            }
        }

        if (Platform.bonusTime > 0) {
            if (Platform.bonus === "ack") {
                if (rof === 18) { //количество тиков между выстрелами
                    var xx = Platform.x;
                    var yy = Platform.y - 6;
                    startBullet(xx + 15, yy);
                    startBullet(xx + Platform.width - 15, yy);
                    rof = 0;
                } else {
                    rof++;
                }
            }
            Platform.bonusTime--;
            if (Platform.bonusTime < 101) {
                switch (Platform.bonus) {
                    case "magnet":
                    case "ack":
                        if (isD(Platform.bonusTime)) {
                            Platform.gradient.linearGradient(pBonusColor, [0.5, 0.5], 0, 0, Platform.width, 15);
                        } else {
                            Platform.gradient.linearGradient(pDefaultColor, [0.5, 0.5], 0, 0, Platform.width,
                                15);
                        }
                        break;
                }
            }
        } else {
            platformSetBonus("none");
        }

        if (floor > 0) {
            floor--;
            if (floor < 101) {
                if (isD(floor))
                    document.getElementById('gameCanvas').style.borderBottomColor = "#f7f9fb";
                else
                    document.getElementById('gameCanvas').style.borderBottomColor = "#000";
            }
        } else {
            document.getElementById('gameCanvas').style.borderBottomColor = "#f7f9fb";
        }

        if (absent > 0) {
            absent--;
        } else {
            maxPestCount = maxPestCount_KIM;
        }
        //clearConsole();

        if (bSkip > 0)
            bSkip--;
    } else if (lives < 1) {
        stage.removeChild(Balls[0]);
        stage.removeChild(Platform);
        messageField.text = "Game Over";
        stage.addChild(messageField);
    } else if (mCount === 0) {
        currentLevel++;
        if (currentLevel >= Levels.length) {
            platformSetBonus("none");
            stage.removeAllChildren();
            var controller = new Controller();
            controller.init();
            requestAnimationFrame(controller.animation);
            document.getElementById('c_message').style.display = "block";
            createjs.Ticker.removeEventListener("tick", tick);
        } else
            startLevel(currentLevel);
    } else {
        messageField.text = "Game Pause";
        stage.addChild(messageField);

    }
    stage.update(event);
}

function scoreUp(n) {
    score += n;
    if (score >= scoreThreshold) {
        lives++;
        scoreThreshold += 500;
        document.getElementById('lives').innerHTML = lives;
    }
}

function isD(num) {
    return num % 8;
} //for platformBonus check

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

function mix(color_1, color_2, weight) {
    function d2h(d) {
        return d.toString(16);
    } // convert a decimal value to hex
    function h2d(h) {
        return parseInt(h, 16);
    } // convert a hex value to decimal 

    weight = (typeof (weight) !== 'undefined') ? weight : 50; // set the weight to 50%, if that argument is omitted

    var color = "#";
    color_1 = String(color_1).replace("#", "");
    color_2 = String(color_2).replace("#", "");
    for (let i = 0; i <= 5; i += 2) { // loop through each of the 3 hex pairs—red, green, and blue
        var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
            v2 = h2d(color_2.substr(i, 2)),
            // combine the current pairs from each source color, according to the specified weight
            val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)));
        while (val.length < 2) {
            val = '0' + val;
        } // prepend a '0' if val results in a single digit

        color += val; // concatenate val to our new color string
    }

    return color; // PROFIT!
}

function thunderbolt() {

    function lightning(gameTime, start, end) {
        var seed;

        function random() {
            var x = Math.sin(seed += 1000) * 10000;
            return x - Math.floor(x);
        }

        gameTime = Math.round(gameTime / 25);
        var variance = (Math.max(Math.abs(start[0] - end[0]), Math.abs(start[1] - end[1])));
        var points = [start];
        var pointCount = variance / 10;
        seed = gameTime;
        for (let i = 0; i < pointCount + 1; i++) {
            let nextPoint = [
                start[0] + (end[0] - start[0]) * (i / pointCount),
                start[1] + (end[1] - start[1]) * (i / pointCount),
            ];
            nextPoint[0] += random() * Math.sqrt(variance);
            nextPoint[1] += random() * Math.sqrt(variance);
            points.push(nextPoint);
        }
        return points;
    }

    function drawLightning(points, final, aura, a) {
        var s = new createjs.Shape();
        var g = s.graphics;

        g.setStrokeStyle(14).beginStroke("rgba(39, 0, 255, 0.1)");
        g.moveTo(points[0], points[1]);
        points.forEach(point => g.lineTo(point[0], point[1]));

        if (aura) {
            g.setStrokeStyle(14).beginStroke("rgba(39, 0, 255, 0.3)");
            points.forEach(point => g.lineTo(point[0], point[1]));
            return;
        }

        g.setStrokeStyle(5).beginStroke("rgba(158,0,255,0.2)");
        points.forEach(point => g.lineTo(point[0], point[1]));
        g.setStrokeStyle(3);
        points.forEach(point => g.lineTo(point[0], point[1]));
        g.setStrokeStyle(1.5).beginStroke("rgba(255,255,255,.5)");
        points.forEach(point => g.lineTo(point[0], point[1]));
        if (final !== false) {
            g.setStrokeStyle(0.5).beginStroke("#fff");
            points.forEach(point => g.lineTo(point[0], point[1]));
        }
        g.closeStroke;
        s.alpha = a;
        stage.addChild(s);
        stage.update;
    }

    var srcPoint = [Platform.x + Math.round(Platform.width / 2), Platform.y - 25];
    var destPoint = [lTargetX, lTargetY];

    // base hue
    var path = lightning(Date.now(), srcPoint, destPoint);
    drawLightning(lightning(Date.now(), srcPoint, destPoint), true, true, 1);
    // ghosts
    drawLightning(lightning(Date.now() - 25, srcPoint, destPoint), true, false, 0.25);
    drawLightning(lightning(Date.now() + 25, srcPoint, destPoint), true, false, 0.25);
    // main lightning
    drawLightning(path, true, false, 1);
}

function handleKeyDown(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event;
    }
    switch (e.keyCode) {
        case KEYCODE_C: //for test
            platformSetBonus("magnet");
            return false;
        case KEYCODE_F: //for test
            platformSetBonus("ack");
            return false;
        case KEYCODE_Q: //for test
            ballSetBonus(Balls[Balls.length - 1], "ram");
            return false;
        case KEYCODE_T: //for test
            ballSetBonus(Balls[Balls.length - 1], "triple");
            return false;
        case KEYCODE_A:
        case KEYCODE_LEFT:
            if (!platformNoMove) {
                if (Platform.x > 0) {
                    shiftSpeed = Math.abs(shiftSpeed);
                    shiftSpeed += 1;
                    shift = -shiftSpeed;
                } else {
                    shift = 0;
                }
            }

            return false;
        case KEYCODE_D:
        case KEYCODE_RIGHT:
            if (!platformNoMove) {
                if (Platform.x < stage.canvas.width - Platform.width) {
                    shiftSpeed = Math.abs(shiftSpeed);
                    shiftSpeed += 1;
                    shift = shiftSpeed;
                } else {
                    shift = 0;
                }
            }
        case KEYCODE_W:
        case KEYCODE_UP:

            return false;
        case KEYCODE_ENTER:
            /**/
            if (lives === 0)
                restart();
            return false;
    }
}


function handleKeyUp(e) {
    //cross browser issues exist
    if (!e) {
        var e = window.event;
    }
    switch (e.keyCode) {
        case KEYCODE_SPACE:
            createjs.Ticker.paused = !createjs.Ticker.paused;
            platformNoMove = createjs.Ticker.paused;
            break;
        case KEYCODE_A:
        case KEYCODE_LEFT:
            shiftSpeed = 4;
            shift = 0;
            break;
        case KEYCODE_D:
        case KEYCODE_RIGHT:
            shiftSpeed = 4;
            shift = 0;
            break;
        case KEYCODE_W:
        case KEYCODE_UP:
            if (!platformNoMove) {
                for (let b in Balls) {
                    var p = Balls[b];
                    p.launched = true;
                }
            }
            break;
    }
}

function startLevelAnimation(type) {
    LevelAnimation = true;
    aNumber = 0;
    switch (type) {
        case "startLevel":
            levelAnimationType = "startLevel";
            stage.alpha = 0;
            break;
        case "p_born":
            platformSetBonus("none");
            platformNoMove = true;
            levelAnimationType = "p_born";
            platformResize(0);
            Platform.width = 0;
            Platform.x = stage.canvas.width / 2;
            stage.update();
            break;
        case "thunderbolt":
            platformNoMove = true;
            levelAnimationType = "thunderbolt";
            thunderbolt();
    }
}

function stopLevelAnimation(type) {
    LevelAnimation = false;
    levelAnimationType = "";
    switch (type) {
        case "startLevel":
            aNumber = 100;
            stage.width = 1;
            Platform.alpha = 1;
            platformNoMove = false;
            break;
        case "p_born":
            aNumber = pDefaultWidth;
            platformResize(pDefaultWidth);
            Platform.width = pDefaultWidth;
            startBall(Platform.x, Platform.y, false);
            platformNoMove = false;
            break;
        case "thunderbolt":
            currentLevel++;
            startLevel(currentLevel);
    }

}

function blast(i) {
    var arr = [i - 12, i - 11, i - 10, i - 1, i + 1, i + 10, i + 11, i + 12];
    for (let j = 0; j < 8; j++) {
        var m = Masonry[arr[j]];
        if (m && m.active) {
            switch (m.type) {
                case "b":
                case "c":
                case "d":
                case "e":
                case "f":
                case "g":
                    scoreUp(1);
                    mCount--;
                    m.strength = 0;
                    m.color.style = "transparent";
                    m.active = false;
                    m.touching = false;
                    spotBonus(m.x, m.y, m.bonus);
                    document.getElementById('score').innerHTML = score;
                    break;
                case "h":
                    m.color.style = "#f2f2fc";
                    bSkip = 2; //перекрасить и пропустить n-1 тик
                    break;
                case "i":
                    stage.removeChild(m);
                    scoreUp(1);
                    mCount--;
                    m.touching = true;
                    disruption();
                    brickCollision = -1;
            }
        }

    }
}

function launch() {
    for (let b in Balls) {
        var p = Balls[b];
        p.launched = true;
    }
}

function teleportIn() {
    function indexOf() {
        for (let i = 0; i < Masonry.length; i++) {
            if (Masonry[i] && Masonry[i].type === "j" && Masonry[i].touching === true)
                return i;
        }
        return -1;
    }
    var j = indexOf();
    var r;
    if (j !== -1) {
        Masonry[j].touching = false;
        do {
            r = randomInteger(0, Teleports.length - 1);
        } while (j === Teleports[r]);
        return Teleports[r];
    } else
        return -1;
}

function disruption() {
    function indexOf() {
        for (let i = 0; i < Masonry.length; i++) {
            if (Masonry[i] && Masonry[i].type === "i" && Masonry[i].touching === true && Masonry[i].active ===
                true)
                return i;
        }
        return -1;
    }
    var j = indexOf();
    if (j !== -1) {
        Masonry[j].active = false;
        Masonry[j].touching = false;
        startblastWave(Masonry[j].x, Masonry[j].y);
        blast(j);
    }
}

function spotBonus(x, y, code) {
    var bn_xShift = x + (bW / 2) - 12;
    var bn_yShift = y;
    switch (code) {
        case "a": //good \/
            getBonus(bn_xShift, bn_yShift, "live");
            break;
        case "b":
            getBonus(bn_xShift, bn_yShift, "slow");
            break;
        case "c":
            getBonus(bn_xShift, bn_yShift, "magnet");
            break;
        case "d":
            getBonus(bn_xShift, bn_yShift, "ack");
            break;
        case "e":
            getBonus(bn_xShift, bn_yShift, "triple");
            break;
        case "f":
            getBonus(bn_xShift, bn_yShift, "ram");
            break;
        case "g":
            getBonus(bn_xShift, bn_yShift, "absent");
            break;
        case "h":
            getBonus(bn_xShift, bn_yShift, "next");
            break;
        case "i":
            getBonus(bn_xShift, bn_yShift, "enlarge");
            break;
        case "j":
            getBonus(bn_xShift, bn_yShift, "floor");
            break;
        case "m":
            getBonus(bn_xShift, bn_yShift, "random_p");
            break;
        case "n": //bad \/
            getBonus(bn_xShift, bn_yShift, "death");
            break;
        case "o":
            getBonus(bn_xShift, bn_yShift, "quick");
            break;
        case "q":
            getBonus(bn_xShift, bn_yShift, "shield");
            break;
        case "p":
            getBonus(bn_xShift, bn_yShift, "pest");
            break;
        case "r":
            getBonus(bn_xShift, bn_yShift, "reduce");
            break;
        case "s":
            getBonus(bn_xShift, bn_yShift, "nobonus");
            break
        case "t":
            getBonus(bn_xShift, bn_yShift, "anew");
            break;
        case "u":
            getBonus(bn_xShift, bn_yShift, "invisibility");
            break;
        case "z":
            getBonus(bn_xShift, bn_yShift, "random_m");
    }
}

function startLevel(num) { /*****************************************************************************************/
    var i = 0;
    var j = 0;
    var t, b, s;
    var cy = 1;
    var cx;
    var o;
    var subStr;
    var strIndex = 0;
    const numberOfBricks = 11 * 22;

    startLevelAnimation("startLevel");

    /* Сброс глобальных */
    Pests = [];
    nextPest = timeToPest * 2;
    maxPestCount = 6;
    maxPestCount_KIM = maxPestCount;

    xyz = 0;

    Balls = [];
    bCount = 0;
    bSkip = 0;

    Masonry = [];
    mCount = 0;

    blastWaves = [];

    Teleports = [];

    Bonuses = [];

    Bullets = [];

    shift = 0;
    shiftSpeed = 5;

    floor = 0; //bonus floor
    absent = 0; //bonus absent

    iAmFed = 0;

    createjs.Ticker.paused = true;
    stage.clear();
    stage.removeAllChildren();

    for (let y = 0; y < amountV; y++) {
        cx = 1;
        for (let x = 0; x < amountH; x++) {
            subStr = Levels[num].substring(strIndex, strIndex + 3);
            t = subStr.substring(0, 1);
            s = subStr.substring(1, 2);
            o = Masonry[getBrick(t, s)];
            o.x = cx;
            o.y = cy;
            o.type = t;
            o.strength = s;
            o.bonus = subStr.substring(2, 3);
            if (t !== "a" && t !== "h" && t !== "j")
                mCount++;
            if (t === "j") {
                Teleports[j] = i; //массив с порядковыми номерами телепортов
                j++;
            }
            strIndex += 3;
            cx += bW + 1;
            i++;
        }
        cy += bH + 1;
    }
    //вначале всё активируем, для отрисовки и формирования массива, потом снимаем активацию с невидимых блоков (тип "а") 
    for (let y = 0; y < numberOfBricks; y++) {
        if (Masonry[y].type === "a")
            Masonry[y].active = false;
    }
    Platform = new platformObject(pDefaultWidth);

    platformSetBonus("none");
    stage.addChild(Platform);

    stage.on("stagemousedown", function () {
        if (platformNoMove)
            return;
        launch();
    });

    stage.on("stagemousemove", function (evt) {
        document.getElementById('mx').innerHTML = evt.rawX;
        document.getElementById('my').innerHTML = ~~evt.rawY;
        if (platformNoMove)
            return;
        Platform.x = evt.rawX - Platform.width / 2;
    });

    document.getElementById('level').innerHTML = Number(num) + 1;

    platformNoMove = true;
    Platform.alpha = 0;

    createjs.Ticker.paused = false;
    stage.update();
}

function startLevelNumber() {
    var n = document.getElementById('n_level').value;
    if (n >= 0 && n < Levels.length) {
        currentLevel = n;
    }
    startLevel(currentLevel);
}


function watchRestart() {
    //watch for clicks
    stage.addChild(messageField);
    stage.update(); //update the stage to show text
    canvas.onclick = handleClick;
    document.getElementById('gct').style.display = "block";
}

function handleClick() {
    //prevent extra clicks and hide text
    canvas.onclick = null;
    stage.removeChild(messageField);

    // indicate the player is now on screen
    //createjs.Sound.play("begin");
    document.getElementById('gct').style.display = "none";
    restart();
}

function restart() {
    //hide anything on stage and show the score
    stage.removeAllChildren();
    stage.update();
    //scoreField.text = (0).toString();
    //stage.addChild(scoreField);

    //new arrays to dump old data

    //create the player
    lives = 8;
    score = 0;
    scoreThreshold = 500;
    currentLevel = 0;

    //log time untill values
    timeToPest = PEST_TIME;

    createjs.Ticker.interval = 40;
    createjs.Ticker.framerate = 80;
    startLevel(currentLevel);
    //start game timer
    if (!createjs.Ticker.hasEventListener("tick")) {
        createjs.Ticker.addEventListener("tick", tick);
    }
    document.getElementById('lives').innerHTML = lives;
    document.getElementById('score').innerHTML = score;
    document.getElementById('dashboard').style.opacity = "1";
    stage.mouseMoveOutside = true;
    messageField.y = canvas.height / 2;
}
