function Particle({pos,
                   vel,
                   dim,
                   type,
                   targetSize,
                   size,
                   pstrokeWeight,
                   friction,
                   betweenLife,
                   pscale,
                   pNoFill,
                   pNoStroke,
                   fillColor,
                   strokeColor,
                   lifeTime,
                   alpha}){
    // type controls how the particle is drawn:
    // ellispes, rects and line
    // for all shape pos, vel, pcolor, palpha are manditory
    // for lines the dim key is not used but the 'size' and targetSize determines the length of the line,
    // for rects and ellipses dim is used,
    //  maditory key are size, targetSize, strokeWeight,
    var self = this;
    self.pos = pos;
    self.vel = vel.copy();
    self.dim = dim;
    self.friction = friction || 0.98;
    var maxLife = lifeTime;
    var angle = self.vel.heading();

    self.isDead = function(){
        return lifeTime <= 0 || isOffScreen(this, 300);
    };

    function updateLine (){
        if(lifeTime > betweenLife){
            size += (targetSize - size) * 0.1;
        }else {
            size *= 0.98;
        }
    }

    self.update = function(dt){
        lifeTime -= 1;
        if(type === "line") updateLine();
        self.vel.mult(self.friction);
        self.pos.add(self.vel);
    };

    function mapLife(_min, _max){
        var l = map(lifeTime, maxLife, 0, _min, _max);
        return l;
    }

    function linearColorMap(){
        var c1 = color(hue.start, 255, 255, mapLife(alpha.min, alpha.max));
        var c2 = color(hue.end, 255, 255, mapLife(alpha.min, alpha.max));
        return lerpColor(c1, c2, mapLife(0, 1));
    }

    function colorMapWithBetween(pcolor){
        let a = mapLife(alpha.min, alpha.max);
        if(lifeTime > betweenLife){
            return lerpColor(color(pcolor.start.h, pcolor.start.s, pcolor.start.b, a),
                             color(pcolor.between.h, pcolor.between.s, pcolor.between.b, a),
                             map(lifeTime, maxLife, betweenLife, 0, 1));
        } else{
            return lerpColor(color(pcolor.between.h, pcolor.between.s, pcolor.between.b, a),
                             color(pcolor.end.h, pcolor.end.s, pcolor.end.b, a),
                             map(lifeTime, betweenLife, 0, 0, 1));
        }
    }

    function linePassThrew(p1, p2){
        //draw of line that passes threw p1 from p2
        var towards = p2.copy().sub(p1);
        towards.mult(-1);
        towards.add(p1);
        line(p2.x, p2.y, towards.x, towards.y);
    }

    function drawLine(){
        push();
        stroke(colorMapWithBetween(strokeColor));
        strokeWeight(pstrokeWeight);
        linePassThrew(self.pos, createVector(self.pos.x + cos(angle) * size,
                                             self.pos.y + sin(angle) * size));
        pop();
    }

    function drawShape(){
        var s = mapLife(pscale.min, pscale.max);
        push();
        colorMode(HSB, 360, 255, 255, 255);
        rectMode(CENTER);
        if(pNoFill) noFill();
        if(pNoStroke) noStroke();
        if(pstrokeWeight) strokeWeight(pstrokeWeight);
        if(strokeColor) stroke(colorMapWithBetween(strokeColor));
        if(fillColor) fill(colorMapWithBetween(fillColor));

        if(type === "rect"){
            rect(self.pos.x, self.pos.y, self.dim.x * s, self.dim.y * s);
        } else if(type === "ellipse") {
            ellipse(self.pos.x, self.pos.y, self.dim.x * s, self.dim.y * s);
        } else if(type === "triangle"){
            var x2 = 60 * s;
            var y2 = 0;
            var x3 = 30 * s;
            var y3 = 60 * s;

            push();
            translate(self.pos.x, self.pos.y);
            rotate(vel.heading());
            triangle(0, 0, x2, y2, x3, y3);
            pop();
        }
        pop();
    }

    self.display = function(){
        if(type === "line"){
            drawLine();
        }else {
            drawShape();
        }
    };
}
