"use strict";

function SteerEnemy(){
    // this enemy moves to each of the seekTargets
    this.pos = createVector(100 + random(10), 100 + random(10));
    this.vel = createVector(10, 10); 
    this.acc = createVector();
    this.dim = createVector(40, 40);
    var timer = new Timer(1000);
    var sb = new SteerBehavior(random(0.1, 1.0), random(0.15, 0.5));
    var seekTargets = [createVector(100, 100),
                       createVector(100, height - 100),
                        createVector(width/2, height - 100),
                       createVector(width-100, 100),
                       createVector(width-100, height-100),
                       createVector(width/2, height/2),
                       createVector(width/2, 100)]                    
    var index = int(random(seekTargets.length));
    var friction = 0.80;

    this.setIndex = function(i){
        index = i % seekTargets.length;
    }

    this.handleCollision = function(entityName){
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
            var data = {lifeTime: 60, 
                        betweenLife: 30,
                        pos: this.pos.copy(),
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
    }

    this.resetDim = function(){
        // sb.setParams(random(0.1, 1.0), random(0.15, 0.5));
        var size = random(20, 30);
        this.dim = createVector(size, size);
    }

    this.applyForce = function(force){
        this.acc.add(force);
    }

    this.init = function(){
       this.pos = createVector(random(width), random(height)); 
    }

    this.display =function(){
        push();
        ellipseMode(CORNER);
        fill(255, 180);
        ellipse(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    }

    this.update = function(dt, enemies){
        index = index % seekTargets.length;
        var target = seekTargets[index];
        if(this.pos.dist(target) < 20 ){
            index++
        }
        // console.log(target);
        // sb.seek(this, createVector(width/2, height/2));
        sb.seek(this, target);
        // sb.seek(this, mouseVector());
        sb.separate(this, enemies)
        this.acc.mult(dt);
        this.vel.add(this.acc);
        this.vel.mult(friction);
        this.pos.add(this.vel);
        this.acc.mult(0);        
    }

}


function SteerBehavior(ms, mf){
    var maxSpeed = ifNull(ms, 1.5) * 60;
    var maxForce = ifNull(mf, 0.15) * 60;
    this.setParams = function(ms, mf){
        maxSpeed = ms;
        maxForce = mf;
    }
    this.wander = function(entity, angle){
        // var angleYScale = 1;
        var wanderR = 100;  
        var wanderD = 150;
        var periodScale = 0.01;
        var circle = entity.vel.copy(); //position of circle
        circle.normalize();
        circle.mult(wanderD);
        circle.add(entity.pos);

        var circleOffset = createVector();
        // var angle = millis() * periodScale;
        circleOffset.x = wanderR*cos(angle);
        circleOffset.y = wanderR*sin(angle);
        var target = createVector();
        target.x = circle.x + circleOffset.x;
        target.y = circle.y + circleOffset.y;
        this.seek(entity, target);
    }

    this.seek = function(entity, target){
        // entity is a object that has a vel and acc
        // come up with better name
        var desired = target.copy().sub(entity.pos);
        desired.normalize();
        desired.mult(maxSpeed);
        var steer = desired.sub(entity.vel);
        steer.limit(maxForce);
       // steer.mult(-1);
        entity.acc.add(steer)
    };
    this.separate = function(entity, seekers){
        var desiredSeparation = 20;
        var sum = createVector();
        var count = 0;
        // For every boid in the system, check if it's too close
        seekers.forEach(function(other){
          var d = entity.pos.copy().dist(other.pos);
          // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
          if ((d > 0) && (d < desiredSeparation)) {
            // Calculate vector pointing away from neighbor
            var diff = entity.pos.copy().sub(other.pos);
            diff.normalize();
            diff.div(d);        // Weight by distance
            sum.add(diff);
            count++;            // Keep track of how many
          }
            // Average -- divide by how many
          if (count > 0) {
            sum.div(count);
          // Our desired vector is the average scaled to maximum speed
            sum.normalize();
            sum.mult(maxSpeed);
          // Implement Reynolds: Steering = Desired - Velocity
            var steer = sum.sub(entity.vel);
            steer.limit(maxForce);
            entity.acc.add(steer);
          }
        });
    }
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
    }
    this.kill = function(){
        isDead = true;
    }
    this.isDead = function(){
        return isDead;
    }

    this.update = function(dt){
        if(this.pos.x < 0 || this.pos.x > width){
            this.kill();
        } 
        particleSystem.fromBullet(this);
        this.pos.add(this.vel.copy(dt));
    }
    this.display = function(){
        fill(0,0,255, 120);
        noStroke();
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y); 
    }
}


