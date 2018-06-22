(function (window) {

    function platformObject(w) {
        this.Shape_constructor(); // super call
        this.activate(w);
    }

    var p = createjs.extend(platformObject, createjs.Shape);


// public properties:

    p.width;	//visual radial size
    p.bonus;  //текущий бонус платформы
    p.bonusTime;
    p.gradient;



// public methods:
    p.getShape = function (w) {
        //setup
        this.graphics.clear();
        //this.color = this.graphics.beginFill("#a52a2a").command;
        this.gradient = this.graphics.beginLinearGradientFill(["#681a1a", "#681a1a"], [0.5, 0.5], 0, 0, w, 15).command;
        this.graphics.drawRoundRect(0, 0, w, 15, 5);

    };

    p.activate = function (w) {
        this.getShape(w);
        this.width = w;
        this.x = Math.round(stage.canvas.width / 2) - Math.round(w / 2);
        this.y = stage.canvas.height - 30;
        this.bonus = "none";
        this.bonusTime = 0;
    };

    window.platformObject = createjs.promote(platformObject, "Shape");

}(window));


function platformResize(w) {
    Platform.graphics.clear();
    Platform.gradient = Platform.graphics.beginLinearGradientFill(pCurrentColor, [0.5, 0.5], 0, 0, w, 15).command;
    Platform.graphics.drawRoundRect(0, 0, w, 15, 5);
    stage.update();
}

function platformSetBonus(bonus) {                                                                                                //13
    switch (bonus) {
        case "magnet":
            Platform.bonus = "magnet";
            pBonusColor = ["red", "blue"];
            Platform.gradient.linearGradient(pBonusColor, [0.5, 0.5], 0, 0, Platform.width, 15);
            Platform.bonusTime = 1000 * bFactor;
            pCurrentColor = pBonusColor;
            break;
        case "enlarge":
            if (Platform.width < 160) {
                Platform.width += 20;
                if (Platform.x <= 10)
                    Platform.x = 0;
                else
                    Platform.x -= 10;
                platformResize(Platform.width);
            }
            break;
        case "live":
            lives++;
            document.getElementById('lives').innerHTML = lives;
            break;
        case "ack":
            Platform.bonus = "ack";
            pBonusColor = ["#757044", "#757044"];
            Platform.gradient.linearGradient(pBonusColor, [0.5, 0.5], 0, 0, Platform.width, 15);
            Platform.bonusTime = 1000 * bFactor;
            pCurrentColor = pBonusColor;
            rof = 18;
            break;
        case "death":
            lives--;
            document.getElementById('lives').innerHTML = lives;
            break;
        case "reduce":
            if (Platform.width > 40) {
                Platform.width -= 20;
                if (Platform.x >= stage.canvas.width - 10)
                    Platform.x = stage.canvas.width;
                else
                    Platform.x += 10;
                platformResize(Platform.width);
            }
            break;
        case "none":
            Platform.bonus = "none";
            Platform.gradient.linearGradient(pDefaultColor, [0.5, 0.5], 0, 0, Platform.width, 15);
            Platform.bonusTime = 0;
            pCurrentColor = pDefaultColor;
    }
}

function platformNoMove(m) {
    if (m) {
        px = Platform.x;
        stage.on("stagemousemove", function (evt) {
            Platform.x = px;
        });
    } else {
        stage.on("stagemousemove", function (evt) {
            Platform.x = evt.rawX - Platform.width/2;
        });
    }
}
