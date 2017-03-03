//Collision detection - Bouncing behavior
// shump game -
// always shooting left and right
// shoot your self at enemies
// sling arrows at enemies
// by killing enimes you can click and sling them

var circles;
var car;
var shootTarget;
var boxes;

function setup() {
  createCanvas(1200, 900);
  circles = new Group();
  car = createSprite(200, random(0, height));
  shootTarget = createVector(mouseX, mouseY);
  useQuadTree(false);
  for(var i=0; i<20; i++)
  {
    var circle = createSprite(random(0, width), random(0, height));
    circle.addAnimation('normal', 'assets/asterisk_circle0006.png', 'assets/asterisk_circle0008.png');
    circle.setCollider('circle', -2, 2, 55);
    circle.setSpeed(random(2, 3), random(0, 360));
    // circle.onMousePressed = function(){
    //     this.velocity.add(createVector(mouseX, mouseY).sub(this.position.copy()).mult(0.4) );
    //     // this.position = ;
    // }
    //scale affects the size of the collider
    circle.scale = random(0.5, 1);
    //mass determines the force exchange in case of bounce
    circle.mass = circle.scale;
    //restitution is the dispersion of energy at each bounce
    //if = 1 the circles will bounce forever
    //if < 1 the circles will slow down
    //if > 1 the circles will accelerate until they glitch
    //circle.restitution = 0.9;
    circles.add(circle);
  }

  boxes = new Group();

  for(var j=0; j<4; j++)
  {
    var box = createSprite(random(0, width), random(0, height));
    box.addAnimation('normal', 'assets/box0001.png', 'assets/box0003.png');
    //setting immovable to true makes the sprite immune to bouncing and displacements
    //as if with infinite mass
    box.immovable = true;

    //rotation rotates the collider too but it will always be an axis oriented
    //bounding box, that is an ortogonal rectangle
    if(j%2==0)
      box.rotation = 90;

    boxes.add(box);
  }
}



function draw() {
  background(255, 255, 255);

  //circles bounce against each others and against boxes
  text("framerate: " + int(frameRate()), 20, 20);
  circles.bounce(circles);

  //boxes are "immovable"
  circles.bounce(boxes);

  var pvel = mouseY - car.position.y;
  var scale = 0.1;    
  if(mouseIsPressed)    {
    line(car.position.x, car.position.y, mouseX, mouseY);
    scale = 0.003; 
  } 
  pvel *= scale;
  car.position.y += pvel;
  //all sprites bounce at the screen edges
  for(var i=0; i<allSprites.length; i++) {
    var s = allSprites[i];
    if(s.position.x<50) {
      s.position.x = 50;
      s.velocity.x = abs(s.velocity.x);
    }

    if(s.position.x>width - 50) {
      s.position.x = width-50;
      s.velocity.x = -abs(s.velocity.x);
    }

    if(s.position.y<50) {
      s.position.y = 50;
      s.velocity.y = abs(s.velocity.y);
    }

    if(s.position.y>height -50) {
      s.position.y = height-50;
      s.velocity.y = -abs(s.velocity.y);
    }
  }

  drawSprites();

}
