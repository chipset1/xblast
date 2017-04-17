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
