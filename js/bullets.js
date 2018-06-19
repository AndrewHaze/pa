(function (window) {

    function Bullet(y) {
        this.Shape_constructor(); // super call
        this.activate();
    }

    var p = createjs.extend(Bullet, createjs.Shape);

// public properties:
    p.w = 3;
    p.h = 6;

    p.active; //is it active


// public methods:

    //handle drawing a Bullet
    p.getShape = function () {
        //setup
        this.graphics.clear();
        this.graphics.beginFill('red');
        this.graphics.drawRect(0, 0, this.w, this.h);
    };

    //handle reinit for poolings sake
    p.activate = function () {
        this.getShape();
        this.active = true;
    };

    p.tick = function (event) {
        this.y -= 7;
    };

    p.bulletCollision = function (tX, tY, tW, tH) {
        
        return (this.x >= tX && this.x + this.w <= tX + tW) && (this.y <= tY + tH);
    };


    window.Bullet = createjs.promote(Bullet, "Shape");

}(window));

function getBullet() {
    var i = 0;
    var len = Bullets.length;
    //pooling approach
    while (i <= len) {
        if (!Bullets[i]) {
            Bullets[i] = new Bullet();
            break;
        } else if (!Bullets[i].active) {
            Bullets[i].active = true;
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        Bullets[0] = new Bullet();
    }

    stage.addChild(Bullets[i]);
    return i;
}

function startBullet(x, y) {
//create the bullet
    var o = Bullets[getBullet()];
    o.x = x;
    o.y = y;
    o.active = true;
}