function ShootComponent(interval, bullets){
    // shooting behavior
    // updating of bullets in done out side of the entity this is used in to prevent removing all the 
    // bullets when the entity is killed and removed 
    // TODO:rethink this
    this.bullets = bullets;
    this.interval = ifNull(interval, 200);
    this.blockInterval = 600;
    var max = 10; // maximum number of bullets
    this.remainingBullets = max; // how many bullets are left to shoot
    var timer = new Timer(this.interval);

    this.addToRemaining = function(value){
        if(this.remainingBullets < max){
            this.remainingBullets += value;
        }
    }

    this.fireFrom = function(entity, vel){
        if(timer.canRun() && this.remainingBullets > 0){
            this.remainingBullets--;
            var v = ifNull(vel, createVector(-5, 0));
            this.bullets.push(new Bullet(entity.pos.copy(), "normal", "blue", v));
        }
    }
}

function PickUp(pos){
    this.pos = pos;//entity.pos.copy();
    this.vel = createVector();
    this.dim = createVector(20, 20);
    this.display = function(){
        push();
        noStroke();
        // fill(38, 232, 165, 180)
        // fill(78, 232, 165, 180)
        colorMode(HSB, 360, 100, 100, 100);
        fill(200, 98, 99);
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y)
        pop();
    }
}

function Enemy(pos){
    var self = this;
    this.id = 0;
    this.pos = pos;
    this.vel = createVector(-3 * 30, 0);
    this.acc = createVector();
    var size = random(30, 100);
    this.dim = createVector(size, size);
    var initLeft = false;

    function velScale(){
        return map(self.dim.x, 30, 100, 1, 0.40);
    }
    this.handleCollision = function(entityName){
        if(entityName === "player"){
            particleSystem.explosion(player.pos.copy());
        }
        particleSystem.explosion(this.pos.copy());
    }

    this.resetDim = function(){
        var size = random(30, 100);
        this.dim = createVector(size, size);
    }

    this.init = function(){
        var posL = createVector(0 - random(200, 500), random(100, height - 200));
        var posR = createVector(width + random(200, 500), random(100, height - 200));
        var velL = createVector(-6 * 30, 0);
        var velR = createVector(6 * 30, 0);
        this.vel = initLeft ? velL : velR;
        this.pos = initLeft ? posL : posR;
        initLeft = !initLeft;
    }

    this.applyForce = function(force){
        force.mult(velScale());
        this.acc.add(force);
    }

    this.display = function(){
        // asteriskImage();
        push();
        stroke(0, 40);
        fill(255, 180);
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    }

    this.update = function(dt){
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
    }
    this.sub = function(value){
        if(this.current > 0){
            this.current -= value;
        }
    }
    function underMax(){
        return self.current < self.max;
    }
    this.isZero = function(){
        return this.current <= 0;
    }
}

