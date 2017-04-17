function PickUp(pos){
    this.pos = pos;
    this.vel = createVector();
    this.dim = createVector(20, 20);
    var isDead = false;

    this.kill = function(){
        isDead = true;
    };
    this.isDead = function(){
        return isDead;
    };

    this.display = function(){
        push();
        noStroke();
        colorMode(HSB, 360, 100, 100, 1);
        var distance = player.pos.dist(this.pos);
        var alpha = map(distance, 200, 0, 0.3, 1.0);

        alpha = max(alpha, 0.3);
        fill(200, 98, 99, alpha);

        ellipseMode(CORNER);
        ellipse(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
        pop();
    };
}
