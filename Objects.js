"use strict";

function ScreenShake(){
    var self = this;
    self.scale = 0.9;
    self.amount = createVector();
    var range = {min: 0, max: 0};

    self.setRange = function(min, max){
        range.min = min;
        range.max = max;
    };

    self.update = function(){
        range.min *= self.scale;
        range.max *= self.scale;
        self.amount.set(random(range.min, range.max), random(range.min, range.max));
    };
}

function Bullet(pos, vel, velLimit){
    this.pos = pos;
    this.vel = vel || createVector(-5, 0);
    this.dim = createVector(20, 20);
    const velScale = 65;
    var isDead = false;
    this.init = function(posX, posY, vel){
        this.pos.x = posX;
        this.pos.y = posY;
        this.vel = vel;
    };
    this.kill = function(){
        isDead = true;
    };
    this.isDead = function(){
        return isDead;
    };

    this.update = function(dt){
        if(this.pos.x < 0 || this.pos.x > width){
            this.kill();
        }
        particleSystem.fromBullet(this);
        this.vel.limit(velLimit);
        this.pos.add(this.vel.copy().mult(dt * velScale));
    };
    this.display = function(){
        fill(0,0,255, 120);
        noStroke();
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
    };
}


function ShootComponent(interval, bullets){
    // shooting behavior
    // updating of bullets in done out side of the entity this is used in to prevent removing all the
    // bullets when the entity is killed and removed
    // TODO:rethink this
    this.bullets = bullets;
    this.interval = interval || 200;
    this.blockInterval = 600;
    var max = 1000; // maximum number of bullets
    var timer = new Timer(this.interval);

    this.shotSound = function(){};

    this.fireFrom = function(entity, vel, velLimit){
        if(timer.canRun()){
            this.shotSound();
            var v = vel || createVector(-5, 0);
            this.bullets.push(new Bullet(entity.pos.copy(), v, velLimit));
            screenShake.setRange(-1.2, 1.2);
        }
    };
}

