(function (window) {

    function Ball(c, r) {
        this.Shape_constructor(); // super call
        this.activate(c, r);
    }

    var p = createjs.extend(Ball, createjs.Shape);

    // public properties:
    p.radius; //visual radial size
    p.bonus;
    p.bonusTime;
    p.size; //size value itself


    p.vX; //velocity X
    p.vY; //velocity Y

    p.active; //is it active
    p.launched;

    p.inTeleport;
    p.ballPlatformOffset;
    p.wallBlows;


    // public methods:

    //handle drawing a Ball
    p.getShape = function (c, r) {
        //setup
        this.graphics.clear();
        //var mix_color = mix('ffffff', c, 90);
        //this.graphics.beginRadialGradientFill([mix_color, c], [0, .9], -3, -3, 0, -5, -5, 12);
        this.color = this.graphics.beginFill(dColor).command;
        this.graphics.drawCircle(0, 0, r);
    };
    //handle reinit for poolings sake
    p.activate = function (c, r) {
        this.getShape(c, r);
        this.radius = r;
        this.active = true;
        this.launched = false;
        oldX = this.x;
        oldY = this.y;
    };

    p.tick = function (event) {
        this.x += this.vX;
        this.y += this.vY;
    };

    p.ballBrickCollision = function (tX, tY, tW, tH, type) {
        var k, m, nx, ny, yy;
        if (type === "j")
            return;
        oldX = Math.round(oldX);
        oldY = Math.round(oldY);
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        if (isCircleToRect(this.x, this.y, this.radius, tX, tY, tW, tH)) {
            if (oldX !== this.x) {
                m = (oldX * this.y - oldY * this.x) / (oldX - this.x);
            } else
                m = 0;
            k = (oldY - m) / oldX;

            nx = this.x;
            ny = this.y;

            if (oldX > nx) {
                while (canvas.width - this.radius >= nx) {
                    ny = k * nx + m;
                    if (!isCircleToRect(nx, ny, this.radius, tX, tY, tW, tH)) {
                        break;
                    }
                    nx++;
                }
            } else if (oldX < nx) {
                while (this.radius <= nx) {
                    ny = k * nx + m;
                    if (!isCircleToRect(nx, ny, this.radius, tX, tY, tW, tH)) {
                        break;
                    }
                    nx--;
                }
            } else if (oldX === nx) {
                yy = -1 * Math.sign(this.vY);
                while (canvas.height - this.radius >= ny && this.radius <= ny) {
                    ny += yy;
                    if (!isCircleToRect(nx, ny, this.radius, tX, tY, tW, tH)) {
                        break;
                    }
                }
            }
            this.x = nx;
            this.y = ny;
        }
        if (this.x + this.radius >= tX && this.x - this.radius <= tX + tW)
            xResult++;

        if (this.y + this.radius >= tY && this.y - this.radius <= tY + tH)
            yResult++;

        if (xResult === 0 && yResult === 0) {
            xResult = yResult = 1;
        }

        if (xResult > 0 && this.vY === 0) {
            if (this.x + this.radius > tX + tW)
                this.vY = -1;
            else
                this.vY = 1;
        }
        if (yResult > 0 && this.vX === 0) {
            if (this.y + this.radius > tY + tH)
                this.vX = -1;
            else
                this.vX = 1;
        }
    };

    p.ballPlatformCollision = function (tX, tY, tW, tH) {
        var result = isCircleToRect(this.x, this.y, this.radius, tX, tY, tW, tH);
        if (result) {
            var s = Math.sqrt(Math.pow(this.vX, 2) + Math.pow(this.vY, 2));
            if (this.x + this.radius >= tX && this.x <= tX + this.radius * 3) {
                this.vX = Math.round(Math.sin(220 * Math.PI / 180) * s);
                this.vY = Math.round(Math.cos(220 * Math.PI / 180) * s);
                return result;
            }
            if (this.x >= tX + tW - this.radius * 3 && this.x - this.radius <= tX + tW) {
                this.vX = Math.round(Math.sin(140 * Math.PI / 180) * s);
                this.vY = Math.round(Math.cos(140 * Math.PI / 180) * s);
                return result;
            }

            if (this.x + this.radius >= tX && this.x - this.radius <= tX + tW) {
                this.y = Platform.y - this.radius;
                this.vY = -this.vY;
                return result;
            }

            if (this.y + this.radius >= tY && this.y - this.radius <= tY + tH) {
                this.vX = -this.vX;
                return result;
            }
        }
    };

    window.Ball = createjs.promote(Ball, "Shape");

}(window));