function Player(x, y, bullets){
    var self = this;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector();
    this.dim = createVector(15, 15);
    this.velScale = 8;
    this.shoot = new ShootComponent(300, bullets);
    this.health = new HealthComponent(10);
    var maxDistance = 80;

    function hitMove(entity){
        // todo: find better name for this
        // update the velocity of the entity based on 
        // where the mouse shoots it
        // example where mouse is x 
        // x----> e-->
        //     <--e<----x
        var mouse = mouseVector();  
        var dir = createVector();
        stroke(20, 20);
        line(mouse.x, mouse.y, entity.pos.x + entity.dim.x / 2, entity.pos.y + entity.dim.y / 2);
        if(mouseIsPressed){
            dir = mouse.sub(entity.pos);
            dir.mult(-1);
            dir.limit(maxDistance);
            // stroke(255,0,0, 20);
            // line(mouseX, mouseY, entity.pos.x + entity.dim.x / 2, entity.pos.y + entity.dim.y / 2);
        }
        return dir;
    }

    this.applyForce = function(force){
        this.acc.add(force);
        this.vel.add(this.acc);
    }

    this.mouseReleased = function(){
        particleSystem.playerExhaust(createVector(self.pos.x + self.dim.x / 2,
                                                  self.pos.y + self.dim.y / 2),
                                     this.acc.copy().mult(-1));
        this.vel.add(this.acc);
    };
    function drawTrail(){
        var number = map(self.vel.mag(), 0, 80, 1, 8);
        _.times(number, i => {
            var scale = map(i, 0, 8, 0.1, 1);
            var size = self.dim.x * map(i, 0, 8, 1, 0.5);
            var pos = self.pos.copy().add(self.vel.copy().mult(-1 *  scale)); 
            rect(pos.x, pos.y, size, size);
        });
    }

    this.display = function(){
        push();
        // fill(0,0,255, 120);
        // drawTrail();
        fill(255);
        text("bullets: " +  this.shoot.remainingBullets, this.pos.x, this.pos.y - 40);
        text("health: " + this.health.current, this.pos.x, this.pos.y - 20);
        noStroke();
        fill(255);
        rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y); 
        pop();
    };

    this.update = function(dt){
        if(!this.health.isZero()){
            if(keyDirection().y === 0){
                var bulletVel = keyDirection().mult(12);
                bulletVel.y =0;
                this.shoot.fireFrom(this, bulletVel);
            }
            this.acc = hitMove(this); 
        }
        // this.vel.mult(0.995);
        this.pos.add(this.vel.copy().mult(dt));
        // this.acc.mult(0);
    };
}

function Camera(player, xBounds, yBounds){
    this.offsetX = 0;
    this.offsetY = 0; 
    var position = player.pos;
    var rightEdge  = xBounds.max - width;
    var bottomEdge = yBounds.max - height;
    var maxYOffset = 0;
    this.update = function(){
        text("" + this.offsetY, 20, 60);
        this.offsetX = (position.x - width/2) + (player.dim.x / 2);
        this.offsetY = (position.y - height/2) + (player.dim.y / 2);
        // if(keyDirection().y < 0){
        //     maxYOffset += keyDirection().y;
        // } 
        if(this.offsetX < 0) {
            this.offsetX= 0;
        }
        if(this.offsetY < yBounds.min) {
            this.offsetY = yBounds.min;
        } 
        if(this.offsetX > rightEdge) {
            this.offsetX = rightEdge;
        }
        if(this.offsetY > bottomEdge ) {
            this.offsetY = bottomEdge;
        }
    };
}

function ScrollComponent() {
    this.scrollScale = random(0.2, 1); //returnRandom([0.3, 0.5, 0.7, 0.6]) 
    this.scrollOffset = 0;
    this.scrollLeft = function(entity){
        var tDir = keyDirection();
        // if(tDir.x < 0) tDir.x = 0;
        this.scrollOffset += tDir.x * 0.01;
        this.scrollOffset = min(this.scrollOffset, 1); 
        entity.pos.x -= this.scrollOffset * this.scrollScale;
    }
}

function Sprite(imageName, pos, {dim, imagePostfix}){
    var self = this;
    this.pos = pos;
    this.dim = createVector();
    this.scale = 1;
    this.angle = 0;
    this.img = loadImage(imageName + ifNull(imagePostfix, ".png"), 
                        function(img){
                            var imgDim = createVector(img.width, img.height);
                            self.dim = ifNull(dim, imgDim);
                        },
                        function (){
                            console.log("failed to load image");
                        });

    this.display = function(){
        push();
        translate(this.pos.x , this.pos.y);
        rotate(this.angle);
        image(this.img, 0, 0, this.dim.x * this.scale, this.dim.y * this.scale);
        // image(this.img, 0, 0);
        pop();
    };
}

