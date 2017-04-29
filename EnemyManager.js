function EnemyManager(bullets){
    var self = this;
    var enemiesKilled = 0;
    const startEnemies = 5;
    var enemies = [];
    var initLeft = true;

    _.times(startEnemies, (i) => {
        enemies.push(createEnemy());
    });


    function init(enemy){
        if(initLeft){
            enemy.initL();
        } else {
            enemy.initR();
        }
        initLeft = !initLeft;
    }

    function createEnemy(){
        var enemy = new Enemy();
        init(enemy);
        return enemy;
    }

    function explosiveForce(explodedEntity, entity, _maxScale){
        screenShake.setRange(-12, 12);
        var maxScale = _maxScale;
        var explosionRadius = 250;
        var distance = entity.pos.dist(explodedEntity.pos);

        var scale = map(distance, 0, explosionRadius, maxScale, maxScale * 0.55);
        if(distance < explosionRadius && !isOffScreen(entity) && explodedEntity.pos.x !== entity.pos.x){
            var center = rectCenter(entity);
            var target = center.sub(rectCenter(explodedEntity)); // vector pointing away from enemy that exploded
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
                spawnNewEnemies();
                score+=scoreParams.killedEnemy;
                enemiesKilled++;
                gameAudio.playExplosion();
                gameBackground.lightUpArea(e.pos);
                e.handleCollision("bullet");
                player.applyForce(explosiveForce(e, player, 200));
                self.applyExplosiveForce(b);
                b.kill();
                init(e);
            }
        });
    }

    function addOnEnemiesKilled(max, numberToAdd){
        if(enemiesKilled === max){
            waveNumber++;
            _.times(numberToAdd, function(){
                enemies.push(createEnemy());
            });
        }
    }

    function spawnNewEnemies(){
        var waves = _.range(40, 500, 10);
        addOnEnemiesKilled(10, 3);
        addOnEnemiesKilled(20, 2);
        addOnEnemiesKilled(30, 1);
        var shouldSpawn = _.some(waves, function(number){
            return enemiesKilled === number;
        });
        if(shouldSpawn) {
            waveNumber++;
            enemies.push(createEnemy());
        }
    }

    self.getEnemiesKilled = function(){
        return enemiesKilled;
    };

    function pastTopOrBottom(enemy){
        var pos = enemy.pos;
        var enemyWidth = enemy.dim.x;
        return pos.y < 0 - enemyWidth || pos.y > height + enemyWidth;
    }

    self.update = function(dt){
        enemies.forEach(function(e){
            if(AABBvsAABB(player, e)){
                if(player.health.equals(2)){
                    gameBackground.transitionToLowHealth();
                }
                gameAudio.playExplosion();
                gameBackground.activateWhiteOutMode();
                gameBackground.lightUpArea(e.pos);
                score += scoreParams.hitByEnemy;
                e.handleCollision("player");
                self.applyExplosiveForce(e);
                player.applyForce(explosiveForce(e, player, 200));
                player.health.sub(1);
                init(e);
            }
            checkBulletCollision(e);
            if(pastTopOrBottom(e)) init(e);
            e.update(dt);
        });
    };

    self.display = function(){
        enemies.forEach(function(e){
            e.display();
        });
    };

}
