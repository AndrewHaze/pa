(function (window) {

    function Bonus(x, y, g) {
        this.Container_constructor(); // super call
        this.activate(x, y, g);
    }

    var p = createjs.extend(Bonus, createjs.Container);
    var r = 12 //бонус радиус;

    // public properties:

    p.gift;	//visual radial size
    p.radius;
    p.active;	//is it active



// public methods:

    //handle drawing a pest
    p.getContainer = function (x, y, g) {
        this.x = x;
        this.y = y;
        var s = new createjs.Shape();
        s.graphics.clear();
        s.graphics.setStrokeStyle(2).beginStroke("#004000");
        s.graphics.beginBitmapFill(Img[g], "no-repeat");
        s.graphics.drawCircle(r, r, r);
        this.addChild(s);
    };

    //handle reinit for poolings sake
    p.activate = function (x, y, g) {
        this.radius = r;
        this.getContainer(x, y, g);
        this.gift = g;
        this.active = true;
    };

    //handle what a pest does to itself every frame
    p.tick = function (event) {
        this.y += 3;
    };

    p.platformBonusCollision = function (tX, tY, tW) {
        return (this.x + r * 2 >= tX && this.x <= tX + tW) && (this.y + r * 2 >= tY)
    };

    window.Bonus = createjs.promote(Bonus, "Container");
}(window));

function getBonus(x, y, g) {
    var i = 0;
    var len = Bonuses.length;
    //pooling approach
    while (i <= len) {
        if (!Bonuses[i]) {
            Bonuses[i] = new Bonus(x, y, g);
            break;
        } else if (!Bonuses[i].active) {
            Bonuses[i].activate(x, y, g);
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        Bonuses[0] = new Bonus(x, y, g);
    }

    stage.addChild(Bonuses[i]);
    return i;
}