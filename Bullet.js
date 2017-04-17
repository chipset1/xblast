function Bullet(pos, vel){
    var self = this;
    self.pos = pos;
    self.vel = vel || createVector(-5, 0);
    self.dim = createVector(20, 20);
    const velScale = 65;
    const velLimit = 12;
    var isDead = false;
    self.init = function(posX, posY, vel){
        self.pos.x = posX;
        self.pos.y = posY;
        self.vel = vel;
    };
    self.kill = function(){
        isDead = true;
    };
    self.isDead = function(){
        return isDead;
    };

    self.update = function(dt){
        if(self.pos.x < 0 || self.pos.x > width){
            self.kill();
        }
        particleSystem.fromBullet(self);
        self.vel.limit(velLimit);
        self.pos.add(self.vel.copy().mult(dt * velScale));
    };
    self.display = function(){
        fill(0,0,255, 120);
        noStroke();
        rect(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
    };
}
