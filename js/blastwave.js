(function (window) {

    function blastWave() {
        this.Shape_constructor(); // super call
        this.activate();
    }

    var p = createjs.extend(blastWave, createjs.Shape);

// public properties:
    p.r = 1;
    p.step;
    p.active; //is it active


// public methods:

    //handle drawing a blastWave
    p.getShape = function (w, h) {
        //setup
        this.graphics.clear();
        this.graphics.beginFill('transparent');
        this.graphics.beginStroke("rgba(95, 4, 1, 0)");
        this.graphics.drawCircle(0, 0, this.r);
    };

    //handle reinit for poolings sake
    p.activate = function () {
        this.getShape();
        this.w = 6;
        this.h = 3;
        this.active = true;
    };

    p.tick = function () {
        if (this.step === 0)
            stage.removeChild(this);
        if (this.step % 2) {
            this.r += 4;
            this.graphics.clear();
            this.graphics.beginFill('transparent');
            this.graphics.beginStroke("rgba(215, 4, 4, "+ String(this.step / 10) +")");
            this.graphics.setStrokeStyle(2);
            this.graphics.drawCircle(0, 0, this.r);
        }
        this.step -= .35;
    };

    window.blastWave = createjs.promote(blastWave, "Shape");

}(window));

function getblastWave() {
    var i = 0;
    var len = blastWaves.length;
    //pooling approach
    while (i <= len) {
        if (!blastWaves[i]) {
            blastWaves[i] = new blastWave();
            break;
        } else if (!blastWaves[i].active) {
            blastWaves[i].active = true;
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        blastWaves[0] = new blastWave();
    }

    stage.addChild(blastWaves[i]);
    return i;
}

function startblastWave(x, y) {
//create the bullet
    var o = blastWaves[getblastWave()];
    o.x = x + 25;
    o.y = y + 12;
    o.step = 10;
}





