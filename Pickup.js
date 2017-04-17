function PickUp(pos){
    var self = this;
    self.pos = pos;
    self.vel = createVector();
    self.dim = createVector(20, 20);
    var isDead = false;

    self.kill = function(){
        isDead = true;
    };
    self.isDead = function(){
        return isDead;
    };

    self.display = function(){
        push();
        noStroke();
        colorMode(HSB, 360, 100, 100, 1);
        var distance = player.pos.dist(self.pos);
        var alpha = map(distance, 200, 0, 0.3, 1.0);

        alpha = max(alpha, 0.3);
        fill(200, 98, 99, alpha);

        ellipseMode(CORNER);
        ellipse(self.pos.x, self.pos.y, self.dim.x, self.dim.y);
        pop();
    };
}
