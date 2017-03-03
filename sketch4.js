//completed:
// basic background for game: 
// - ideas color fadings
// - triangle boards and strips
// - left and right rotate triangles look good when the whole screen is filled with them 
   // and not as good when they are just around the boards
// - have triangle and square reactive background like square shooter game
// interact with parts of the background
// - add cells that move back to there original position like last game
// spawning in background elements
// -- tiles are created every 500ms  
// -- triangle are static and just draw directing
// effect zoom in effect like in luminous 2 - 1
//add particle system - 1


// current

// defered:
// add enemys interestings enemies - 5
// add enemy made of cells - 5
// tween background in and out - 5
// music + sounds 
// remove translate from triangles fn set x, y directly
// type drunning - add in other game
// add type drumming into game 
// has audio lead interact with background of the game
// add text particles - 1
// read threw code of game 

var debugText = textStackFn(20, 20, 20);
var gameBackground;
var particleSystem;
var sampler;

function imagePaths(){
    var prefix ="assets/2/frame";
    return  _.range(2, 20).map(i => { return prefix + i});
}

function preload(){
    sampler = new Sampler();
    sampler.preload();
}
function ParticleSystem(){
    var self = this;
    var particles = [];
    self.add = function(pdata){
        particles.push(new Particle(pdata));
    }
    self.update = function(){
        particles.forEach(p =>{
            // println(p);
            p.update();
        });
        for(var i = particles.length - 1; i >= 0; i--){
            if(particles[i].isDead()){
                arrayRemove(particles, i);
            }
        }
    }

    self.display = function(){
        particles.forEach(p =>{
            p.display();
        });
    }
}


function setup(){
    createCanvas(512 * 2, 720);
    colorMode(HSB, 255, 255, 255, 255); // alpha is 1.0 -> 0 with this mode
    rectMode(CENTER);
    noStroke();
    gameBackground = new Background();
    particleSystem = new ParticleSystem();
}

function draw(){
    background(120, 255, 20);
    debugText("frame rate", int(frameRate()));
    gameBackground.update();
    gameBackground.display();
    // drawBackground(tris);
    // spawnBackgroundCells();
    particleSystem.update();
    particleSystem.display();

    // particles.forEach(p =>{
    //     // println(p);
    //     p.update();
    //     p.display();
    // });
    // for(var i = particles.length - 1; i >= 0; i--){
    //     if(particles[i].isDead()){
    //         arrayRemove(particles, i);
    //     }
    // }
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
                         s: 0.7 * 255, 
                         b: 0.7 * 255}, 
                 between: {h: 220,
                           s: 255, 
                           b: 0.9 * 255}, 
                 end: {h: 150,
                       s: 255,
                       b: 200}};
        _.times(15, ()=>{                

            particleSystem.add({lifeTime: 100, 
                                         betweenLife: 80,
                                         pos: mouseVector(), //.add(randomVector(-10, 10)),
                                         // vel: randomVector(-12, 12).add(mouseVector().sub(createVector(pmouseX, pmouseY)).normalize()), 
                                         dim: createVector(15, 15), 
                                         vel: randomVector(-10, 10),
                                         // friction: 0.98,
                                         type: "triangle",
                                         size: 0,
                                         targetSize: 30,
                                         pstrokeWeight: 10,
                                         // slowDownRatio: 0.3,
                                         pNoFill: true,
                                         strokeColor: s,
                                         pscale: {min: 12.1, max: 0.3},
                                         alpha: {min: 200, max: 20}
                                        });});
}



function keyPressed(){
    if(key.toLowerCase() === 'd'){
        cells.forEach(cell => {
            cell.applyForce(createVector(0, 12));
            cell.setStartPosToPos(createVector(0, 12));
        });
    }
    if(key.toLowerCase() === 'a'){
        cells.forEach(cell => {
            cell.applyForce(createVector(0, -12));
            cell.setStartPosToPos(createVector(0, -12));
        });
    }
}

function animationTest(animations){
    if(mouseIsPressed){
        var imageNames = _.take(_.shuffle(imagePaths()), int(random(2, 5)));
        var animation = new Animation(imageNames, mouseVector(), random(1/2, 1/6)  );
        var heading = mouseVector().sub(createVector(pmouseX, pmouseY)).heading();

        var scale = map(sin(millis() * 0.01 * sin(millis() * 0.01)), -1, 1, 0.1, 0.4);
        animation.getSprites().forEach(s => { s.scale = scale;});
        animation.getSprites().forEach(s => { s.angle = heading;});
        animations.push(animation);
    } 
}

function particleTest (particles){
    if(mouseIsPressed){
        var imgNames = _.take(_.shuffle(imagePaths()), int(random(2, 5)));
        // println(imgNames);
        var scale = map(sin(millis() * 0.01 * sin(millis() * 0.01)), -1, 1, 0.1, 0.4);
        particles.push(new AnimatedParticle(imgNames, mouseVector(), scale));
    }
    particles.forEach(p =>{
        // println(p);
        p.update();
        p.display();
    });
    // for(var i = particles.length - 1; i >= 0; i--){
    //     if(particles[i].isDead()){
    //         arrayRemove(particles, i);
    //     }
    // }
}

function drawWaveform(){
    var waveform = sampler.waveform();
    noFill();
    _.times(10, j => {
        beginShape();
        stroke(255); 
        strokeWeight(1);
        for (var i = 0; i< waveform.length; i+=20){
            var x = map(i, 0, waveform.length, 0, width);
            // var h = j % 2 === 0 ? 400 : 400;
            var y = map( waveform[i], -1, 1, 0, 100);
            vertex(x, y + (70 * j));
        }
        endShape();
    });
}
