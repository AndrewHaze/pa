(function (window) {

    function Brick(t, s) {
        this.Shape_constructor(); // super call
        this.activate(t, s);
    }

    var p = createjs.extend(Brick, createjs.Shape);


// public properties:
    p.x;
    p.y;
    p.width;
    p.type;
    p.strength;
    p.bonus;
    p.d_color;
    p.m_color;
    p.active;
    p.touching;


// public methods:

    //handle drawing a Ball
    p.getShape = function (t, s) {
        //setup
        var c;
        this.graphics.clear();
        switch (t) {
            case "a":
                this.d_color = "transparent";
                this.color = this.graphics.beginFill(this.d_color).command;
                break;
            case "b": //Красный
                this.d_color = "#ff1919";
                this.m_color = "#7f0000";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "c": //Голубой
                this.d_color = "#1ffff9";
                this.m_color = "#1C1B17";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "d": //Малиновый
                this.d_color = "#f339ff";
                this.m_color = "#1C1B17";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "e": //Зеленый
                this.d_color = "#2aff2d";
                this.m_color = "#1C1B17";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "f": //Желтый
                this.d_color = "#fed700";
                this.m_color = "#ff0000";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "g": //Синий
                this.d_color = "#1919ff";
                this.m_color = "#1C1B17";
                c = mix(this.m_color, this.d_color, 25 * (s - 1));
                this.color = this.graphics.beginFill(c).command;
                break;
            case "h":
                this.d_color = "#e6e6fa";
                this.color = this.graphics.beginFill(this.d_color).command;
                break;
            case "i":
                this.d_color = "#be1f27";
                this.color = this.graphics.beginFill(this.d_color);
                this.graphics.drawRect(0, 0, this.width, bH);
                this.color_f = this.graphics.beginFill("#f5831f").command;
                this.color_s = this.graphics.beginStroke("#f5831f").command;
                this.graphics.moveTo(24, 1).lineTo(48, 12).lineTo(24, 24).lineTo(1, 12);
                break;
            case "j":
                this.d_color = "#0e2741";
                this.color = this.graphics.beginRadialGradientFill(["#f6fafd","#0e2741"], [0, .5, 1], 25, 12, 0, 25, 12, 30);
                this.graphics.drawRect(0, 0, this.width, bH);
                /*this.graphics.beginStroke("#00ffff");
                this.graphics.drawRect( 2,  2, 44, 20);
                this.graphics.drawRect(6, 6, 36, 12);
                this.graphics.drawRect(9, 10, 29, 4);*/
        }
        if (t != "i" && t != "j")
            this.graphics.drawRect(0, 0, this.width, bH);
        this.active = true;
        this.touching = false;
    };

    //handle reinit for poolings sake
    p.activate = function (t, s) {
        this.width = bW;
        this.getShape(t, s);
        this.type = t;
    };

    window.Brick = createjs.promote(Brick, "Shape");

}(window));


function getBrick(t, s) {
    var i = 0;
    var len = Masonry.length;

    //pooling approach
    while (i <= len) {
        if (!Masonry[i]) {
            Masonry[i] = new Brick(t, s);
            break;
        } else if (!Masonry[i].active) {
            Masonry[i].active = true;
            break;
        } else {
            i++;
        }
    }

    if (len == 0) {
        Masonry[0] = new Brick(t, s);
    }

    stage.addChild(Masonry[i]);
    return i;
}
;