function ParticleSystem(){
    var self = this;
    var particles = [];
    self.add = function(pdata){
        particles.push(new Particle(pdata));
    }
    self.update = function(dt){
        particles.forEach(p =>{
            // println(p);
            p.update(dt);
        });
        for(var i = particles.length - 1; i >= 0; i--){
            if(particles[i].isDead()){
                arrayRemove(particles, i);
            }
        }
    }

    self.pickUp = function (pos){
        var color = {start: {h: 140,
                             s: 200, 
                             b: 255}, 
                     between: {h: 160,
                               s: 200, 
                               b: 255}, 
                     end: {h: 200,
                           s: 200,
                           b: 255}};
        _.times(10,(i)=>{
            var data = {lifeTime: 100, 
                        betweenLife: 80,
                        pos: pos.copy(),
                        vel: createVector(),
                        dim: createVector(20 + (i * (i * 0.2)), 20 + (i * (i * 0.2))), 
                        type: "rect",
                        friction: 0.88,
                        pNoFill: true,
                        pstrokeWeight: (i * (i * 0.2)),
                        strokeColor: color,
                        pscale: {min: 13.0, max: 0.3},
                        alpha: {min: 200, max: 80}};
            self.add(data);
        })
    }

    self.fromBullet = function(bullet){
        var color = {start: {h: 240,
                             s: 200, 
                             b: 255}, 
                     between: {h: random(310 - 30, 330 - 30),
                               s: 200, 
                               b: 255}, 
                     end: {h: 350,
                           s: 200,
                           b: 255}};
        _.times(1, () =>{
            var data = {lifeTime: 60, 
                        betweenLife: 50,
                        pos: bullet.pos.copy().add(createVector(bullet.dim.x/2, bullet.dim.y/2) ),
                        vel: randomVector(-2, 2),
                        dim: createVector(20, 20), 
                        type: "rect",
                        friction: 0.88,
                        pNoStroke: true,
                        fillColor: color,
                        pscale: {min: 1.0, max: 0.3},
                        alpha: {min: 200, max: 80}};
            self.add(data);
        });
    }

    self.playerExhaust = function (pos, dir){

        var count = map(dir.mag(), 0, 80, 1, 13);
        dir.normalize();
        var color = {start: {h: random(180, 200),
                             s: 255, 
                             b: 255}, 
                     between: {h: random(150, 180),
                               s: 200, 
                               b: 255}, 
                     end: {h: 100,
                           s: 200,
                           b: 255}};
        _.times(count, i => {
            var sw = map(i, 1, 15, 2, 8);
            var data = {lifeTime: 60, 
                        betweenLife: 50,
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
    }

    self.pickup = function (pos){
        var color = {start: {h: 200,
                             s: 200, 
                             b: 255}, 
                    between: {h: 320,
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
                        type: "rect",
                        // friction: 0.89,
                        pNoFill: true,
                        strokeColor: color,
                        pstrokeWeight: random(2, 8),
                        pscale: {min: 4.1, max: 0.3},
                        alpha: {min: 200, max: 20}};
            self.add(data);
        });            
    }

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
        var data = {lifeTime: 50, 
                            betweenLife: 40,
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
                            alpha: {min: 200, max: 120}};
        self.add(data);
      }); 
    }

    self.display = function(){
        particles.forEach(p =>{
            p.display();
        });
    }
}

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
    var angle = self.vel.heading();

    self.isDead = function(){
        return lifeTime <= 0;
    }

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
    }

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
        // console.log("asdf");
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
            // console.log("line");
            drawLine();
        }else {
            drawShape();
        }
    }
}

function AnimatedParticle(imageNames, pos, maxScale){
    var animation = new Animation(imageNames, pos, random(1/30, 1/2));
    var alpha = 255; 
    var scale = 1;
    var time = 100; // time to stay alive in frames

    this.isDead = function(){
        return time <=0;
    }
    this.update = function(){
        time--;
        alpha -= 255 / time;
        time = max(time, 0);
        scale = map(time, 100, 0, 1, maxScale);
        // scale = map(sin(millis() * 0.01), -1, 1, 0.4, masu);
        animation.getSprites().forEach(s => { s.scale = scale;});
        animation.update(1/120);
    }
    this.display = function(){
        push();
        // tint(255, 255, 255, alpha);
        imageMode(CENTER);
        stroke(0); 
        // text("size:" + scale, 20, 40);
        animation.display();
        pop();
    }
}

