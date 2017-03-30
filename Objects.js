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

function Bullet(pos, type, color, vel){
    this.pos = pos;
    this.vel = ifNull(vel, createVector(-5, 0));
    this.dim = createVector(20, 20);
    this.type = type;
    this.color = color;
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
        this.pos.add(this.vel.copy(dt));
    };
    this.display = function(){
        fill(0,0,255, 120);
        noStroke();
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
    };
}


function ShootComponent(interval, remaining, bullets){
    // shooting behavior
    // updating of bullets in done out side of the entity this is used in to prevent removing all the
    // bullets when the entity is killed and removed
    // TODO:rethink this
    this.bullets = bullets;
    this.interval = ifNull(interval, 200);
    this.blockInterval = 600;
    var max = 1000; // maximum number of bullets
    this.remainingBullets = remaining; // how many bullets are left to shoot
    var timer = new Timer(this.interval);

    this.shotSound = function(){};

    this.addToRemaining = function(value){
        if(this.remainingBullets < max){
            this.remainingBullets += value;
        }
    };

    this.fireFrom = function(entity, vel){
        if(timer.canRun() && this.remainingBullets > 0){
            this.shotSound();
            this.remainingBullets--;
            var v = ifNull(vel, createVector(-5, 0));
            this.bullets.push(new Bullet(entity.pos.copy(), "normal", "blue", v));
            screenShake.setRange(-1.2, 1.2);
        }
    };
}

function PickUp(pos){
    this.pos = pos;//entity.pos.copy();
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
        // fill(38, 232, 165, 180)
        // fill(78, 232, 165, 180)
        colorMode(HSB, 360, 100, 100, 1);
        fill(200, 98, 99, 0.3);
        ellipseMode(CORNER);
        ellipse(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    };
}

