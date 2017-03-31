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
    var shot;

    function loadAudio(){
    }

    self.preload = function(){
        pickupEffect = loadSound("assets/audio/pickupEffect.wav");
        pickupExplosion = loadSound("assets/audio/pickupExplosion.wav");
        explosions.push(loadSound("assets/audio/explosion.wav"));
        explosions.push(loadSound("assets/audio/explosion2.wav"));
        background = loadSound("assets/audio/background.wav");
        shot = loadSound("assets/audio/shot.wav");
    };

    self.playPickupExplosion = function(){
        pickupExplosion.rate(0.9);
        pickupExplosion.play();
    };

    self.playPickupEffect = function(){
        // pickupEffect.rate(random(1.0, 1.2))
        pickupEffect.setVolume(0.2);
        pickupEffect.play();
    };
    self.playBulletShot = function(){
        // explosion.rate(2.0);
        // shot.setVolume(0.01);
        // shot.rate(random(1.0, 1.05));
        shot.play();
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
                // particleSystem.explosion(player.pos.copy());
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
    var pickups = [];
    var pickupTimer = new Timer(1000);
    var self = this;
    var count = 0;
    var diagonalSpawnCount = 0;

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
        diagonalSpawnCount++;
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
        if(pickupTimer.canRun() && pickups.length <= 1 && count % 2 === 0){
            var pos;
            if(count % 4 === 0){
                pos = diagonlSpawn();
            } else if (count % 6 == 0){
                pos = verticalSpawn();
            } else {
                // pickups are spawner more in the dialog positions since
                // this is the farest distance between pickups
                // making it more deficult to dodge enemies
                if(diagonalSpawnCount < 4 || diagonalSpawnCount % 6 === 0){
                    pos = diagonlSpawn();
                } else {
                    pos = horizontalSpawn();
                }
            }
            clog("dcount", diagonalSpawnCount);
            clog(count);
            // particleSystem.pickUp(createVector(pos.x + 10, pos.y + 10));
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
        for(var i = 0; i<pickups.length; i++){
            var p = pickups[i];
            if(AABBvsAABB(player, p) && !player.health.isZero()){
                count++;
                gameAudio.playPickupEffect();
                particleSystem.pickup(player.pos.copy());
                player.shoot.remainingBullets +=1;
                arrayRemove(pickups, i);
                score += scoreParams.pickUp;
            }
        }
        removeIfdead(pickups);
    };

}

function update(dt){
    particleSystem.update(dt);
    gameBackground.update();
    enemyManager.update(dt);
    pickupManger.update();

    var pickups = pickupManger.getPickups();

    bullets.forEach(function(b){
        pickups.forEach(function (p){
            if(AABBvsAABB(b, p)){
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
    bullets.forEach(function(b){
        b.display();
        b.update(dt);
    });
    removeIfdead(bullets);
    player.update(dt);
    wrapAroundScreen(player);
}

function draw(){
    background(0);
    stroke(255, 120);
    noFill();
    rect(0, 0, width - 1, height - 1);
    gameBackground.display();
    debugText("frameRate", int(frameRate()));
    // hueDebug();
    translate(screenShake.amount.x, screenShake.amount.y);
    // gameAudio.play();
    debugText("mouse: ", mouseVector());

    // startScreenEntities.forEach(t => { t.display();});
    if(gameNotStarted){
        // startScreen();
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
    text("bullets:" + player.shoot.remainingBullets, (width/2) - 80, height - 40);
    pop();
    screenShake.update();
    particleSystem.display();
    player.display();
    bullets.forEach(function(b){
        b.display();
    });
    enemyManager.display();
    pickupManger.display();

    //     e.display();
    // });
    if(player.health.isZero()){
        endScreen();
        // whiteOutMode=false;
        if(keyIsPressed && key === " "){
            particleSystem.respawnExplosion(RESPAWN_POSITION);
            init();
        }
    }
}

function mousePressed(){
    var explosion = {start: {h: random(255),
                                s: 255,
                                b: 0.5 * 255},
                        between: {h: random(255),
                                s: 0.2 * 255,
                                b: 0.9 * 255},
                        end: {h: 0,
                            s: 0,
                            b: 0}};
    var hue = 0.5;
    var s =  {start: {h: 240 + random(-5, 10),
                        s: 200,
                        b: 0.7 * 255},
                between: {h: 220,
                        s:200,
                        b: 0.9 * 255},
                end: {h: 240,
                    s: 200,
                    b: 200}};
    // particleSystem.pickup(mouseVector());
    _.times(1, i =>{
        var data = {lifeTime: 50,
                        betweenLife: 40,
                        pos: mouseVector(),
                        vel: randomVector(-10, 10),
                        dim: createVector(10, 10),
                        type: "rect",
                        friction: 0.96,
                        pNoStroke: true,
                        // pNoFill: true,
                        // pstrokeWeight: 10,
                        fillColor: explosion,
                        pscale: {min: 5.1, max: 10.3},
                        alpha: {min: 200, max: 0}};
        var data1 = {lifeTime: 50,
                        betweenLife: 30,
                        pos: mouseVector(), //.add(randomVector(-10, 10)),
                        // vel: randomVector(-12, 12).add(mouseVector().sub(createVector(pmouseX, pmouseY)).normalize()),
                        dim: createVector(5, 5),
                        vel: createVector(),
                        // friction: 0.98,
                        type: "ellipse",
                        // slowDownRatio: 0.3,
                        pNoFill: true,
                        pstrokeWeight: 5 + (i * i),
                        strokeColor: s,
                        pscale: {min: 12.1, max: 0.3},
                        alpha: {min: 200, max: 20}};
        particleSystem.add(data1);
    });
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