function Animation (imageNames, pos, frameTime, options) {
    var self = this;
    this.pos = pos;
    this.dim = createVector();
    var sprites = [];
    const FRAME_TIME = ifNull(frameTime, 1/12);
    var currentFrame = 0;
    var time = 0;

    for (var i = 0; i < imageNames.length; i++) {
        var sprite = new Sprite(imageNames[i], pos, ifNull(options, {})); 
        // the sprite with the biggest width and height gets set as the animations dimentions
        if(sprite.dim.x > this.dim.x && sprite.dim.y > this.dim.y){
            self.dim = imgDim;
        }
        sprites.push(sprite);
    };
    this.getSprites = function(){ return sprites;}

    this.update = function(elapsedTime){
        time += ifNull(elapsedTime, 1/60);
        if(time >= FRAME_TIME){
            currentFrame = (currentFrame + 1) % sprites.length;
            time -= FRAME_TIME;
        }
    };

    this.display = function(xpos, ypos) {
        sprites[currentFrame].display();
    
        // image(images[currentFrame], this.pos.x + this.offset.x, this.pos.y + this.offset.y, 
        //                             this.dim.x * this.scale, this.dim.y * this.scale);
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
    }

    this.canRun = function() {
        var curr = (usesFrames) ? frameCount : millis();
        if(lastInterval < 0) lastInterval = curr;
        if(curr-lastInterval >= interval) {
            lastInterval = curr;
            if(numCycles > 0 && ++cycleCounter >= numCycles) stop();
            return true;
        }
        return false;
    }
    
    function stop() {
        numCycles = 0;
        lastInterval = -1;
    }
}

function SlingEnemy(){
    var dir;
    var hitEnemy;
    var pHitEnemy;
    this.mousePressed = function(){
        var mouse = createVector(mouseX, mouseY);
        enemies.forEach(function(e){
            if(entityToPointHit(e, mouse.copy())){
                hitEnemy = e;
            }
        });
    };


    this.mouseReleased = function(){
        if(hitEnemy){
            hitEnemy.vel.add(dir);
        }
        // hitEnemy = null;
        pHitEnemy = hitEnemy;
    };

    this.getEnemy = function(){
        return hitEnemy;
    }

    this.update = function(dt){
        var mouse = createVector(mouseX, mouseY);
        if(hitEnemy && mouseIsPressed){
            line(mouseX, mouseY, hitEnemy.pos.x, hitEnemy.pos.y);
            dir = mouse.sub(hitEnemy.pos);
            dir.mult(-1);
            dir.limit(80);
            // push();
            stroke(20, 20);
            line(mouseX, mouseY, hitEnemy.pos.x, hitEnemy.pos.y);
            // pop();
        }

        enemies.forEach(function(e){
            if(AABBvsAABB(player, e)){
                player.health.current -=1;
                e.init();
            }
        });
    };
}

function Sampler(){
    var self = this;
    var fft = new p5.FFT(0.01);
    var mainLead;
    var letterToSamples = {}; // loaded samples
    var letterToSampleName = {a: "VEC3 Percussion 092.wav",
                              s: "VEC3 Percussion 093.wav",
                              d: "VEC3 Percussion 094.wav",
                              f: "VEC3 Percussion 095.wav",
                              g: "VEC3 Percussion 096.wav",
                              h: "VEC3 Percussion 097.wav",
                              j: "VEC3 Percussion 098.wav",
                              k: "VEC3 Percussion 099.wav",
                              l: "VEC3 Percussion 100.wav"};
    var currentTime = 0;

    // problem cueing sounds to in a loop
    // audio context time
    // current sounds will 

    self.preload = function(){
        // _.keys(letterToSamples)
        // letterToSamples.forEach((f, s) => {console.log(f, s);});

        var audioPath = "assets/audio/";
        _.forEach(letterToSampleName, (sampleName, key ) => {
            letterToSamples[key] = loadSound(audioPath + sampleName);
            console.log(audioPath + sampleName, key);
        });
        console.log(letterToSamples);
    };
    self.playSequence = function(sequence){
        // sequence is a string representing a drum loop
  //         function tick() {
  //   while(nexttick < context.currenttime + scheduleahead) {
  //     if(index >= pattern.length) {
  //       index = 0;
  //     }
  //     if(pattern.length) {
  //       nexttick += pattern[index].length;
  //       sampler.schedule( pattern[index], nexttick );
  //       index++;
  //     } else {
  //       nexttick += quarter;
  //     }
  //   }
  // }
        var endTime = (1/4) * sequence.length;
            _.times(sequence.length, function(index){
                var letter = sequence[index];
                self.play(letter, (1/4) * index);
                console.log(getAudioContext().currentTime);
            });
    }
    self.play = function(letter, startTime){
        letterToSamples[letter.toLowerCase()].play(startTime);
    };
    self.waveform = function(){
        fft.setInput(mainLead);
        return fft.waveform();
    };
    self.init = function(){
        mainLead.loop();
    };
}