function PickUp(pos){
    this.pos = pos;
    this.vel = createVector();
    this.dim = createVector(20, 20);
    var isDead = false;

    this.kill = function(){
        isDead = true;
    };
    this.isDead = function(){
        return isDead;
    };

    this.display = function(){
        push();
        noStroke();
        colorMode(HSB, 360, 100, 100, 1);
        var distance = player.pos.dist(this.pos);
        var alpha = map(distance, 200, 0, 0.3, 1.0);

        alpha = max(alpha, 0.3);
        fill(200, 98, 99, alpha);

        ellipseMode(CORNER);
        ellipse(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    };
}


function Enemy(){
    var self = this;
    const sizeMin = 30;
    const sizeMax = 100;
    self.externalForce = createVector();
    self.alpha = 5;
    var minAlpha = 0;
    var maxAlpha = 200;
    var maxAlphaDistance = 400;
    var fillColor = 255;
    var alpha = 100;

    self.initL = function(){
        resetDim();
        var posL = createVector(width + random(200, 500), random(self.dim.x, height - self.dim.y));
        var velL = createVector(-6 * 30, 0);
        self.externalForce = createVector();
        self.pos = posL;
        self.vel = velL;
    };

    self.initR = function(){
        resetDim();
        var posR = createVector(0 - random(200, 500), random(self.dim.x, height - self.dim.y));
        var velR = createVector(6 * 30, 0);
        self.externalForce = createVector();
        self.pos = posR;
        self.vel = velR;
    };

    function reInitialize(){
        // if its moving left and is past the left side of the screen
        // set the position to off the right side of the screen and randomize the y
        if(self.vel.x <0 && self.pos.x + self.dim.x < 0){
            self.initL();
        }
        // if its moving right and is past the right side of the screen
        // set the position to off the left side of the screen and randomize the y
        if(self.vel.x > 0 && self.pos.x > width){
            self.initR();
        }
    }

    function velScale(){
        return map(self.dim.x, 30, 100, 1, 0.40);
    }

    this.handleCollision = function(entityName){
        if(entityName === "player"){
            particleSystem.explosion(player.pos.copy());
        }
        particleSystem.explosion(this.pos.copy());
    };

    function resetDim(){
        var size = random(30, 100);
        self.dim = createVector(size, size);
    }

    this.applyForce = function(force){
        force.mult(velScale());
        this.externalForce.add(force);
    };

    function updateAlpha(){
        return cmap(player.pos.dist(self.pos), maxAlphaDistance, 0, minAlpha, maxAlpha);
    }

    this.display = function(){
        push();
        noStroke();
        alpha = updateAlpha();
        if(gameBackground.inWhiteOutMode()){
            alpha = map(gameBackground.count, gameBackground.maxCount, 0, maxAlpha, minAlpha);
            alpha = max(alpha, updateAlpha());
        }
        fill(fillColor, alpha);
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    };

    this.update = function(dt){
        reInitialize();
        var scale = velScale();
        this.vel.add(this.externalForce);
        this.pos.add(this.vel.copy().mult(dt * scale));
        this.externalForce.mult(0);
    };
}

function HealthComponent(maxHealth){
    var self = this;
    this.max = maxHealth;
    this.current = this.max;
    this.add = function(value){
        if(underMax()){
            this.current += value;
        }
    };
    this.sub = function(value){
        if(this.current > 0){
            this.current -= value;
        }
    };

    this.equals = function(value){
        return this.current === value;
    };

    function underMax(){
        return self.current < self.max;
    }
    this.isZero = function(){
        return this.current <= 0;
    };
}

function Player(x, y, bullets){
    var self = this;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector();
    this.dim = createVector(15, 15);
    this.shoot = new ShootComponent(300, bullets);
    this.shoot.shotSound = gameAudio.playBulletShot;
    this.health = new HealthComponent(4);
    this.maxDistance = 400;
    this.friction = 0.99;
    this.holdToMove = false;
    var fillColor = color(255, 200);


    function hitMove(entity, dirScale){
        // todo: find better name for this
        // update the velocity of the entity based on
        // where the mouse shoots it
        // example where mouse is x
        // x----> e-->
        //     <--e<----x
        var mouse = mouseVector();
        var dir = createVector();
        if(mouseIsPressed){
            dir = mouse.sub(entity.pos);
            dir.mult(-1);
            dir.mult(dirScale);
            dir.limit(self.maxDistance);
        }
        return dir;
    }

    this.applyForce = function(force){
        this.acc.add(force);
        this.vel.add(this.acc);
    };

    this.mouseReleased = function(){
        if(!this.holdToMove){
            this.vel.add(this.acc);
        }
    };

    this.reset = function(){
        this.friction = 0.99;
        // this.maxDistance = 200;
    };

    this.display = function(){
        push();
        if(debug){
            push();
            var mouse = mouseVector();
            var dir = mouse.copy().sub(this.pos);
            fill(255);
            text("acc distance: " + int(dir.mag()), this.pos.x, this.pos.y - 60);
            stroke(255, 200);
            line(mouse.x, mouse.y, this.pos.x + this.dim.x / 2, this.pos.y + this.dim.y / 2);
            stroke(255, 200);
            noFill();
            ellipse( this.pos.x + this.dim.x / 2, this.pos.y + this.dim.y / 2, this.maxDistance * 2, this.maxDistance * 2);
            pop();
        }
        noStroke();
        fill(fillColor);
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    };

    this.update = function(dt){
        const accScale = 1.7;
        const bulletScale = -0.08;
        const bulletVelLimit = 12;
        particleSystem.health(this);
        if(!this.health.isZero()){
            if(mouseIsPressed){
                this.shoot.fireFrom(this, hitMove(this, bulletScale), bulletVelLimit);
            }
                this.acc = hitMove(this, accScale);
        }
        if(this.holdToMove){
            this.acc = hitMove(this);
            this.vel.add(this.acc);
        }

        this.vel.mult(this.friction);
        this.vel.limit(this.maxDistance + 100);
        this.pos.add(this.vel.copy().mult(dt));
    };
}

function ParticleSystem(){
    var self = this;
    var particles = [];
    var healthTimer = new Timer(100);

    self.add = function(pdata){
        particles.push(new Particle(pdata));
    };

    self.update = function(dt){
        particles.forEach(p =>{
            p.update();
        });
        for(var i = particles.length - 1; i >= 0; i--){
            if(particles[i].isDead()){
                arrayRemove(particles, i);
            }
        }
    };

    self.mousePressed = function(){
        var color =  {start: {h: 240 + random(-5, 10),
                              s: 200,
                              b: 0.7 * 255},
                      between: {h: 220,
                                s:200,
                                b: 0.9 * 255},
                      end: {h: 240,
                            s: 200,
                            b: 200}};
        var data = {lifeTime: 50,
                    betweenLife: 30,
                    pos: mouseVector(),
                    dim: createVector(5, 5),
                    vel: createVector(),
                    type: "ellipse",
                    pNoFill: true,
                    pstrokeWeight: 5,
                    strokeColor: color,
                    pscale: {min: 12.1, max: 0.3},
                    alpha: {min: 200, max: 20}};
        particleSystem.add(data);
    };

    self.health = function(player){
        if(!healthTimer.canRun()) return;
        var hue = {start: 140};
        switch(player.health.current){
            case 3:
                hue.start = 180;
            break;
            case 2:
                hue.start = 240;
            break;
            case 1:
                hue.start = 340;
            break;
            case 0:
                hue.start = 360;
            break;
        }
        var color = {start: {h: hue.start,
                             s: 200,
                             b: 255},
                     between: {h: hue.start + 20,
                               s: 200,
                               b: 255},
                     end: {h: hue.start + 60,
                           s: 100,
                           b: 155}};
        _.times(14,(i)=>{
            var size = 15;
            var data = {lifeTime: 100,
                        betweenLife: 70,
                        pos: player.pos.copy().add(randomVector(-10, size + 10)),
                        vel: randomVector(-1, 1),
                        dim: createVector(random(0, size), random(0, size)),
                        type: "rect",
                        friction: 0.93,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 1.0, max: 0.3},
                        alpha: {min: 220, max: 0}};
            self.add(data);
        });
    };

    self.playerHitPickup = function (pos){
            var radius = 5;
            _.times(30, (i) =>{
                var startHue = chanceOr(180, 0.2, 200);
                var startSat = chanceOr(50, 0.1, random(100, 150));
                startSat = chanceOr(200, 0.2, startSat);
                var minScale = random(4, 10);
                var color = {start: {h: startHue,
                                     s: startSat,
                                     b: 255},
                             between: {h: 240,
                                       s: startSat,
                                       b: 255},
                             end: {h: 240,
                                   s: startSat,
                                   b: 255}};
                var vel = createVector(sin(i) * radius, cos(i) * radius);
                vel.add(randomVector(-2, 2));
                vel.mult(random(0.55, 1.2));
                var data = {lifeTime: 140,
                            betweenLife: 40,
                            pos: pos.copy(),
                            vel: vel,//randomVector(-5, 5),
                            dim: createVector(10, 10),
                            type: "ellipse",
                            pNoFill: true,
                            strokeColor: color,
                            pstrokeWeight: random(2, 6),
                            pscale: {min: minScale, max: 0},
                            alpha: {min: 200, max:  0}};
                self.add(data);
            });

    };

    self.fromBullet = function(bullet){
        var startHue = chanceOr(270, 0.2, random(180, 240));
        startHue = chanceOr(320, 0.1, startHue);
        const startSat = chanceOr(70, 0.1, random(120, 200));
        var end = chanceOr(280, 0.2, 200);
        var color = {start: {h: startHue,
                             s: startSat,
                             b: 255},
                     between: {h: random(180, 200),
                               s: 200,
                               b: 255},
                     end: {h: end,
                           s: 100,
                           b: 255}};
        _.times(1, () =>{
            var data = {lifeTime: 60,
                        betweenLife: 45,
                        pos: bullet.pos.copy().add(createVector(bullet.dim.x/2, bullet.dim.y/2) ),
                        vel: randomVector(-2, 2),
                        dim: createVector(20, 20),
                        type: "rect",
                        friction: 0.88,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 1.0, max: 0.3},
                        alpha: {min: 200, max: 20}};
            self.add(data);
        });
    };

    self.playerExhaust = function (pos, dir){
        var count = cmap(dir.mag(), 0, 80, 1, 10);
        dir.normalize();
        var color = {start: {h: 340,
                             s: 255,
                             b: 255},
                     between: {h: 100,
                               s: 255,
                               b: 255},
                     end: {h: 100,
                           s: 255,
                           b: 255}};
        _.times(count, i => {
            var sw = map(i, 1, 15, 2, 8);
            var data = {lifeTime: 50,
                        betweenLife: 40,
                        pos: pos.copy(),
                        vel: dir.copy().add(randomVector(-0.5, 0.5)).mult(6),
                        type: "line",
                        size: 0,
                        targetSize: 50,
                        pstrokeWeight: sw,
                        pNoFill: true,
                        strokeColor: color,
                        alpha: {min: 200, max: 20}};
            self.add(data);
        });
    };

    self.bulletHitPickup = function(pickup){
        _.times(10,(i)=>{
            var startHue = chanceOr(210, 0.5, random(180, 200));
            // var betweenHue = chanceOr(260, 0.5, );
            // var endHue = chanceOr(180, 0.5, betweenHue - 20);
            var color = {start: {h: startHue,
                                     s: 255,
                                     b: 255},
                             between: {h: random(180, 200),
                                       s: 255,
                                       b: 255},
                             end: {h: 180,
                                   s: 200,
                                   b: 255}};
            var scale = map(i, 0, 9, 1, 3);
            var size = random(10, 15);
            size *= scale;
            var data = {lifeTime: 70,
                        betweenLife: 30,
                        pos: pickup.pos.copy(),
                        vel: randomVector(-15, 15),
                        dim: createVector(size, size),
                        type: "ellipse",
                        friction: 0.88,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 1.0, max: 6.3},
                        alpha: {min: 255, max: 20}};
            particleSystem.add(data);
        });
    };

    self.respawnExplosion = function(pos) {
        _.times(10, (i) => {
            // BIG RECTS
            var hue = random(140, 240);
            var sat = random(100, 150);
            var color = {start: {h: hue,
                                 s: sat,
                                 b: 255},
                         between: {h: hue,
                                   s: sat,
                                   b: 255},
                         end: {h: hue - 20,
                               s: sat - 50,
                               b: 255}};
            var radius = 18;
            var vel = createVector(sin(i) * radius, cos(i) * radius);
            vel.add(random(-3, 3));
            var size = random(5, 10);
            var data = {lifeTime: 140,
                        betweenLife: 60,
                        pos: pos.copy(),
                        vel: vel,
                        dim: createVector(size, size),
                        type: "rect",
                        friction: 0.93,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 5.1, max: 25.3},
                        alpha: {min: 200, max: 0}};
            var data2 = _.cloneDeep(data);
            data2.lifeTime = 100;
            var color2 = _.cloneDeep(color);
            color2.start.s = 50;
            color2.between.s = 50;
            color2.end.s = 50;
            data2.fillColor = color2;
            data2.pos = pos.copy();
            data2.friction = 0.99;
            data2.dim = createVector(20, 20);
            data2.vel = createVector(sin(i) * 4, cos(i) * 4);

            self.add(data2);
            self.add(data);
        });

        _.times(30, (i) => {
            var hue = random(180, 300);
            var color = {start: {h: hue,
                                     s: 150,
                                     b: 255},
                             between: {h: hue,
                                       s: 150,
                                       b: 255},
                             end: {h: hue,
                                   s: 50,
                                   b: 255}};
            var radius = 10;
            var size = random(5, 15);
            var vel = createVector(sin(i) * radius, cos(i) * radius);
            vel.add(randomVector(-1, 1));
            var withStroke = {lifeTime: 120,
                              betweenLife: 100,
                              pos: pos.copy(),
                              vel: vel,
                              dim: createVector(size, size),
                              type: "rect",
                              friction: 0.98,
                              pNoFill: true,
                              pstrokeWeight: 3,
                              strokeColor: color,
                              pscale: {min: 5.1, max: 3.3},
                              alpha: {min: 255, max: 0}};
            self.add(withStroke);
        });
    };

    self.explosion = function(pos){
        // NOTE: make sure you always copy the position being passed when creating a new particle
        // other wise particles will all share the same position and behave weird
        _.times(8, (i)=>{
            // h: random(255)
            var color = {start: {h: random(100, 250),
                                     s: 255 * 0.3,
                                     b: 255},
                             between: {h: random(100, 250),
                                       s: 0.2 * 255,
                                       b: 0.9 * 255},
                             end: {h: 180,
                                   s: 150,
                                   b: 255}};
            var size = random(10, 16);
            var radius = 8;
            var vel = createVector(sin(i) * radius, cos(i) * radius);
            vel.add(randomVector(-2, 2));
            var data = {lifeTime: 70,
                        betweenLife: 50,
                        pos: pos.copy(),
                        vel: vel,
                        dim: createVector(size, size),
                        type: "rect",
                        friction: 0.91,//0.89,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 5.1, max: 15.3},
                        alpha: {min: 200, max: 0}};
            self.add(data);
        });
    };


    self.spawnPickUp = function (pos){
        var amount = 7;
        _.times(amount,(i)=>{
            var mapI = (min, max) =>{
                return map(i, 0, amount-1, min, max);
            };
            var size = mapI(1, 40);
            var strokeW = mapI(1, 12);
            var startSat = mapI(40, 100);
            var startHue = mapI(140, 220);
            startHue = chanceOr(120, 0.1, startHue);
            var color = {start: {h: startHue,
                                 s: startSat,
                                 b: 255},
                         between: {h: startHue + 20,
                                   s: 150,
                                   b: 255},
                         end: {h: 240,
                               s: 255,
                               b: 155}};
            var data = {lifeTime: 80,
                        betweenLife: 50,
                        pos: pos.copy(),
                        vel: createVector(),
                        dim: createVector(size, size),
                        type: "ellipse",
                        friction: 1,
                        pNoFill: true,
                        pstrokeWeight: strokeW,
                        strokeColor: color,
                        pscale: {min: 13.0, max: 0},
                        alpha: {min: 220, max: 0}};

            var data2 = _.cloneDeep(data);
            if(i > 1) data2.pos = pos.copy().add(random(10), random(10));
            data2.pscale.min = data2.pscale.min + 5;
            data2.lifeTime = 100;
            data2.betweenLife = 70;
            self.add(data2);
            self.add(data);
        });
    };

    self.display = function(){
        debugText("particles", particles.length);
        particles.forEach(p =>{
            p.display();
        });
    };
}

