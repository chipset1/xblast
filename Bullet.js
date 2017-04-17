function Bullet(pos, vel){
    this.pos = pos;
    this.vel = vel || createVector(-5, 0);
    this.dim = createVector(20, 20);
    const velScale = 65;
    const velLimit = 12;
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