function getBall() {
    var i = 0;
    var len = Balls.length;
    //pooling approach
    while (i <= len) {
        if (!Balls[i]) {
            Balls[i] = new Ball(bColor, bRadius);
            break;
        } else if (!Balls[i].active) {
            Balls[i].active = true;
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        Balls[0] = new Ball(bColor, bRadius);
    }

    stage.addChild(Balls[i]);
    return i;
}

function startBall(x, y, b) {
    //create the bullet
    var o = Balls[getBall()];
    o.ballPlatformOffset = Math.round(Platform.width / 2);
    o.x = x + o.ballPlatformOffset;
    o.y = y - o.radius;
    o.active = true;
    o.launched = b;
    o.bonus = "none";
    o.color.style = dColor;
    o.bonusTime = 0;
    o.inTeleport = false;
    o.wallBlows = 0;
    bCount++;
    if (o.launched) {
        var a = Math.random() * (Math.PI * 2);
        o.vX = Math.sin(a) * (6);
        o.vY = Math.cos(a) * (6);
    } else {
        o.vX = 0;
        o.vY = -5;
    }
}

function isPointToRect(cx, cy, radius, rx, ry, width, height) {
    return ((cx > rx + radius && cx < rx + width - radius) && (cy > ry + radius && cy < ry + width - height));
}


function isCircleToRect(cx, cy, radius, rx, ry, width, height) {
    var x = cx;
    var y = cy;

    if (cx < rx)
        x = rx;
    else if (cx > (rx + width))
        x = rx + width;

    if (cy < ry)
        y = ry;
    else if (cy > (ry + height))
        y = ry + height;

    return (((cx - x) * (cx - x) + (cy - y) * (cy - y)) <= (radius * radius));
}


function ballSetBonus(ball, bonus) {
    var b;
    var o;
    switch (bonus) {
        case "quick":
            for (b in Balls) {
                o = Balls[b];
                if (!o || !o.active) {
                    continue;
                    o.vX *= 1.5;
                    o.vY *= 1.5;
                }
            }
            break;
        case "ram":
            o = Balls[0]
            bColor = "red";
            o.bonus = "ram";
            o.color.style = bColor;
            o.bonusTime = 1000 * bFactor;
            break;
        case "invisibility":
            bColor = "#f3f4f5";
            for (b in Balls) {
                o = Balls[b];
                if (!o || !o.active) {
                    continue;
                }
                o.bonus = "invisibility";
                o.color.style = bColor;
                o.bonusTime = 1000 * bFactor;
            }
            break;
        case "shield":
            bColor = "#a6e6a6";
            for (b in Balls) {
                var o = Balls[b];
                if (!o || !o.active) {
                    continue;
                }
                o.bonus = "shield";
                o.color.style = bColor;
                o.bonusTime = 1000 * bFactor;
            }
            break;
        case "pest":
            bColor = "#aad3eb";
            for (b in Balls) {
                o = Balls[b];
                if (!o || !o.active) {
                    continue;
                }
                o.bonus = "pest";
                o.color.style = bColor;
                o.bonusTime = 1000 * bFactor;
            }
            break;
        case "nobonus":
            bColor = "#bfbfbf";
            for (b in Balls) {
                o = Balls[b];
                if (!o || !o.active) {
                    continue;
                }
                o.bonus = "nobonus";
                o.color.style = bColor;
                o.bonusTime = 1000 * bFactor;
            }
            break;
        case "slow":
            for (b in Balls) {
                o = Balls[b];
                if (!o || !o.active) {
                    continue;
                }
                if (Math.abs(o.vX) >= 3) {
                    o.vX /= 1.5;
                }
                if (Math.abs(o.vX) >= 3) {
                    o.vY /= 1.5;
                }
            }
            break;
        case "triple":
            for (var i = 0; i < 2; i++) {
                startBall(ball.x, ball.y, true);
            }
            break;
        case "none":
        for (b in Balls) {
            o = Balls[b];
            if (!o || !o.active) {
                continue;
            }
            o.bonus = "none";
            o.color.style = dColor;
            o.bonusTime = 0;
        }
    }
}

function testStartBall() {
    var o = Balls[getBall()];
    o.x = Number(document.getElementById("px").value);
    o.y = Number(document.getElementById("py").value);
    o.vX = Number(document.getElementById("vx").value);
    o.vY = Number(document.getElementById("vy").value);
    o.active = true;
    o.launched = true;
    o.bonus = "none";
    o.color.style = dColor;
    o.bonusTime = 0;
    o.inTeleport = false;
    o.wallBlows = 0;
    bCount++;
}

function Kill() {
    for (var b in Balls) {
        var o = Balls[b];
        o.active = false;
        stage.removeChild(o);
    }
}