function jsonToP5(data){
    // argslist ["position",
    //           "deminsion", // width and height
    //           "width",
    //           "height",
    //           "radius", // for circles
    //           "scale",
    //           "type",
    //           "rect",
    //           "ellipse",
    //           "line",
    //           "fill",
    //           "colorMode",
    //           "stroke",
    //           "strokeWeight",
    //           "noFill",
    //           "noStroke"];
    function linePassThrew(p1, p2){
        //draw of line that passes threw p1 from p2
        // ellipse(p1.x, p1.y, 10, 10);
        var towards = p2.copy().sub(p1);
        towards.mult(-1);
        towards.add(p1);
        line(p2.x, p2.y, towards.x, towards.y);
    }

    var shapeFn = function (fn){
        push();
        translate(data.position.x, data.position.y);
        rotate(data.angle);
        if(data.width && data.height){
            fn(0, 0, data.width, data.height);
        } else if (data.radius) {
            fn(0, 0, data.radius * 2, data.radius * 2);
        } else {
            fn(0, 0, data.deminsion.x, data.deminsion.y);
        }
        pop();
    };

    var handleType = function(k){
        dt(k, data[k]);
        data.angle = data.angle || 0;
        data.scale = data.scale || 1;
        if(data.type === "rect" || k === "rect"){
            shapeFn(rect);
        } else if(data.type === "ellipse" || k === "ellipse"){
            shapeFn(ellipse);
        } else if(data.type === "triangle" || k === "triangle"){
            var x2 = data.width * data.scale;
            var y2 = 0;
            var x3 = (data.width / 2) * data.scale;
            var y3 = -data.height* data.scale;
            push();
            translate(data.position.x, data.position.y);
            rotate(radians(data.angle));
            triangle(0, 0, x2, y2, x3, y3);
            pop();
        } else if(data.type === "line-centered"){
            linePassThrew(data.position, createVector(data.position.x + cos(data.angle) * data.scale,
                                                      data.position.y + sin(data.angle) * data.scale));
        }
    };

    var keyToFns = {rect: rect,
                    ellipse: ellipse,
                    line: line,
                    triangle: triangle,
                    fill: fill,
                    noFill: noFill,
                    stroke: stroke,
                    strokeWeight: strokeWeight,
                    noStroke: noStroke};

    var isValidFunction = function(k){
        return Object.keys(keyToFns).indexOf(k) !== -1;
    };
    var isShape = (k) => {
        var shapes = ["rect", "ellipse", "line", "triangle"];
        return shapes.indexOf(k) !== -1;
    };

    var validType= (k) => {
        var types = ["rect", "ellipse", "line-centered", "triangle"];
        return types.indexOf(k) !== -1;
    };

    var keys = Object.keys(data);
    var values = Object.values(data);
    push();
    for (var i = 0; i < values.length; i++) {
        var v = values[i];
        var k = keys[i];
        if(!data.stroke) noStroke();
        if(!data.fill) noFill();

        if(isValidFunction(k)){
            var fn = keyToFns[k];
            if(v instanceof Array){
                fn.apply(null, v);
            } else{
                fn(v);
            }
        }
        if(data.type && validType(data.type)){
            handleType(k);
        }
    }
    pop();
    return data;
};

