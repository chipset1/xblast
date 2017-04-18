function PickupManger(){
    var self = this;
    var pickups = [];
    var pickupTimer = new Timer(1200);
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
        if(pickupTimer.canRun(true) && pickups.length <= 1 && totalSpawnedCount  % 2 === 0){
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
            pickups.push(new PickUp(pos.copy()));

            pos.add(10, 10);
            particleSystem.spawnPickUp(pos);
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
