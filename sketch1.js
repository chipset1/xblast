//TODO
// current: 
// game loop going
// enemy spawning
// defered:
// Look at implementing shooting behavior diffrently 
// bullets pool

var player;
var gameIsOver = false;
// var enemyShooter = new Shoot
var enemies = [];
var enemyBullets = [];
var playerBullets = [];

function updateBullets (bullets){
  for(var i = 0; i < bullets.length; i++){
      if(bullets[i].isDead()){
          arrayRemove(bullets, i);
      }
  }
  bullets.forEach(function(e){
    e.update();
    e.display();
  });
}

function setup(){
  createCanvas(720, 512);
  player = new Player(20, height/2, playerBullets);
  enemies.push(new Enemy(createVector(600, 300), enemyBullets));

  b1 = new AABB(width/2, height/2, 100);
  b2 = new AABB(mouseX, mouseY, 50);
  rectMode(CENTER);
  enemySpawner();
}


function enemySpawner(){
  var maxEnemiesOnScreen = 10;
  var enemies = [];
  if(enemies.length <= 10){
    var positions = _.times(5, (i) => {
      var start = createVector(width - 100, player.yBounds.min + (i * 30));
      enemies.push(new Enemy(start, enemyBullets));
    });
  }
}

function playerBulletToEnemyBullet(playerBullet, enemyBullet){
  // collision for player bullet to enemy bullet
  let b1 = entityToAABB(playerBullet);
  let b2 = entityToAABB(enemyBullet);
  var hit = b1.intersectAABB(b2); 
  if(hit){
    let pt = playerBullet.type;
    let et = enemyBullet.type;
    let collision = function(type1, type2, resp){
      let pt = playerBullet.type;
      let et = enemyBullet.type;
      if(pt === type1 && et === type2){
        // resp(playerBullet);
        // resp(enemyBullet);
        resp(playerBullet, enemyBullet);
      } 
      if(et === type1 && pt === type2){
        resp(enemyBullet, playerBullet);
      }
    }
    collision("normal", "block", (normal, block) => {
      // block.kill();
      // normal.vel.mult(-1);
      // normal.vel.add(hit.delta.copy());
      // normal.pos.add(hit.delta.add(normal.vel.copy()));
    });

    // if(et === "normal" && pt === "block"){
    //   playerBullet.kill();
    //   enemyBullet.vel.mult(-1);
    //   enemyBullet.vel.add(hit.delta.copy());
    // } 
    // if(pt === "normal" && et === "block"){
    //   // enemyBullet.kill();
    //   playerBullet.pos.add(hit.delta.copy().add(enemyBullet.vel)); 
    //   // playerBullet.vel.add(hit.delta.copy()); 
    //   playerBullet.vel.mult(-1);
    // } 
    // if(pt === "normal" && et === "block"){
    //   // enemyBullet.kill();
    //   playerBullet.pos.add(hit.delta.copy().add(enemyBullet.vel)); 
    //   // playerBullet.vel.add(hit.delta.copy()); 
    //   playerBullet.vel.mult(-1);
    // } 
  }
}

function enitityToEntityCollision(entity1, entity2){
  let e1 = entityToAABB(entity1);
  let e2 = entityToAABB(entity2);
  return hit = e1.intersectAABB(e2); 
}


function enitityToPointCollision(entity1, point){
  let e1 = entityToAABB(entity1);
  return hit = e1.intersectPoint(point); 
}

function removeIfDead(entities){
  for(var i = 0; i < entities.length; i++){
      if(entities[i].isDead()){
          arrayRemove(entities, i);
      }
  }
}
var b1, b2;

function testcollision(){
  b2.pos.set(mouseX, mouseY);
  var hit = b1.intersectAABB(b2); 

  if(hit){
    rect(b2.pos.x + hit.delta.x, b2.pos.y + hit.delta.y, 50, 50);
    rect(hit.pos.x, hit.pos.y, 10, 10);
  }

  noFill();
  rect(b1.pos.x, b1.pos.y, b1.half.x * 2, b1.half.y * 2);
  rect(b2.pos.x, b2.pos.y, b2.half.x * 2, b2.half.y * 2);
}

function draw(){
  background(255);
  // if(gameIsOver){
  //   push();
  //   fill(0);
  //   textSize(42);
  //   text("GAME OVER \n press space to restart", (width /2) - 200, (height/2) - 100);
  //   pop();

  // }
  if(player.health.isZero()){
    gameIsOver = true;
  }

  fill(0);
  text("frame rate: " + int(frameRate()), 10, 10);

  // testcollision();
    player.update();
  player.display();
  // return;

  updateAndDisplay(enemies);
  // removeIfDead(enemies);
  updateBullets(playerBullets);
  updateBullets(enemyBullets);
  // enemySpawner();
  
  enemies.forEach(function(enemy){
    let hit1 = enitityToPointCollision(enemy, createVector(mouseX, mouseY));
    var dir = createVector();
    if(mouseIsPressed && enemy.health.isZero()){
      var dir = createVector(mouseX, mouseY).sub(enemy.pos.copy()); 
      stroke(0);
      line(enemy.pos.x, enemy.pos.y, mouseX, mouseY);
      // enemy.pos.add(dir);
      console.log(dir);
    }
    enemy.vel.add(dir);
  });

  playerBullets.forEach(function(playerBullet){
    enemies.forEach(function(enemy){
      let hit =  enitityToEntityCollision(playerBullet, enemy);
      if(hit){
        println("player bullet hit enemy: " + enemy.health.currentHealth );
        playerBullet.kill();
        enemy.health.hitByBullet();
      }

      // enemyBullets.forEach(function(enemyBullet){
      //   // var hit = AABBvsAABB(playerBullet, enemyBullet)
      //   playerBulletToEnemyBullet(playerBullet, enemyBullet);
      // });
    });
  });
  enemies.forEach(function(enemy){
    enemy.shoot.bullets.forEach(function(enemyBullet){
      // var hit = AABBvsAABB(playerBullet, enemyBullet)
      // playerBulletToEnemyBullet(playerBullet, enemyBullet);
      var hit = enitityToEntityCollision(player, enemyBullet);
      if(hit){
        println("playerHit");
        enemyBullet.kill();
        player.health.hitByBullet();
      } 
    });
  });
 // GUI
  push();
  rectMode(CORNER);
  var healthBarStart = createVector(20, 30); 
  var healthHeight = 30;
  var maxWidth = 80;
  var healthWidth = maxWidth / player.health.maxHealth; 
  noStroke();
  fill(0, 200, 0);
  text("" + player.health.currentHealth, healthBarStart.x, healthBarStart.y + 40);
  // rect(healthBarStart.x, healthBarStart.y, player.health.currentHealth * 10, healthHeight);
  // rect(healthBarStart.x, healthBarStart.y, 10, 10);
  pop();

   player.shoot.normal(player, createVector(5, 0));
  // if(keyIsDown(76))
  // if(keyIsDown(75)) player.shoot.block(player, createVector(5, 0));
}



function keyPressed(){


  // if(key === "l" || key === "L") player.shoot.normal(player, vel);
  // if(keyIsDown(76))(player, vel);
  // if(key === "k" || key === "K") player.shoot.throw(player, vel);
  // if(key === "j" || key === "J") player.shoot.block(player, createVector(1, 0));
}