function Particle({pos,
                   vel,
                   dim,
                   type,
                   targetSize,
                   size,
                   pstrokeWeight,
                   friction,
                   betweenLife,
                   pscale,
                   pNoFill,
                   pNoStroke,
                   fillColor,
                   strokeColor,
                   lifeTime,
                   alpha}){
    // type controls how the particle is drawn:
    // ellispes, rects and line
    // for all shape pos, vel, pcolor, palpha are manditory
    // for lines the dim key is not used but the 'size' and targetSize determines the length of the line,
    // for rects and ellipses dim is used,
    //  maditory key are size, targetSize, strokeWeight,
    var self = this;
    self.pos = pos;
    self.vel = vel.copy();
    self.dim = dim;
    self.friction = friction || 0.98;
    var maxLife = lifeTime;
    var angle = self.vel.heading();

    self.isDead = function(){
        return lifeTime <= 0 || isOffScreen(this, 300);
    };

    function updateLine (){
        if(lifeTime > betweenLife){
            size += (targetSize - size) * 0.1;
        }else {
            size *= 0.98;
        }
    }

    self.update = function(dt){
        lifeTime -= 1;
        if(type === "line") updateLine();
        self.vel.mult(self.friction);
        self.pos.add(self.vel);
    };

    function mapLife(_min, _max){
        var l = map(lifeTime, maxLife, 0, _min, _max);
        return l;
    }

    function linearColorMap(){
        var c1 = color(hue.start, 255, 255, mapLife(alpha.min, alpha.max));
        var c2 = color(hue.end, 255, 255, mapLife(alpha.min, alpha.max));
        return lerpColor(c1, c2, mapLife(0, 1));
    }

    function colorMapWithBetween(pcolor){
        let a = mapLife(alpha.min, alpha.max);
        if(lifeTime > betweenLife){
            return lerpColor(color(pcolor.start.h, pcolor.start.s, pcolor.start.b, a),
                             color(pcolor.between.h, pcolor.between.s, pcolor.between.b, a),
                             map(lifeTime, maxLife, betweenLife, 0, 1));
        } else{
            return lerpColor(color(pcolor.between.h, pcolor.between.s, pcolor.between.b, a),
                             color(pcolor.end.h, pcolor.end.s, pcolor.end.b, a),
                             map(lifeTime, betweenLife, 0, 0, 1));
        }
    }

    function linePassThrew(p1, p2){
        //draw of line that passes threw p1 from p2
        var towards = p2.copy().sub(p1);
        towards.mult(-1);
        towards.add(p1);
        line(p2.x, p2.y, towards.x, towards.y);
    }

    function drawLine(){
        push();
        stroke(colorMapWithBetween(strokeColor));
        strokeWeight(pstrokeWeight);
        linePassThrew(self.pos, createVector(self.pos.x + cos(angle) * size,
                                             self.pos.y + sin(angle) * size));
        pop();
    }

    function drawShape(){
        var s = mapLife(pscale.min, pscale.max);
        push();
        colorMode(HSB, 360, 255, 255, 255);
        rectMode(CENTER);
        if(pNoFill) noFill();
        if(pNoStroke) noStroke();
        if(pstrokeWeight) strokeWeight(pstrokeWeight);
        if(strokeColor) stroke(colorMapWithBetween(strokeColor));
        if(fillColor) fill(colorMapWithBetween(fillColor));

        if(type === "rect"){
            rect(self.pos.x, self.pos.y, self.dim.x * s, self.dim.y * s);
        } else if(type === "ellipse") {
            ellipse(self.pos.x, self.pos.y, self.dim.x * s, self.dim.y * s);
        } else if(type === "triangle"){
            var x2 = 60 * s;
            var y2 = 0;
            var x3 = 30 * s;
            var y3 = 60 * s;

            push();
            translate(self.pos.x, self.pos.y);
            rotate(vel.heading());
            triangle(0, 0, x2, y2, x3, y3);
            pop();
        }
        pop();
    }

    self.display = function(){
        if(type === "line"){
            drawLine();
        }else {
            drawShape();
        }
    };
}


