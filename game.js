"use strict";
/* GLOBAL VARIABLES*/
var debug = false;
var debugText = textStackFn(20, 40, 20);
var font;

var gameBackground;
var particleSystem;
var pickupManger;
var screenShake;
var enemyManager;
var bullets;
var player;
var gameAudio;

const dt = 1/60.0;
var currentTime = 0;

var gameNotStarted = true;
var score = 0;
var waveNumber = 1;
var scoreParams = {killedEnemy: 100, pickUp: 10, hitByEnemy: -10};

var respawnPosition;

function preload(){
    gameAudio = new Audio();
    gameAudio.preload();
    font = loadFont('assets/RubikMonoOne-Regular.ttf');
}

function gameInit(){
    // reset game state when restarted
    score = 0;
    waveNumber = 1;
    bullets = [];
    pickupManger = new PickupManger();
    enemyManager = new EnemyManager(bullets);
    player = new Player(respawnPosition.x, respawnPosition.y, bullets);
}

function setup(){
    // 3 : 2 aspect ratio
    createCanvas(1200, 800);
    respawnPosition = Object.freeze(createVector(width/2, height/2));
    gameBackground = new Background();
    screenShake = new ScreenShake();
    particleSystem = new ParticleSystem();
    gameInit();
    gameAudio.backgroundLoop();
    textFont(font);

    if(debug){
        var gui = new dat.GUI();
        gui.add(player, 'friction').min(0.9).max(1).step(0.005).listen();
        gui.add(player, 'maxDistance').min(100).max(300).step(1).listen();
        gui.add(player, 'reset');
        gui.add(player, 'holdToMove').listen();
    }
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

    translate(screenShake.amount.x, screenShake.amount.y);
    // screen outline
    stroke(255, 100);
    noFill();
    rect(0, 0, width-1, height-1);

    if(gameNotStarted){
        displayTitle();
        currentTime = millis();
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

    screenShake.update();
    particleSystem.display();
    player.display();
    pickupManger.display();
    bullets.forEach(function(b){
        b.display();
    });
    enemyManager.display();
    displayScore();
    if(player.health.isZero()) endScreen();
}

function keyPressed(){
    if(gameNotStarted && key === " "){
        particleSystem.respawnExplosion(respawnPosition);
        gameAudio.playExplosion();
        gameAudio.playExplosion();
        gameBackground.transitionToStart();
        gameNotStarted=false;
    }
    if(player.health.isZero() && key === " "){
        gameInit();
        gameBackground.endWhiteOut();
        gameBackground.transitionToNormal();
        gameAudio.playExplosion();
        gameAudio.playExplosion();
        particleSystem.respawnExplosion(respawnPosition);
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

function endScreen(){
    push();
    fill(255, 150);
    textSize(32);
    noStroke();
    text("GAME OVER", (width/2) - 120, height/2);
    text("press SPACE to restart", (width/2) -300, (height/2) + 32);
    pop();
}

function displayTitle(){
    textSize(80);
    noStroke();
    fill(255, 200);
    text("XBLAST", (width/2) - 200, height/2);
}

function displayScore(){
    const size = 50;
    const x = (width/2) - 140;
    const y = 60;
    const spaceX = 55;

    push();
    noStroke();
    fill(255, 150);
    textSize(50);
    text("score:" + score, x, y);
    text("wave:" + waveNumber, (width/17), height - 30);
    noStroke();
    pop();
}
