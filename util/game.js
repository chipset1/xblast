// game specific util

function rectCenter(entity){
    return createVector(entity.pos.x + entity.dim.x / 2,
                        entity.pos.y + entity.dim.y / 2);
}

function AABBvsAABB(e1, e2){
    // edges for A
    var a_left= e1.pos.x;
    var a_right = e1.pos.x + e1.dim.x;
    var a_top = e1.pos.y;
    var a_bottom = e1.pos.y + e1.dim.y;
    // edges for B
    var b_left= e2.pos.x;
    var b_right = e2.pos.x + e2.dim.x;
    var b_top = e2.pos.y;
    var b_bottom = e2.pos.y + e2.dim.y;

    return a_right >= b_left && a_left <= b_right && a_bottom >= b_top && a_top <= b_bottom;
}

function wrapAroundScreen(sprite, fn){
    // once sprite is right off the screen
    // set the postion to the oposite end of the screen
    if(sprite.pos.x + sprite.dim.x < 0){
        sprite.pos.x = width;
    }
    if(sprite.pos.x > width) {
        sprite.pos.x = -sprite.dim.x;
    }
    if(sprite.pos.y + sprite.dim.y < 0){
        sprite.pos.y = height;
    }
    if(sprite.pos.y > height){
        sprite.pos.y = -sprite.dim.y;
    }
}

function isOffScreen(entity, offset){
    offset = offset || 0;
    var yMin = 0 - offset;
    var yMax = height + offset;
    var xMin = 0 - offset;
    var xMax = width + offset;
    return entity.pos.x < xMin || entity.pos.x > xMax || entity.pos.y < yMin || entity.pos.y > yMax;
}

function limitToBoundary(sprite, xBounds, yBounds){
    // limits the sprites positions based on the x and y bounds provided
    var yMin = yBounds.min;
    var yMax = yBounds.max - sprite.dim.y;
    var xMin = xBounds.min;
    var xMax = xBounds.max - sprite.dim.x;
    // console.log(sprite.dim.y);
    // println(sprite.dim);
    if(sprite.pos.x < xMin){
        sprite.pos.x = xMin;
    }
    if(sprite.pos.x > xMax) {
        sprite.pos.x = xMax;
    }
    if(sprite.pos.y < yMin){
        sprite.pos.y = yMin;
    }
    if(sprite.pos.y > yMax){
        sprite.pos.y = yMax;
    }
}

function wrapAroundCamera(sprite, camera){
    // only wrap sprites past the left of the camera
    if(sprite.pos.x + sprite.dim.x < camera.offsetX) {
        sprite.pos.x = camera.offsetX + width;
    }
}
