function Background(){
    var self = this;
    self.maxCount = 450;
    self.count = self.maxCount;

    const maxDistance = 200;
    const minAlpha = 0.25;
    const maxAlpha = 0.4;
    var whiteOutMode = false;

    var toNormalTransition = new Transition(2000);
    var toLowHealthTransition = new Transition(3000);
    var toStartTransition = new Transition(2000);

    var triangles = newTriangles();
    var bigTriangles = map2D(80, (x, y) =>{
        return defaultTri(x, y, {scale: 4.3, brightness: 32, saturation: 43});
    });
    var all = _.concat(bigTriangles, triangles);
    var lightUpTransition = new Transition(1000);
    var enemyPos = createVector();

    function defaultTri(x, y, customArgs){
        return new Tri(x, y, _.merge({scale: 2.5,
                                      hue: 239,
                                      saturation: random(50, 100),
                                      brightness: 100,
                                      shimmerData: {min: -17,
                                                    max: 10}},
                                     customArgs));
    }


    function newTriangles(){
        var tris1 = map2D(60, (x, y) => {
            if((x > 100 && x < 340) || (x > 600 && x < 850)){
                if(chance(0.5)){
                    return defaultTri(x, y);
                } else {
                    return defaultTri(x, y,
                                      {hue: 159,
                                       shimmerData: {min: 0,
                                                     max: 30}});
                }
            }
        });
        var tris2 = map2D(160, (x, y) =>{
            if((y > 100 && y < 340) || (y > 400 && y < 650)){
                // return defaultTri(x, y, {scale: 3.2, brightness: 83});
                if(chance(0.5)){
                    return defaultTri(x, y, {scale: 2.2, brightness: 83});
                } else {
                    return defaultTri(x, y,
                                      {hue: 159,
                                       scale: 2.2,
                                       brightness: 83,
                                       shimmerData: {min: 0,
                                                     max: 30}});
                }
            }
        });
        return _.concat(tris1, tris2);
    }

    function map2D(step, fn){
        var results = [];
        for(var x = -step; x < width + step; x+=step) {
            for(var y = -step; y < height; y+=step) {
                var r = fn(x, y);
                if(r) results.push(r);
            }
        }
        return results;
    }

    function shimmer(pos, min, max, scale, offset){
        return map(sin(offset + pos.y + millis() * (0.0016 * 0.85)), -1, 1, min, max);
    }

    function nextAlpha(tri){
        return map(player.pos.dist(tri.center()), maxDistance, 0, 0, shimmer(tri.pos, minAlpha, maxAlpha, 0.85, 50));
    }

    function mapCount(min, max){
        return map(self.count, self.maxCount, 0, min, max);
    }

    self.transitionToNormal = function(){
        toNormalTransition.start();
    };

    self.transitionToLowHealth = function(){
        toLowHealthTransition.start();
    };

    self.transitionToStart = function(){
        toStartTransition.start();
    };

    function lowHealth(){
        // change background tri colors when to player is low health and
        // back to its normal state. isTranstionToNormal is set when the player
        // collides with a pickup

        const hue = 320;
        const alpha = 0.2;
        const saturation = 70;
        const brightness = 100;
        if(player.health.equals(1) || player.health.equals(0)){
            all.map(function(tri, i){
                tri.hue = hue;
                tri.alpha = alpha;
                tri.saturation = saturation;
                tri.brightness = brightness;
            });
        }
        if(toLowHealthTransition.isRunning()){
            all.forEach(tri =>{
                var mapTransition = toLowHealthTransition.map;
                tri.alpha = mapTransition(nextAlpha(tri), alpha);
                tri.hue = mapTransition(tri.initialHue, hue);
                tri.saturation = mapTransition(tri.initialSaturation, saturation);
                tri.brightness = mapTransition(tri.initialBrightness, brightness);
            });
        }
        if(toNormalTransition.isRunning()){
            all.forEach(tri =>{
                var mapTransition = toNormalTransition.map;
                tri.alpha = mapTransition(alpha, nextAlpha(tri));
                tri.hue = mapTransition(hue, int(tri.initialHue));
                tri.saturation = mapTransition(saturation, tri.initialSaturation);
                tri.brightness = mapTransition(brightness, tri.initialBrightness);
            });
        }
    }

    self.endWhiteOut = function(){
        whiteOutMode = false;
        self.count = self.maxCount;
    };

    self.inWhiteOutMode = function(){
        return whiteOutMode;
    };

    self.activateWhiteOutMode = function(){
        whiteOutMode = true;
    };

    self.lightUpArea = function(_enemyPos){
        lightUpTransition.start();
        enemyPos = _enemyPos.copy();
    };

    function whiteOut(){
        if(whiteOutMode){
            var fillColor = mapCount(255, 0);
            bigTriangles.forEach(tri => {
                tri.brightness = mapCount(100, tri.initialBrightness);
            });

            triangles.forEach(tri => {
                tri.alpha = mapCount(maxAlpha, nextAlpha(tri));
                // tri.saturation = mapCount(200, tri.initialSaturation) + mapCount(random(10.0), 0);
            });
            fill(fillColor, 130);
            rect(0, 0, width, height);
            self.count--;
        }
        if(self.count <= 0) {
            self.endWhiteOut();
        }
    }

    function lightUpArea(){
        if(lightUpTransition.isRunning()){
            all.forEach((tri)=>{
                // tri.center().dist(enemyPos)
                if(tri.pos.dist(enemyPos) < 130){
                    tri.alpha = lightUpTransition.map(0.8, nextAlpha(tri));
                    tri.saturation = lightUpTransition.map(20, tri.initialSaturation) + lightUpTransition.map(random(10.0), 0);
                }
            });
        }
    }

    self.display = function(){
        all.forEach(tri => {tri.alpha = nextAlpha(tri);});
        whiteOut();
        lowHealth();
        lightUpArea();
        if(gameNotStarted) {
            all.forEach(tri =>{
                tri.alpha = lerp(nextAlpha(tri), 1.0, 0.35);
            });
        }
        if(toStartTransition.isRunning()) {
            all.forEach(tri =>{
                var alpha = lerp(nextAlpha(tri), 1.0, 0.3);
                tri.alpha = toStartTransition.map(alpha, nextAlpha(tri));
            });
        }
        all.forEach(t => {t.display();});
    };
}
