(function (window) {

    function Pest() {
        this.Shape_constructor(); // super call
        this.activate();
    }

    var p = createjs.extend(Pest, createjs.Shape);
    var colors = ["pink", "violet", "greenyellow", "lightskyblue", "greenyellow", "yellow", "salmon", "cornflowerblue", "gainsboro"];

    // public properties:

    p.bounds;	//visual radial size
    p.hit;		//average radial disparity
    p.size;		//size value itself
    p.spin;		//spin ammount

    p.velX;	//velocity X
    p.velY;		//velocity Y

    p.xVec;  //x vector
    p.yVec;  //y vector;

    p.active;	//is it active



// public methods:

    //handle drawing a pest
    p.getShape = function () {
        var angle = 0;
        var radius = 10;
        var color = colors[randomInteger(0, 8)];

        this.size = 10;
        this.hit = 10;
        this.bounds = 0;

        //setup
        this.graphics.clear();
        this.graphics.beginStroke(color);
        this.graphics.beginFill(color);
        this.graphics.moveTo(0, 10);

        //draw pest
        while (angle < (Math.PI * 2 - .5)) {
            angle += .25 + (Math.random() * 100) / 500;
            radius = 10 + (5 * Math.random());
            this.graphics.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);

            //track visual depiction for interaction
            if (radius > this.bounds) {
                this.bounds = radius;
            }	//furthest point

            this.hit = (this.hit + radius) / 2;					//running average
        }

        this.graphics.closePath(); // draw the last line segment back to the start point.
        this.hit *= 1.1; //pad a bit
    };

    //handle reinit for poolings sake
    p.activate = function () {
        this.getShape();

        //pick a random direction to move in and base the rotation off of speed
        var angle = Math.random() * (Math.PI * 2);
        this.velX = Math.sin(angle) * 4.33;
        this.velY = Math.cos(angle) * 4.33;
        this.spin = (Math.random() + 0.2) * this.velX;
        this.active = true;
    };

    //handle what a pest does to itself every frame
    p.tick = function (event) {
        this.rotation += this.spin;
        this.x += this.velX;
        this.y += this.velY;

        //console.log(Math.round(this.x), this.velX, Math.round(this.y), this.velY);
    };

    //position the pest so it floats on screen
    p.floatOnScreen = function (width, height) {
        //base bias on real estate and pick a side or top/bottom
        if (Math.random() * (width + height) > width) {
            //side; ensure velocity pushes it on screen
            if (this.velX > 0) {
                this.x = 2 * this.bounds;
            } else {
                this.x = width - 2 * this.bounds;
            }
            //randomly position along other dimension
            if (this.velY > 0) {
                this.y = Math.random() * height * 0.5;
            } else {
                this.y = Math.random() * height * 0.5 + 0.5 * height;
            }
        } else {
            //top/bottom; ensure velocity pushes it on screen
            if (this.velY > 0) {
                this.y = 2 * this.bounds;
            } else {
                this.y = height - 2 * this.bounds;
            }
            //randomly position along other dimension
            if (this.velX > 0) {
                this.x = Math.random() * width * 0.5;
            } else {
                this.x = Math.random() * width * 0.5 + 0.5 * width;
            }
        }
    };

    p.hitPoint = function (tX, tY) {
        return this.hitRadius(tX, tY, 0);
    };

    p.hitRadius = function (tX, tY, tXHit, tYHit) {
        //early returns speed it up
        if (tX - tXHit > this.x + this.hit) {
            return;
        }
        if (tX + tXHit < this.x - this.hit) {
            return;
        }

        if (tY - tYHit > this.y + this.hit) {
            return;
        }

        if (tY + tYHit < this.y - this.hit) {
            return;
        }

        //now do the circle distance test
        return this.hit + tXHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2)) || this.hit + tYHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
    };


    window.Pest = createjs.promote(Pest, "Shape");

}(window));

function outOfBounds(o, bounds) {
    //is it visibly off screen
    return o.x < bounds || o.y < bounds || o.x > canvas.width - bounds || o.y > canvas.height - bounds;
    //console.log(Math.round(o.x), Math.round(o.y));
}

function placeInBounds(o, bounds) {
    if (o.y < bounds || o.y > stage.canvas.height - bounds) {
        o.velY = -o.velY;
    }
    if (o.x < bounds || o.x > stage.canvas.width - bounds) {
        o.velX = -o.velX;
    }
}

function getPest(size) {
    var i = 0;
    var len = Pests.length;

    //pooling approach
    while (i <= len) {
        if (!Pests[i]) {
            Pests[i] = new Pest(size);
            break;
        } else if (!Pests[i].active) {
            Pests[i].activate(size);
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        Pests[0] = new Pest(size);
    }

    stage.addChild(Pests[i]);
    stage.update();
    return i;
}