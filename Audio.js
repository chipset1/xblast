function Audio(){
    var self = this;
    var explosions = [];
    var background;
    var explosionIndex = 0;
    var pickupEffect;
    var pickupExplosion;
    var baseShot;
    var toneShots;

    const toneShotsCount = 5;

    self.preload = function(){
        pickupEffect = loadSound("assets/audio/pickupEffect.wav");
        pickupExplosion = loadSound("assets/audio/pickupExplosion.wav");
        explosions.push(loadSound("assets/audio/explosion.wav"));
        explosions.push(loadSound("assets/audio/explosion2.wav"));
        background = loadSound("assets/audio/background.wav");
        baseShot = loadSound("assets/audio/shot.wav");
        toneShots = _.range(0, toneShotsCount+1).map(num => {
            return loadSound("assets/audio/toneShots/" + num + ".wav");
        });
    };

    self.playPickupExplosion = function(){
        pickupExplosion.rate(0.9);
        pickupExplosion.play();
    };

    self.playPickupEffect = function(){
        pickupEffect.setVolume(0.7);
        pickupEffect.play();
    };

    self.playBulletShot = function(bulletVel){
        var index = int(random(0, 6));
        var toneShot = toneShots[index];

        var rate = cmap(bulletVel.mag(), 0, 13, 0.85, 1);
        baseShot.rate(rate);
        baseShot.play();
        toneShot.play();
    };

    self.backgroundLoop = function(){
        background.loop();
    };

    self.playExplosion = function(){
        var explosion = explosions[explosionIndex % explosions.length];
        explosion.rate(random(0.9, 1.0));
        explosion.play();
        explosionIndex++;
    };
}
