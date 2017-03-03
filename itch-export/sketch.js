// if your a dev trying to learn something from the source code 
// take everything with a grain of salt. This is my first significant game written in Javascript and
// currently there's a lot of clean up and refactoring I need to do before I feel like this code is presentable.
// When its done i will put it up on github

var debug = true;
var gameBackground;
var particleSystem;
var enemyManager;
var bullets;
var pickupTimer;
var pickups;
var player;
const dt = 1/60.0;
var currentTime = 0;
var gameNotStarted = true;
var score = 0;
var waveNumber = 1;
var wave2start = 100;

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

function EnemyManager(bullets){
    var self = this; 
    var enemies = [];
    this.spawnWave2 = true;

    self.init = function(){
        enemies = _.times(10, (i) => {
                    var e = new Enemy(createVector(random(-width, 0), random(50, height - 50)));
                    e.vel =  createVector(2 * 30, 0);
                    e.id = i;
                    return e;
                });
    }

    self.wave2 = function(){
        if(this.spawnWave2){
            waveNumber++;
            _.times(5, i=>{
                var s = new SteerEnemy();
                s.setIndex(i);
                enemies.push(s);
            });
            _.times(5, i=>{
                var e = new Enemy(createVector(random(-width, 0), random(50, height - 50)));
                e.vel =  createVector(2 * 30, 0);
                e.id = enemies.length + i;
                enemies.push(e);
            });
            this.spawnWave2 = false;
        }
    }

    self.getEnemies = function(){
        return enemies;  
    }

    function explosiveForce(explodedEnemy, entity, _scale){
        // ENHANMENT: have the distance affect the explosion force 
        var explosionRadius = 300;
        var scale = ifNull(_scale, 100);
        var distance = entity.pos.dist(explodedEnemy.pos);
        if(distance < explosionRadius){
            var center = rectCenter(entity);
            var target = center.sub(rectCenter(explodedEnemy)); // vector pointing away from enemy that exploded
            target.normalize();
            target.mult(scale);
            return target;
        }
        return createVector();
    }

    function applyExplosiveForce(explodedEnemy){
        // explosion affecting all enemies
       enemies.forEach(function(e){
            e.applyForce(explosiveForce(explodedEnemy, e));
       });
    }

    function checkBulletCollision(e){
        bullets.forEach(function(b){
            if(AABBvsAABB(b, e)){
                score+=10;
                // particleSystem.explosion(e.pos.copy());
                e.handleCollision("bullet");
                // particleSystem.playerExhaust(20, b.pos, b.vel.copy().normalize().mult(-5)); 
                player.applyForce(explosiveForce(e, player, 100));
                b.kill();
                applyExplosiveForce(e);
                e.init();
            } 
        });
    }

    self.update = function(dt){

        enemies.forEach(function(e){
            if(AABBvsAABB(player, e)){
                // particleSystem.explosion(player.pos.copy());
                e.handleCollision("player");
                applyExplosiveForce(e);
                player.applyForce(explosiveForce(e, player, 150));
                player.health.sub(1);
                e.init();
            }
            checkBulletCollision(e);
            // wrapAroundScreen(e);
            // if its moving left and is past the left side of the screen 
            // set the position to off the right side of the screen and randomize the y
            if(e.pos.y + e.dim.y < 0 || e.pos.y > height){
                e.init();
            }
            if(e.vel.x <0 && e.pos.x + e.dim.x < 0){
               e.pos.x = width + 100; 
               e.pos.y = random(e.dim.y, height - e.dim.y);
               e.resetDim();
               e.acc = createVector();
               e.vel = createVector(3 * 30, 0);
            }
            // if its moving right and is past the right side of the screen 
            // set the position to off the left side of the screen and randomize the y
            if(e.vel.x > 0 && e.pos.x > width){
               e.pos.x = -100; 
               e.pos.y = random(e.dim.y, height - e.dim.y);
               e.resetDim();
               e.acc = createVector();
               e.vel =  createVector(3 * 30, 0);
            }
            // e.setSeekTarget(player.pos.copy());
            e.update(dt, enemies);
            // e.update(dt)
        });
    }

    self.display = function(){
        enemies.forEach(function(e){
            e.display();
        });
    }

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
    // enemies = _.times(20, (i) => {
    //             var e = new Enemy(createVector(random(-width, 0), random(height)));
    //             e.vel =  createVector(2 * 30, 0);
    //             e.id =  i;
    //             return e;
    //         });
    score = 0;
    waveNumber = 1;
    bullets = [];
    pickups = [];
    pickupTimer = new Timer(4000);
    enemyManager = new EnemyManager(bullets);
    enemyManager.init();
    player = new Player(width/2, height/2, bullets);
}