var initLeft = true;
function Enemy(){
    var self = this;
    const sizeMin = 30;
    const sizeMax = 100;
    self.acc = createVector();
    self.init = init;
    init();
    self.alpha = 5;
    var minAlpha = 0;
    var maxAlpha = 200;
    var maxDistance = 350;

    function initL(){
        resetDim();
        var posL = createVector(width + random(200, 500), random(self.dim.x, height - self.dim.y));
        var velL = createVector(-6 * 30, 0);
        self.pos = posL;
        self.vel = velL;
    }

    function initR(){
        resetDim();
        var posR = createVector(0 - random(200, 500), random(self.dim.x, height - self.dim.y));

        var velR = createVector(6 * 30, 0);
        self.pos = posR;
        self.vel = velR;
    }

    function init(){
        if(initLeft){
            initL();
        } else {
            initR();
        }
        initLeft = !initLeft;
    }

    function reInitialize(){
        // if its moving left and is past the left side of the screen
        // set the position to off the right side of the screen and randomize the y
        if(self.vel.x <0 && self.pos.x + self.dim.x < 0){
            initL();
        }
        // if its moving right and is past the right side of the screen
        // set the position to off the left side of the screen and randomize the y
        if(self.vel.x > 0 && self.pos.x > width){
            initR();
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
        this.acc.add(force);
    };

    function updateAlpha(){
        return cmap(player.pos.dist(self.pos), maxDistance, 0, minAlpha, maxAlpha);
    }

    this.display = function(){
        push();
        noStroke();
        if(whiteOutMode){

            var a = map(gameBackground.count, gameBackground.maxCount, 0, maxAlpha, minAlpha);
            a = max(a, updateAlpha());
            fill(255, a);
        } else {
            fill(255, updateAlpha());
        }
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    };

    this.update = function(dt){
        reInitialize();
        // clog(self.pos);
        var scale = velScale();
        this.vel.add(this.acc);
        this.pos.add(this.vel.copy().mult(dt * scale));
        this.acc.mult(0);
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
    this.shoot = new ShootComponent(300, 1, bullets);
    this.shoot.shotSound = gameAudio.playBulletShot;
    this.health = new HealthComponent(3);
    this.maxDistance = 200;
    this.friction = 0.99;
    this.holdToMove = false;
    var fillColor = color(255, 200);
    var bulletSpeed = 12;


    function hitMove(entity){
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
            dir.limit(self.maxDistance);
            // stroke(255,0,0, 20);
            // line(mouseX, mouseY, entity.pos.x + entity.dim.x / 2, entity.pos.y + entity.dim.y / 2);
        }
        return dir;
    }

    this.applyForce = function(force){
        this.acc.add(force);
        this.vel.add(this.acc);
    };

    this.mouseReleased = function(){
        particleSystem.playerExhaust(createVector(self.pos.x + self.dim.x / 2,
                                                  self.pos.y + self.dim.y / 2),
                                     this.acc.copy().mult(-1));

        if(!this.holdToMove){
            this.vel.add(this.acc);
        }
    };

    this.reset = function(){
        this.friction = 0.99;
        this.maxDistance = 200;
    };

    function bulletOutline(){
        if(self.shoot.remainingBullets > 0 && self.health.current > 0){
            var remainingBullets = self.shoot.remainingBullets;
            var rectOffset = map(remainingBullets, 0, 10, 0, 50);
            var strokeOffset = map(remainingBullets, 0, 10, 0.1, 3);
            var alpha = cmap(remainingBullets, 0, 10, 0.8, 0.65);
            push();
            colorMode(HSB, 360, 100, 100, 1);
            strokeWeight(5 + strokeOffset);
            stroke(250, 80, 100, alpha);
            noFill();
            var bPos = self.pos.copy().sub(rectOffset/2, rectOffset/2);
            var bDim = self.dim.copy().add(rectOffset, rectOffset);
            ellipseMode(CORNER);
            ellipse(bPos.x, bPos.y, bDim.x, bDim.y);
            pop();
        }
    }

    this.display = function(){
        push();
        // fill(0,0,255, 120);
        // drawTrail();
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
        // bulletOutline();
        fill(255);
        text("bullets: " +  this.shoot.remainingBullets, this.pos.x, this.pos.y - 40);
        // text("health: " + this.health.current, this.pos.x, this.pos.y - 20);
        noStroke();
        fill(fillColor);
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    };

    this.update = function(dt){
        particleSystem.health(this);
        if(!this.health.isZero()){
            if(keyDirection()){
                var bulletVel = keyDirection().mult(bulletSpeed);

                this.shoot.fireFrom(this, bulletVel);
            }
            this.acc = hitMove(this);
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
    self.dp = particles;
    var healthTimer = new Timer(100);
    self.add = function(pdata){
        particles.push(new Particle(pdata));
    };
    self.update = function(dt){
        particles.forEach(p =>{
            // println(p);
            p.update();
        });
        for(var i = particles.length - 1; i >= 0; i--){
            if(particles[i].isDead()){
                arrayRemove(particles, i);
            }
        }
    };

    self.health = function(player){
        if(!healthTimer.canRun()) return;
        var hue = {start: 140};
        // 140, 160, 200
        switch(player.health.current){
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

    self.pickUp = function (pos){
        var color = {start: {h: 140,
                             s: 200,
                             b: 255},
                     between: {h: 160,
                               s: 200,
                               b: 255},
                     end: {h: 200,
                           s: 100,
                           b: 155}};
        _.times(10,(i)=>{
            var size = 20 + (i * (i * 0.3));
            // size = max(size, 2);
            var strokeW = (i * (i * 0.2));
            strokeW = max(strokeW, 5);
            var data = {lifeTime: 100,
                        betweenLife: 70,
                        pos: pos.copy(),
                        vel: createVector(),
                        dim: createVector(size, size),
                        type: "ellipse",
                        friction: 0.88,
                        pNoFill: true,
                        pstrokeWeight: strokeW,
                        strokeColor: color,
                        pscale: {min: 13.0, max: 0.3},
                        alpha: {min: 220, max: 0}};
            self.add(data);
        });
    };

    self.fromBullet = function(bullet){
        var color = {start: {h: 240,
                             s: 200,
                             b: 255},
                     between: {h: random(180, 200), //random(310 - 30, 330 - 30),
                               s: 200,
                               b: 255},
                     end: {h: 200,
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
                        // dim: createVector(10, 10),
                        type: "line",
                        // friction: 0.99,
                        size: 0,
                        targetSize: 50,
                        pstrokeWeight: sw,
                        pNoFill: true,
                        strokeColor: color,
                        // pscale: {min: 0.3, max: 3.3},
                        alpha: {min: 200, max: 20}};
            self.add(data);
        });
    };

    self.bulletHitPickup = function(pickup){
        var explosion = {start: {h: random(255),
                                 s: 255 * 0.2,
                                 b: 255},
                         between: {h: random(255),
                                   s: 0.2 * 255,
                                   b: 0.9 * 255},
                         end: {h: 180,
                               s: 255,
                               b: 255}};
        _.times(10,(i)=>{
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
                        // pNoFill: true,
                        pNoStroke: true,
                        // pstrokeWeight: (i * (i * 0.2)),
                        // strokeColor: color,
                        fillColor: explosion,
                        pscale: {min: 1.0, max: 6.3},
                        alpha: {min: 255, max: 20}};
            particleSystem.add(data);
        });
    };

    self.pickup = function (pos){
        var color = {start: {h: 200,
                             s: 200,
                             b: 255},
                     between: {h: 250,
                               s: 200,
                               b: 255},
                     end: {h: 200,
                           s: 200,
                           b: 255}};
        _.times(10, () =>{
            var data = {lifeTime: 190,
                        betweenLife: 40,
                        pos: pos.copy(),
                        vel: randomVector(-5, 5),
                        dim: createVector(10, 10),
                        type: "ellipse",
                        // friction: 0.89,
                        pNoFill: true,
                        strokeColor: color,
                        pstrokeWeight: random(2, 8),
                        pscale: {min: 4.1, max: 0.3},
                        alpha: {min: 200, max:  50}};
            self.add(data);
        });
    };

    self.respawnExplosion = function(pos) {
        var sat = 100;
        var explosion = {start: {h: 200,
                                 s: 255 * 0.2,
                                 b: 255},
                         between: {h: 180,
                                   s: 0.2 * 255,
                                   b: 0.9 * 255},
                         end: {h: 220,
                               s: 255 * 0.3,
                               b: 255}};
        _.times(12, (i) => {
            var radius = 18;
            var vel = createVector(sin(i) * radius, cos(i) * radius);
            // vel.add(randomVector(-5, 5));
            var data = {lifeTime: 140,
                        betweenLife: 60,
                        pos: pos.copy(),
                        vel: vel,
                        dim: createVector(5, 5),
                        type: "rect",
                        friction: 0.91,
                        pNoStroke: true,
                        // pNoFill: true,
                        // pstrokeWeight: 10,
                        fillColor: explosion,
                        pscale: {min: 5.1, max: 20.3},
                        alpha: {min: 200, max: 0}};

            var data2 = Object.assign({}, data);
            data2.lifeTime = 100;
            data2.pos = pos.copy();
            data2.friction = 0.99;
            data2.dim = createVector(20, 20);
            data2.vel = createVector(sin(i) * 4, cos(i) * 4);

            self.add(data2);
            self.add(data);
        });

        _.times(40, (i) => {
            var radius = 10;
            var vel = createVector(sin(i) * radius, cos(i) * radius);
            vel.add(randomVector(-3, 3));
            var withStroke = {lifeTime: 120,
                              betweenLife: 100,
                              pos: pos.copy(),
                              vel: vel,
                              dim: createVector(10, 10),
                              type: "rect",
                              friction: 0.99,
                              // pNoStroke: true,
                              pNoFill: true,
                              pstrokeWeight: 3,
                              strokeColor: explosion,
                              pscale: {min: 5.1, max: 3.3},
                              alpha: {min: 255, max: 0}};
            self.add(withStroke);
        });
    };

    self.explosion = function(pos){
        // NOTE: make sure you always copy the position being passed when creating a new particle
        // other wise particles will all share the same position and behave weird
        _.times(8, (i)=>{
            var explosion = {start: {h: random(255),
                                     s: 255 * 0.2,
                                     b: 255},
                             between: {h: random(255),
                                       s: 0.2 * 255,
                                       b: 0.9 * 255},
                             end: {h: 180,
                                   s: 255,
                                   b: 255}};
            var data = {lifeTime: 70,
                        betweenLife: 50,
                        pos: pos.copy(),
                        vel: randomVector(-10, 10),
                        dim: createVector(15, 15),
                        type: "rect",
                        friction: 0.89,
                        pNoStroke: true,
                        // pNoFill: true,
                        // pstrokeWeight: 10,
                        fillColor: explosion,
                        pscale: {min: 5.1, max: 15.3},
                        alpha: {min: 200, max: 0}};
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
    // clog(keyToFns);

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
                // clog(fn, v);
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
    // self.color = color;
    self.friction = ifNull(friction, 0.98);
    var maxLife = lifeTime;
    var lifeTime = maxLife;
    self.dl = lifeTime;
    var angle = self.vel.heading();

    self.isDead = function(){
        return lifeTime <= 0;
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
        // self.pos.add(self.vel.copy().mult(dt));
    };

    function mapLife(_min, _max){
        var l = map(lifeTime, maxLife, 0, _min, _max);
        // l = constrain(l, _min, _max);
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
        // ellipse(p1.x, p1.y, 10, 10);
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
        // linePassThrew(self.pos, createVector(self.pos.x + cos(angle) * (s * self.dim.x),
        //                                      self.pos.y + sin(angle) * (s * self.dim.y)));
        pop();
    }

    function drawShape(){
        var s = mapLife(pscale.min, pscale.max);
        // push();
        push();
        // colorMode(HSB);
        colorMode(HSB, 360, 255, 255, 255);
        rectMode(CENTER);
        if(pNoFill) noFill();
        if(pNoStroke) noStroke();
        if(pstrokeWeight) strokeWeight(pstrokeWeight);
        if(strokeColor) stroke(colorMapWithBetween(strokeColor));
        if(fillColor) fill(colorMapWithBetween(fillColor));

        if(type === "rect"){
            // {:rect []}
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
        // pop();
    }

    self.display = function(){

        // line(self.pos.x, self.pos.y, pmouseX * s, pmouseY * s);
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
    var numCycles = ifNull(numberOfCycles, 0);
    var usesFrames = false;

    this.useFrames = function() {
        usesFrames = true;
    };

    this.canRun = function() {
        var curr = (usesFrames) ? frameCount : millis();
        if(lastInterval < 0) lastInterval = curr;
        if(curr-lastInterval >= interval) {
            lastInterval = curr;
            if(numCycles > 0 && ++cycleCounter >= numCycles) stop();
            return true;
        }
        return false;
    };

    function stop() {
        numCycles = 0;
        lastInterval = -1;
    }
}


function Background(){
    var self = this;
    var cells = [];
    var triangles = newTriangles();
    var backgroundTriangles = map2D(80, (x, y) =>{
        return new Tri(random(1), random(1), x, y, 4.3, 12, 43);
    });

    var timer = new Timer(100);
    var temp = [];
    var index = 0;
    this.maxCount = 300;
    this.count = this.maxCount;

    function newTriangles(){
        var big = map2D(60, (x, y) => {
            if((x > 100 && x < 340) || (x > 600 && x < 850)){
                var t;
                if(chance(0.5)){
                    t = new Tri(x, y,
                                   {scale: 2.5,
                                    saturation: 100,
                                    brightness: 100,
                                    shimmerData: {min: -17,
                                                  max: 10}});
                } else {
                    t =  new Tri(x, y,
                                   {scale: 2.5,
                                    saturation: 100,
                                    brightness: 100,
                                    shimmerData: {min: 0,
                                                  max: 30}});
                }

                // return new Tri(random(1), random(1), x, y, 2.5, 100, 100);
            }
        });
        // var background = map2D(80, (x, y) =>{
        //     return new Tri(random(1), random(1), x, y, 4.3, 12, 43);
        // });
        var small = map2D(160, (x, y) =>{
            if((y > 100 && y < 340) || (y > 400 && y < 650)){
                return new Tri(random(1), random(1), x, y, 2.2, 100, 83);
            }
        });
        return _.concat(big, small); // _.concat(big, small);
    }

    function map2D(step, fn){
        return _.flattenDeep(_.map(_.range(-step, width + step, step), x =>{
            return _.map(_.range(-step, height + step, step), y => {
                return fn(x, y);
            });
        }));
    }

    function spawnBackgroundCells(){
        // TODO change how your doing this
        if(index < temp.length && timer.canRun()){
            cells.push(temp[index]);
            index++;
        }
    }

    self.display = function(){
        if(whiteOutMode){
            var fillColor = cmap(this.count, this.maxCount, 0, 255, 0);
            backgroundTriangles.forEach(tri => {
                if(tri){
                    var bri = cmap(this.count, this.maxCount, 0, 100, tri.minBrightness);
                    tri.brightness = bri;
                }
            });
            fill(fillColor);
            rect(0, 0, width, height);
            this.count--;
        }
        if(this.count <= 0) {
            whiteOutMode = false;
            this.count = this.maxCount;
        }

        backgroundTriangles.forEach(t => {if(t) t.display();});
        cells.forEach(c => {c.display();});
        triangles.forEach(t => {if(t) t.display();});
    };

    self.update = function(){
        // spawnBackgroundCells();
        // triangles.forEach(t => {t.update();});
        cells.forEach(cell => {
            cell.update();
            if(AABBvsAABB(cell, {pos: player.pos.copy(),
                                 dim: createVector(150, 150)})){
                cell.applyForce(randomVector(-1, 1));
            }
        });
    };
}

function Tri(x, y, {hue, saturation, brightness, scale, shimmerData}){
    var self = this;
    var right = PI/2;
    var left = -PI/2;
    var angle = chance(0.5) ? left: right;

    self.pos = createVector(x, y);
    self.minBrightness = brightness;
    self.brightness = brightness;
    self.hue = hue || defaultHue();
    var shimmerOffset = random(10, 20);
    // var hue = {green: 239, blue: 159};
    // var lowerHealthHue = {red: 299, purple: 287};

    function defaultHue(){
        return chance(0.5) ? 239 : 159;
    }

    function shimmer(min, max, scale, offset){
        offset = offset || 1;
        scale = scale || 1;
        return map(sin(shimmerOffset + offset + y + millis() * (0.0016 * scale)), -1, 1, min, max);
    }

    self.display = function(){
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
        var alpha = map(player.pos.dist(self.pos), 200, 0, 0.01, shimmer(0.3, 0.5, 0.85, 50));
        fill(self.hue + shimmer(shimmerData.min, shimmerData.max), saturation, brightness, alpha);

        // if(c < 0.5){
        //     // hsb 239 68 59
        //     // rgb 48 50 150
        //     // b 59 s 68
        //     // blue
        //     fill(239 + shimmer(-17, 10), sat, self.brightness, alpha);
        // } else {
        //     // hsb 159 84 91
        //     // rgb 38 232 165
        //     // b 91 s 84
        //     fill(159 + shimmer(0, 30), sat, self.brightness, alpha);
        // }

        translate(x, y);
        var points = {x1: 0,
                      y1: 0,
                      x2: 60 * scale,
                      y2: 0,
                      x3: 30 * scale,
                      y3: 60 * scale};

        rotate(angle);
        if(angle === left){
            triangle(points.x1, points.x1, points.x2, points.y2, points.x3, points.y3);
        } else {
            triangle(points.x1, points.y1, points.x2, points.y2, points.x3, points.y3);
        }
        pop();
    };
}
