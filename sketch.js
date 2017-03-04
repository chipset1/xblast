var dt = textStackFn(20, 420, 20);

var paras = {w: 10, h: 10};
autoDat(paras);
function autoDat(obj){
    // min and max 0 100 default
    var gui = new dat.GUI();
    var keys = Object.keys(obj);
    keys.forEach(function(k){
        gui.add(obj, k).min(0).max(100);
    });
}
function setup(){
    createCanvas(512, 512);
}

function draw(){
    background(120);
    // jsonToP5({rect: [0, 0, 50, 50]});
    // jsonToP5({rect: [0, 0, 50, 50],
    //           fill: 0,
    //           strokeWeight: [10]});

    // jsonToP5({noFill: [],
    //           stroke: [255],
    //           strokeWeight: [10],
    //           rect: [20, 20, 100, 100]});

    // jsonToP5({noFill: [],
    //           stroke: 0,
    //           strokeWeight: 10,
    //           rect: [120, 20, 100, 100]});

    // jsonToP5({noStroke: true,
    //           fill: color(0, 0, 255),
    //           rect: [180, 20, 100, 100]});

    // jsonToP5({noFill: true,
    //           stroke: color(255, 0, 0),
    //           rect: [280, 20, 100, 100]});

    // jsonToP5({colorMode: [HSB],
    //           fill: color(300, 100, 100),
    //           rect: [380, 20, 100, 100]});

    // push();
    // colorMode(HSB);
    // fill(color(300, 100, 100));
    // rect(480, 20, 100, 100);
    // pop();
    // jsonToP5({position: createVector(100, 200),
    //           width: 10,
    //           height: 20,
    //           type: "rect"});

    // jsonToP5({position: createVector(200, 200),
    //           radius: 10,
    //           type: "rect"});

    // jsonToP5({position: createVector(200, 120),
    //           radius: 30,
    //           type: "ellipse"});
    var x2 = 60 - paras.w;
    var y2 = 0;
    var x3 = 30;
    var y3 = -60 - paras.h;
    push();
    translate(200, 120);

    triangle(0, 0, x2, y2, x3, y3);
    pop();

    jsonToP5({position: createVector(200, 120),
              angle: 20,
              scale: 37,
              type: "line-centered"});
    // jsonToP5({position: createVector(200, 120),
    //           width:  30,
    //           height: 30,
    //           type: "triangle"});

}
