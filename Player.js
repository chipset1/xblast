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
        particleSystem.health(this);
        if(!this.health.isZero()){
            if(mouseIsPressed){
                this.shoot.fireFrom(this, hitMove(this, bulletScale));
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
