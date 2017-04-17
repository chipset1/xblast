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

    self.handleCollision = function(entityName){
        if(entityName === "player"){
            particleSystem.explosion(player.pos.copy());
        }
        particleSystem.explosion(self.pos.copy());
    };

    function resetDim(){
        var size = random(30, 100);
        self.dim = createVector(size, size);
    }

    self.applyForce = function(force){
        force.mult(velScale());
        self.externalForce.add(force);
    };

    function updateAlpha(){
        return cmap(player.pos.dist(self.pos), maxAlphaDistance, 0, minAlpha, maxAlpha);
    }

    self.display = function(){
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

    self.update = function(dt){
        reInitialize();
        var scale = velScale();
        self.vel.add(self.externalForce);
        self.pos.add(self.vel.copy().mult(dt * scale));
        self.externalForce.mult(0);
    };
}
