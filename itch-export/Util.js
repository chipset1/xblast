function returnRandom(array){
    // return a random element from an array
    return array[int(random(array.length))]
}
function updateAndDisplay(entities){
  // call update and display of list of entities
  entities.forEach(function(e){
      e.update();
      e.display();
  });
}

function rectCenter(entity){
  return createVector(entity.pos.x + entity.dim.x / 2,
                      entity.pos.y + entity.dim.y / 2);
}

function randomVector(_min, _max){
  return createVector(random(_min, _max), random(_min, _max));
}

function mouseFromRes(res){
  return createVector(map(mouseX, 0, res.width * res.scale, 0, res.width), 
                      map(mouseY, 0, res.height * res.scale, 0, res.height));
}

function mouseVector(){
  return createVector(mouseX, mouseY);
}

function inbetween(number, min, max){
    return (number > min && number < max);
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

function isOffScreen(entity){
  var yMin = 0;
  var yMax = height;
  var xMin = 0;
  var xMax = width;
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

function textStackFn(startX, startY, spaceY){
    var rowNames = [];
    return function(rowName, value){
        var index = _.indexOf(rowNames, rowName);
        if(index === -1){
           rowNames.push(rowName);
        }
        push();
        colorMode(RGB, 255, 255, 255);
        // noStroke();
        
        stroke(255);
        fill(255);
        textSize(12);
        text(rowName + ": " + value, startX , startY + (spaceY * index));
        pop();
    }
}

function centerVector(){
  return createVector(width/2, height/2);
}

function imageFn(pathFile, entity){
    var img = loadImage(pathFile);
    return function(){
      if(entity.dim){
        image(img, entity.pos.x, entity.pos.y, entity.dim.x, entity.dim.y);
      }else {
        image(img, entity.pos.x, entity.pos.y);
      }
    }
}

function keyDirection(){
  var dir = createVector(0, 0);  
  //w
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    dir.y = -1;
  } 
  //s 
  else if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    dir.y = 1;
  } 
  //d
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)){
    dir.x = 1;
  } 
  //a
  else if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    dir.x -=1;
  }
  if(dir.equals(createVector())){
    return false;
  } 
  return dir;
}

function wrapAroundCamera(sprite, camera){
  // only wrap sprites past the left of the camera
    if(sprite.pos.x + sprite.dim.x < camera.offsetX) {
        sprite.pos.x = camera.offsetX + width;
    }
}

function ifNull(variable, returnVar){
    // check if the variable is null should 
    // also cover the case if the varible is also undefined 
    // nope its doesn T_T"
    if(variable === null || variable === undefined){
        return returnVar;
    } else {
        return variable;
    }
}

function arrayRemove (array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
}

function setImageVisible(id, visible) {
    var img = document.getElementById(id);
    img.style.visibility = (visible ? 'visible' : 'hidden');
}

function resScale(){
    // resolution = {width: 128, height: 128, scale: 4};
    // var canvas =  createCanvas(resolution.width, resolution.height).canvas;
    // canvas.style.width =  resolution.width * resolution.scale + "px";
    // canvas.style.height = resolution.height * resolution.scale + "px";
}