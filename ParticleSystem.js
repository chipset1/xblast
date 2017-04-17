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
        // debugText("particles", particles.length);
        particles.forEach(p =>{
            p.display();
        });
    };
}