function setup(){
    var canvas = createCanvas(1024, 720);
    canvas.parent('container');
    gameBackground = new Background();
    init();
    textFont("Space Mono");
    particleSystem = new ParticleSystem();
        // rectMode(CENTER);
}

function update(dt){
    if(debug && mouseIsPressed){
        // particleSystem.pickUp(mouseVector());
    }
    particleSystem.update(dt);
    gameBackground.update();
    enemyManager.update(dt);    
    if(score > wave2start) {
        enemyManager.wave2();

    }

    if(pickupTimer.canRun() && pickups.length <= 3){
        var padding = 50
        var halfWidth = (width/2) - padding;  
        var halfHeight = (height/2) - padding;
        // TODO: comeup with a better name than area'
        var area = [createVector(random(padding, halfWidth), random(padding, halfHeight)),
                    createVector(random(halfWidth, halfWidth * 2), 
                                 random(padding, halfHeight)),
                    createVector(random(padding, halfWidth), 
                                 random(halfHeight, halfHeight * 2)),
                    createVector(random(halfWidth, halfWidth * 2), 
                                 random(halfHeight, halfHeight * 2))];
        var pos = area[pickups.length % 4];
        if(pos.dist(player.pos) < 120){
            pos = area[(pickups.length + 1) % 4];
        }
        particleSystem.pickUp(createVector(pos.x + 10, pos.y + 10));
        pickups.push(new PickUp(pos));
    }
    bullets.forEach(function(b){
        b.display();
        b.update(dt);
    })
    for(var i = bullets.length - 1; i >= 0; i--){
        if(bullets[i].isDead()){
            arrayRemove(bullets, i);
        }
    }

    player.update(dt);
    wrapAroundScreen(player);
}


function draw(){
    background(0);
    gameBackground.display();
    fill(255);
    text("" + int(frameRate()), 20, 20);
    // text("兵戎相", 40, 10);

    if(gameNotStarted){
        startScreen();

        if(key === " "){
            gameNotStarted=false;
            setImageVisible("controlsGif", false);
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
    text("score:" + score, 40, 60);
    text("wave: " + waveNumber, 40, 100);
    pop();
    player.display();
    particleSystem.display();
    bullets.forEach(function(b){
        b.display();
    });
    for(var i = 0; i<pickups.length; i++){
        var p = pickups[i];
        if(AABBvsAABB(player, p) && !player.health.isZero()){
            particleSystem.pickup(player.pos.copy());
            player.shoot.remainingBullets +=1;
            player.health.add(1);
            arrayRemove(pickups, i);
            score += 50;
        }
        p.display();
    }
    enemyManager.display();
    // enemies.forEach(function(e){
    //     e.display();
    // });
    if(player.health.isZero()){
        endScreen();
        if(key === " "){
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
                 end: {h: 150,
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
    player.mouseReleased();
}

function hueDebug(){
    push();
    colorMode(HSB, 360, 255, 255, 255);
    _.times(360 / 20, i => {
        fill(i * 20, 255, 255);
        text("hue: " + i * 20, 50, 20 + (i * 20));
        noStroke();
        rect(50, 20 + (i * 20), 20, 20);
    });
    pop();
}