function Background(){
    var self = this;
    var cells = [];
    var triangles = newTriangles();
    var timer = new Timer(100);
    var temp = [];
    var index = 0;

    _.times(2, i =>{
        _.times(22, j => {
            var size = 50;
            var cell = new Cell(0 + (j * size), 120 + (i * size), 50);
            cell.pos = createVector(random(-width, 0), random(height, height * 2));
            temp.push(cell);
            // cells.push(cell);
        });
    });

    function newTriangles(){
        var step = 60;
        return _.flattenDeep(_.map(_.range(-step, width + step, step), x =>{
            return _.map(_.range(-step, height + step, step), y => {
                    // if(x < 20 || y < 20 || x > width - 100 || y > height - 100){
                        if((x > 100 && x < 340) || (x > 600 && x < 850)){
                            return new Tri(random(1), random(1), x, y);
                        }
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
        cells.forEach(c => {c.display();});
        triangles.forEach(t => {if(t) t.display();});
    }

    self.update = function(){
        // spawnBackgroundCells();
        // triangles.forEach(t => {t.update();});
        cells.forEach(cell => {
            cell.update();
            if(AABBvsAABB(cell, {pos: createVector(mouseX, mouseY),
                                 dim: createVector(30, 30)})){
                cell.applyForce(randomVector(-12, 12));
            }
        });
    }
}

function Cell(x, y, size){
    var self = this;
    self.pos = createVector(x, y);
    var vel = createVector();
    var acc = createVector();
    self.dim = createVector(size, size);
    self.startPos = createVector(x, y);
    var maxDistance = 150;
    function towardStart(){
        return self.startPos.copy().sub(self.pos);
    }
    self.setStartPosToPos= function(acc){
        // vel.add(acc);
        // vel.mult(0.85);
        // self.pos.add(vel);
        acc.mult(0.85);
        self.startPos.add(acc);
    }
    self.moveToStartPos = function(){
        var dir = towardStart();
        var d = dir.mag();
        var m = map(d, 0, maxDistance, 0, 15);
        dir.limit(m);
        if(d <= maxDistance){
            // console.log(d, 'asdf');
            m = map(d,0, maxDistance,0, 5);
            dir.limit(m);
        }
        vel.add(dir);
    }
    self.applyForce = function(force){
        var d = towardStart().mag();
        var m = map(d,0, maxDistance,1, 0.2);
        m = constrain(m, 0.2, 1);
        // console.log(m);
        force.mult(m);
        acc.add(force);
    }
    self.display = function(){
        var md = map(self.startPos.dist(self.pos), 0, 150, 0, 1);
        md = min(md, 1);
        var fillColor = lerpColor(color(120, 255, 255, 120), color(random(152, 180), 255, 255, 120), md);
        // fill();
        push();
        noStroke();
        fill(fillColor);
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    }
    self.update = function(){
        self.moveToStartPos();
        vel.add(acc);
        vel.mult(0.85);
        self.pos.add(vel);
        acc.mult(0);
    }
}

function Tri(t, c, x, y){
    var self = this;
    self.pos = createVector(x, y);
    self.static = true;
    var shimmerOffset = random(10, 20);

    self.display = function(){
        push();
        colorMode(RGB);
        noStroke();
        var shimmer = map(sin(shimmerOffset + y + millis() * 0.0016), -1, 1, -50, 50);
        if(c < 0.5){
            fill(48, 50, 150 + shimmer, 120);
        } else {
            fill(38, 232 + shimmer, 165 + shimmer, 120);
        }
        translate(x, y);
        // ellipse(x, y, 10, 10);
        // if(t < 0.5){
        //     // down
        //     triangle(0, 0, 60, 0, 30, 60);
        // } else {
        //     // up
        //     triangle(0, 60, 30, 0, 60, 60);
        // } 
        var s = 2.5
        var points = {x1: 0,
                      y1: 0,
                      x2: 60 * s,
                      y2: 0,
                      x3: 30 * s,
                      y3: 60 * s};

        if(inbetween(t, 0.0, 0.5)){
            // right
            rotate(-PI/2);
            // scale(0.5);
            triangle(points.x1, points.x1, points.x2, points.y2, points.x3, points.y3);
        } else if (inbetween(t, 0.5, 0.75)){
            // left           
            rotate(PI/2);
            // scale(0.5);
            triangle(points.x1, points.y1, points.x2, points.y2, points.x3, points.y3);
        }
        pop();       
    }
}

