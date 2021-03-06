function ShootComponent(interval, bullets){
    // shooting behavior
    // updating of bullets in done out side of the entity this is used in to prevent removing all the
    // bullets when the entity is killed and removed
    // TODO:rethink this
    var self = this;
    self.bullets = bullets;
    self.interval = interval || 200;
    self.blockInterval = 600;
    var max = 1000; // maximum number of bullets
    var timer = new Timer(self.interval);

    self.shotSound = function(vel){};

    self.fireFrom = function(entity, vel){
        if(timer.canRun()){
            self.shotSound(vel);
            self.bullets.push(new Bullet(entity.pos.copy(), vel));
            screenShake.setRange(-1.2, 1.2);
        }
    };
}