function Timer(timerInterval, numberOfCycles) {
    var lastInterval = -1;
    var cycleCounter;
    var interval = timerInterval;

    this.canRun = function(wait) {
        // wait toggle whether the timer should run and return turn
        // immediately or if it should wait 1 cycle before returning turn
        wait = wait || false;
        var curr = millis();
        if(lastInterval < 0 && wait) lastInterval = curr;
        if(curr-lastInterval >= interval || (lastInterval < 0 && !wait)) {
            lastInterval = curr;
            return true;
        }
        return false;
    };

}


function Background(){
    var self = this;
    self.maxCount = 450;
    self.count = self.maxCount;

    const maxDistance = 200;
    const minAlpha = 0.25;
    const maxAlpha = 0.4;
    var whiteOutMode = false;

    var toNormalTransition = new Transition(2000);
    var toLowHealthTransition = new Transition(3000);
    var toStartTransition = new Transition(2000);

    var triangles = newTriangles();
    var bigTriangles = map2D(80, (x, y) =>{
        return defaultTri(x, y, {scale: 4.3, brightness: 32, saturation: 43});
    });
    var all = _.concat(bigTriangles, triangles);

    function defaultTri(x, y, customArgs){
        return new Tri(x, y, _.merge({scale: 2.5,
                                      hue: 239,
                                      saturation: random(50, 100),
                                      brightness: 100,
                                      shimmerData: {min: -17,
                                                    max: 10}},
                                     customArgs));
    }


    function newTriangles(){
        var tris1 = map2D(60, (x, y) => {
            if((x > 100 && x < 340) || (x > 600 && x < 850)){
                if(chance(0.5)){
                    return defaultTri(x, y);
                } else {
                    return defaultTri(x, y,
                                      {hue: 159,
                                       shimmerData: {min: 0,
                                                     max: 30}});
                }
            }
        });
        var tris2 = map2D(160, (x, y) =>{
            if((y > 100 && y < 340) || (y > 400 && y < 650)){
                // return defaultTri(x, y, {scale: 3.2, brightness: 83});
                if(chance(0.5)){
                    return defaultTri(x, y, {scale: 2.2, brightness: 83});
                } else {
                    return defaultTri(x, y,
                                      {hue: 159,
                                       scale: 2.2,
                                       brightness: 83,
                                       shimmerData: {min: 0,
                                                     max: 30}});
                }
            }
        });
        return _.concat(tris1, tris2);
    }

    function map2D(step, fn){
        var results = [];
        for(var x = -step; x < width + step; x+=step) {
            for(var y = -step; y < height; y+=step) {
                var r = fn(x, y);
                if(r) results.push(r);
            }
        }
        return results;
    }

    function shimmer(pos, min, max, scale, offset){
        return map(sin(offset + pos.y + millis() * (0.0016 * 0.85)), -1, 1, min, max);
    }

    function nextAlpha(tri){
        return map(player.pos.dist(tri.center()), maxDistance, 0, 0, shimmer(tri.pos, minAlpha, maxAlpha, 0.85, 50));
    }

    function mapCount(min, max){
        return map(self.count, self.maxCount, 0, min, max);
    }

    self.transitionToNormal = function(){
        toNormalTransition.start();
    };

    self.transitionToLowHealth = function(){
        toLowHealthTransition.start();
    };

    self.transitionToStart = function(){
        toStartTransition.start();
    };

    function lowHealth(){
        // change background tri colors when to player is low health and
        // back to its normal state. isTranstionToNormal is set when the player
        // collides with a pickup

        const hue = 320;
        const alpha = 0.2;
        const saturation = 70;
        const brightness = 100;
        if(player.health.equals(1) || player.health.equals(0)){
            all.map(function(tri, i){
                tri.hue = hue;
                tri.alpha = alpha;
                tri.saturation = saturation;
                tri.brightness = brightness;
            });
        }
        if(toLowHealthTransition.isRunning()){
            all.forEach(tri =>{
                var mapTransition = toLowHealthTransition.map;
                tri.alpha = mapTransition(nextAlpha(tri), alpha);
                tri.hue = mapTransition(tri.initialHue, hue);
                tri.saturation = mapTransition(tri.initialSaturation, saturation);
                tri.brightness = mapTransition(tri.initialBrightness, brightness);
            });
        }
        if(toNormalTransition.isRunning()){
            all.forEach(tri =>{
                var mapTransition = toNormalTransition.map;
                tri.alpha = mapTransition(alpha, nextAlpha(tri));
                tri.hue = mapTransition(hue, int(tri.initialHue));
                tri.saturation = mapTransition(saturation, tri.initialSaturation);
                tri.brightness = mapTransition(brightness, tri.initialBrightness);
            });
        }
    }

    self.endWhiteOut = function(){
        whiteOutMode = false;
        self.count = self.maxCount;
    };

    self.inWhiteOutMode = function(){
        return whiteOutMode;
    };

    self.activateWhiteOutMode = function(){
        whiteOutMode = true;
    };

    function whiteOut(){
        if(whiteOutMode){
            var fillColor = mapCount(255, 0);
            bigTriangles.forEach(tri => {
                tri.brightness = mapCount(100, tri.initialBrightness);
            });

            triangles.forEach(tri => {
                tri.alpha = mapCount(maxAlpha, nextAlpha(tri));
                // tri.saturation = mapCount(200, tri.initialSaturation) + mapCount(random(10.0), 0);
            });
            fill(fillColor, 130);
            rect(0, 0, width, height);
            self.count--;
        }
        if(self.count <= 0) {
            self.endWhiteOut();
        }
    }

    self.display = function(){
        all.forEach(tri => {tri.alpha = nextAlpha(tri);});
        whiteOut();
        lowHealth();
        if(gameNotStarted) {
            all.forEach(tri =>{
                tri.alpha = lerp(nextAlpha(tri), 1.0, 0.35);
            });
        }
        if(toStartTransition.isRunning()) {
            all.forEach(tri =>{
                var alpha = lerp(nextAlpha(tri), 1.0, 0.3);
                tri.alpha = toStartTransition.map(alpha, nextAlpha(tri));
            });
        }
        all.forEach(t => {t.display();});
    };
}

