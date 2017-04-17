function Player(x, y, bullets){
    var self = this;
    self.pos = createVector(x, y);
    self.vel = createVector(0, 0);
    self.acc = createVector();
    self.dim = createVector(15, 15);
    self.shoot = new ShootComponent(300, bullets);
    self.shoot.shotSound = gameAudio.playBulletShot;
    self.health = new HealthComponent(4);
    self.maxDistance = 400;
    self.friction = 0.99;
    self.holdToMove = false;
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

    self.applyForce = function(force){
        self.acc.add(force);
        self.vel.add(self.acc);
    };

    self.mouseReleased = function(){
        if(!self.holdToMove){
            self.vel.add(self.acc);
        }
    };

    self.reset = function(){
        self.friction = 0.99;
        // self.maxDistance = 200;
    };

    self.display = function(){
        push();
        if(debug){
            push();
            var mouse = mouseVector();
            var dir = mouse.copy().sub(self.pos);
            fill(255);
            text("acc distance: " + int(dir.mag()), self.pos.x, self.pos.y - 60);
            stroke(255, 200);
            line(mouse.x, mouse.y, self.pos.x + self.dim.x / 2, self.pos.y + self.dim.y / 2);
            stroke(255, 200);
            noFill();
            ellipse( self.pos.x + self.dim.x / 2, self.pos.y + self.dim.y / 2, self.maxDistance * 2, self.maxDistance * 2);
            pop();
        }
        noStroke();
        fill(fillColor);
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    };

    self.update = function(dt){
        const accScale = 1.7;
        const bulletScale = -0.08;
        particleSystem.health(self);
        if(!self.health.isZero()){
            if(mouseIsPressed){
                self.shoot.fireFrom(self, hitMove(self, bulletScale));
            }
                self.acc = hitMove(self, accScale);
        }
        if(self.holdToMove){
            self.acc = hitMove(self);
            self.vel.add(self.acc);
        }

        self.vel.mult(self.friction);
        self.vel.limit(self.maxDistance + 100);
        self.pos.add(self.vel.copy().mult(dt));
    };
}
