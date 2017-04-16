// if your a dev trying to learn something from the source code
// take everything with a grain of salt. This is my first significant game written in Javascript and
// currently there's a lot of clean up and refactoring I need to do before I feel like this code is presentable.
// When its done i will put it up on github

var debugText = textStackFn(20, 40, 20);
var whiteOutMode = false;

var gameBackground;
var particleSystem;
var pickupManger;
var screenShake;
var enemyManager;
var shake;
var bullets;
var player;
var gameAudio;
var startScreenEntities = [];

const dt = 1/60.0;
var RESPAWN_POSITION;
var currentTime = 0;

var debug = false;
var gameNotStarted = true;
var score = 0;
var scoreParams = {killedEnemy: 1000, pickUp: 100, hitPickup: -400};

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
        pickupEffect.setVolume(0.2);
        pickupEffect.play();
    };

    self.playBulletShot = function(){
        var index = int(random(0, 6));
        var toneShot = toneShots[index];
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

function removeIfdead(entities){
    for(var i = entities.length - 1; i >= 0; i--){
        if(entities[i].isDead()){
            arrayRemove(entities, i);
        }
    }
}

function EnemyManager(bullets){
    var self = this;
    var enemies = [];

    self.init = function(){
        // _.times(10, (i) => {
        //             var e = new Enemy();
        //             enemies.push(e);
        //             return e;
        //         });
    };
    self.getEnemies = function(){
        return enemies;
    };

    function explosiveForce(explodedEnemy, entity, _scale){
        screenShake.setRange(-12, 12);
        var maxScale = _scale;
        var explosionRadius = 300;
        var distance = entity.pos.dist(explodedEnemy.pos);

        var scale = map(distance, 0, explosionRadius, maxScale, maxScale * 0.35);
        if(distance < explosionRadius){
            var center = rectCenter(entity);
            var target = center.sub(rectCenter(explodedEnemy)); // vector pointing away from enemy that exploded
            target.normalize();
            target.mult(scale);
            return target;
        }
        return createVector();
    }

    self.applyExplosiveForce = function(entity){
       enemies.forEach(function(e){
            e.applyForce(explosiveForce(entity, e, 150));
       });
    };

    function checkBulletCollision(e){
        bullets.forEach(function(b){
            if(AABBvsAABB(b, e)){
                score+=scoreParams.killedEnemy;
                gameAudio.playExplosion();
                e.handleCollision("bullet");
                player.applyForce(explosiveForce(e, player, 200));
                b.kill();
                self.applyExplosiveForce(e);
                e.init();
            }
        });
    }

    self.update = function(dt){
        enemies.forEach(function(e){
            if(AABBvsAABB(player, e)){
                if(player.health.equals(2)){
                    gameBackground.transitionToLowHealth();
                }
                gameAudio.playExplosion();
                whiteOutMode = true;
                e.handleCollision("player");
                self.applyExplosiveForce(e);
                player.applyForce(explosiveForce(e, player, 200));
                player.health.sub(1);
                e.init();
            }
            checkBulletCollision(e);
            e.update(dt, enemies);
        });
    };

    self.display = function(){
        enemies.forEach(function(e){
            e.display();
        });
    };

}

function endScreen(){
    push();
    fill(255);
    textSize(32);
    text("GAME OVER", (width/2) - 100, height/2);
    text("press SPACE to restart", (width/2) -100, (height/2) + 32);
    pop();
}

function init(){
    score = 0;
    bullets = [];
    pickupManger = new PickupManger();
    enemyManager = new EnemyManager(bullets);
    enemyManager.init();
    player = new Player(RESPAWN_POSITION.x, RESPAWN_POSITION.y, bullets);
}

function preload(){
    gameAudio = new Audio();
    gameAudio.preload();
}

function startScreen(){
    push();
    textSize(32);
    fill(255);
    var x = (width/2) - 260;
    var y = (height/2) - 80;

    text("WIP - Untitled game ", x, y);
    text("press SPACE to start", x, y + 32);
    text("click with your mouse to move", x, y + (32 * 2) );
    text("press D and A key to shoot", x, y + (32 * 3) );
    pop();
}

function setup(){
    // 3 : 2 aspect ratio
    var canvas = createCanvas(1200, 800);
    RESPAWN_POSITION = Object.freeze(createVector(width/2, height/2));
    canvas.parent('container');
    gameBackground = new Background();
    screenShake = new ScreenShake();
    init();
    textFont("Space Mono");
    particleSystem = new ParticleSystem();

    if(debug){
        var gui = new dat.GUI();
        gui.add(player, 'friction').min(0.9).max(1).step(0.005).listen();
        gui.add(player, 'maxDistance').min(100).max(300).step(1).listen();
        gui.add(player, 'reset');
        gui.add(player, 'holdToMove').listen();
    }
    gameAudio.backgroundLoop();
}

function EntityContainer(){
    var self = this;
    var entities = [];
    var entitiesByType = {};

    function addByType(entity){
        //constructor name will return a string
        var array = entitiesByType[entity.constructor.name];
        if(array){
            array.push(entity);
        } else {
            entitiesByType[entity.constructor.name] = [entity];
        }
    }

    self.push = function(entity){
        entities.push(entity);
        addByType(entity);
    };

    self.getAll = function(){
        return entities;
    };

    self.get = function(type){
        // type is string eg Bullet Enemy
        return entitiesByType[type];
    };
}

function PickupManger(){
    var self = this;
    var pickups = [];
    var pickupTimer = new Timer(1000);
    var totalSpawnedCount = 0;
    var diagonalSpawnedCount = 0;

    // RULE OF THIRDS
    var thirdWidth = (width/3);
    var thirdHeight = (height/3);
    var sixthWidth = (width/8);
    var sixthHeight = (height/8);
    // \
    var diagonalBack = [createVector((thirdWidth - sixthWidth),
                                     (thirdHeight - sixthHeight)),
                        createVector((thirdWidth * 2) + sixthWidth,
                                     (thirdHeight * 2) + sixthHeight)];
    // /
    var diagonalForward = [createVector((thirdWidth * 2) + sixthWidth,
                                        (thirdHeight - sixthHeight)),
                           createVector((thirdWidth - sixthWidth),
                                        (thirdHeight * 2) + sixthHeight)];
    var topHorizontal = [createVector((thirdWidth - sixthWidth),
                                      (thirdHeight - sixthHeight)),
                         createVector((thirdWidth * 2) + sixthWidth,
                                      (thirdHeight - sixthHeight))];
    var bottomHorizontal = [createVector((thirdWidth * 2) + sixthWidth,
                                         (thirdHeight * 2) + sixthHeight),
                            createVector((thirdWidth - sixthWidth),
                                         (thirdHeight * 2) + sixthHeight)];
    var verticalRight = [createVector((thirdWidth * 2) + sixthWidth,
                                      (thirdHeight - sixthHeight)),
                         createVector((thirdWidth * 2) + sixthWidth,
                                      (thirdHeight * 2) + sixthHeight)];
    var verticalLeft = [createVector((thirdWidth - sixthWidth),
                                     (thirdHeight - sixthHeight)),
                        createVector((thirdWidth - sixthWidth),
                                     (thirdHeight * 2) + sixthHeight)];

    self.getPickups = function(){
        return pickups;
    };

    function nextIndex(){
        return pickups.length % 2;
    }

    function diagonlSpawn(){
        // player in top left or bottom right corner spawn diagonalForward
        diagonalSpawnedCount++;
        if((player.pos.x < width/2 && player.pos.y < height/2) ||
           (player.pos.x > width/2 && player.pos.y > height/2 )){
            return diagonalForward[nextIndex()];
        } else {
            return diagonalBack[nextIndex()];
        }
    }

    function horizontalSpawn(){
        if(player.pos.y > height/2){
            return topHorizontal[nextIndex()];
        } else {
            return bottomHorizontal[nextIndex()];
        }
    }
    function verticalSpawn(){
        if(player.pos.x < width /2){
            return verticalRight[nextIndex()];
        } else {
            return verticalLeft[nextIndex()];
        }
    }

    function spawnPickup(){
        if(pickupTimer.canRun() && pickups.length <= 1 && totalSpawnedCount  % 2 === 0){
            var pos;
            if(totalSpawnedCount % 4 === 0){
                pos = diagonlSpawn();
            } else if (totalSpawnedCount % 6 == 0){
                pos = verticalSpawn();
            } else {
                // pickups are spawner more in the dialog positions since
                // this is the farest distance between pickups
                // making it more deficult to dodge enemies
                if(diagonalSpawnedCount < 4 || diagonalSpawnedCount % 6 === 0){
                    pos = diagonlSpawn();
                } else {
                    pos = horizontalSpawn();
                }
            }
            pickups.push(new PickUp(pos.copy().sub(10, 10)));
        }
    }
    self.display = function(){
        pickups.forEach(function (p) {
            p.display();
        });
    };

    self.update = function(){
        spawnPickup();
        bullets.forEach(function(b){
            pickups.forEach(function (p){
                if(AABBvsAABB(b, p)){
                    totalSpawnedCount++;
                    score += scoreParams.hitPickup;
                    gameAudio.playPickupExplosion();
                    enemyManager.applyExplosiveForce(p);
                    p.kill();
                    b.kill();
                    screenShake.setRange(-8, 8);
                    particleSystem.bulletHitPickup(p);
                }
            });
        });
        for(var i = 0; i<pickups.length; i++){
            var p = pickups[i];
            if(AABBvsAABB(player, p) && !player.health.isZero()){
                if(player.health.equals(1)){
                    gameBackground.transitionToNormal();
                }

                totalSpawnedCount++;
                gameAudio.playPickupEffect();
                particleSystem.playerHitPickup(player.pos.copy());
                player.health.add(1);
                arrayRemove(pickups, i);
                score += scoreParams.pickUp;
            }
        }
        removeIfdead(pickups);
    };

}

function update(dt){
    particleSystem.update(dt);
    enemyManager.update(dt);
    pickupManger.update();
    bullets.forEach(function(b){
        b.update(dt);
    });
    removeIfdead(bullets);
    player.update(dt);
    wrapAroundScreen(player);
}

function draw(){
    background(0);

    gameBackground.display();
    stroke(255, 120);
    debugText("frameRate", int(frameRate()));
    translate(screenShake.amount.x, screenShake.amount.y);
    stroke(255, 100);
    noFill();
    rect(0, 0, width-1, height-1);

    if(gameNotStarted){
        if(key === " "){
            gameNotStarted=false;
            // setImageVisible("controlsGif", false);
        }
        return;
    }
    var newTime = millis();
    var frameTime = (newTime - currentTime) / 1000;
    currentTime = newTime;
    var deltaTime = min(frameTime, dt);
    while ( frameTime > 0.0 ){
        update(deltaTime);
        frameTime -= deltaTime;
    }
    push();
    textSize(32);
    fill(255);
    text("score:" + score, (width/2) - 80, 60);
    pop();
    screenShake.update();
    particleSystem.display();
    player.display();
    bullets.forEach(function(b){
        b.display();
    });
    enemyManager.display();
    pickupManger.display();
    if(player.health.isZero()){
        endScreen();
        if(keyIsPressed && key === " "){
            gameBackground.transitionToNormal();
            particleSystem.respawnExplosion(RESPAWN_POSITION);
            init();
        }
    }
}

function mousePressed(){
    particleSystem.mousePressed();
}

function mouseReleased(){
    if(!player.health.isZero()){
        player.mouseReleased();
    }
}

function hueDebug(){
    push();
    colorMode(HSB, 360, 255, 255, 255);
    _.times(360 / 19, i => {
        fill(i * 20, 255, 255);
        text("hue: " + i * 20, 50, 20 + (i * 20));
        noStroke();
        rect(50, 20 + (i * 20), 20, 20);
    });
    pop();
}