function Tri(x, y, {hue, saturation, brightness, scale, shimmerData}){
    var self = this;
    const width = 30;
    const height = 60;
    const right = PI/2;
    const left = -PI/2;
    const angle = chance(0.5) ? left: right;

    self.pos = createVector(x, y);
    self.initialBrightness = brightness;
    self.brightness = brightness;

    self.initialSaturation = saturation;
    self.saturation = saturation;
    self.hue = hue;
    self.initialHue = hue;
    self.alpha = 0;

    function shimmer(min, max){
        return map(sin(y + millis() * 0.0016), -1, 1, min, max);
    }

    self.center = function(){
        var offsetWidth = (width * scale) - (width * scale) / 2.9;
        var offsetHeight = (height * scale) / 2;
        if(angle === right){
            return createVector(self.pos.x - offsetWidth, self.pos.y + offsetHeight);
        } else {
            return createVector(self.pos.x + offsetWidth, self.pos.y - offsetHeight);
        }
    };

    function mapSin(value, min, max){
        return map(sin(value), -1, 1, min, max);
    }

    function seconds(){
        return millis()/1000;
    }

    self.display = function(){
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();

        // hsb 239 68 59
        // rgb 48 50 150
        // b 59 s 68

        // blue
        // hsb 159 84 91
        // rgb 38 232 165
        // b 91 s 84

        fill(self.hue + shimmer(shimmerData.min, shimmerData.max), self.saturation, self.brightness, self.alpha);

        var a = map(scale, 2.2, 4.3, 1, 5);
        var multScale = mapSin(y + cos(tan(3 * x)) + (seconds() / a), 1, 1.3);
        var offsetX = mapSin((y * x) + seconds(), 0, 10);
        var offsetY = mapSin((y / x) + seconds() / a, 0, 10);

        var points = {x1: 0,
                      y1: 0,
                      x2: height * scale * multScale,
                      y2: 0,
                      x3: width * scale * multScale,
                      y3: height * scale * multScale};

        const shakeScale = 0.9;
        translate(x + offsetX - (screenShake.amount.x * shakeScale), y + offsetY - (screenShake.amount.y * shakeScale));
        rotate(angle);
        triangle(points.x1, points.y1, points.x2, points.y2, points.x3, points.y3);
        pop();
    };
}

function Transition(length){
    var hasStarted = false;
    var startTime = 0;

    this.start = function(){
        startTime = millis();
        hasStarted = true;
    };

    this.map = function(min, max){
        return map(millis(), startTime, startTime + length, min, max);
    };

    this.isRunning = function(){
        // come up with a better function name
        if(millis() > startTime + length){
            hasStarted = false;
        }
        return hasStarted;
    };
}
