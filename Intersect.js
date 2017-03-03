function sign(value){
    return value < 0 ? -1 : 1;
}

function entityToAABB(entity){
    return new AABB(entity.pos.x, entity.pos.y, entity.dim.x/2);
}

function AABB(x, y, h){
    this.pos = createVector(x, y);
    this.half = createVector(h, h); // radius

    this.intersectPoint = function(point){
        var delta = point.copy().sub(this.pos);
        var p = this.half.copy().sub(absVector(delta));;
        if (p.x <= 0 || p.y <= 0) {
            return null;
        }
        var hit = new Hit();
        if (p.x < p.y){
            var sx = sign(delta.x);
            hit.delta.x = p.x * sx;
            hit.normal.x = sx;
            hit.pos.x = this.pos.x + (this.half.x * sx);
            hit.pos.y = point.y;

        } else{
            var sy = sign(delta.x);
            hit.delta.y = p.y * sy;
            hit.normal.y = sy;
            hit.pos.x = point.x;
            hit.pos.y = this.pos.y + (this.half.y * sy);
        }
        return hit;
    }
    this.intersectAABB = function(box){
        // var delta = box.pos.copy().sub(this.pos);
        // var p = box.half.copy().add(this.half.copy());
        // p.sub(absVector(delta));
        // if (p.x <= 0 || p.y <= 0) {
        //     return null;
        // }
        // var hit = new Hit();
        // if (p.x < p.y){
        //     var sx = sign(delta.x);
        //     hit.delta.x = p.x * sx;
        //     hit.normal.x = sx;
        //     hit.pos.x = this.pos.x + (this.half.x * sx);
        //     hit.pos.y = box.pos.y;

        // } else{
        //     var sy = sign(delta.x);
        //     hit.delta.y = p.y * sy;
        //     hit.normal.y = sy;
        //     hit.pos.x = box.pos.x;
        //     hit.pos.y = this.pos.y + (this.half.y * sy);
        // }
        // return hit;
        var dx, dy, hit, px, py, sx, sy;
        dx = box.pos.x - this.pos.x;
        px = (box.half.x + this.half.x) - abs(dx);
        if (px <= 0) {
            return null;
        }
        dy = box.pos.y - this.pos.y;
        py = (box.half.y + this.half.y) - abs(dy);
        if (py <= 0) {
            return null;
        }
        hit = new Hit(this);
        if (px < py) {
            sx = sign(dx);
            hit.delta.x = px * sx;
            hit.normal.x = sx;
            hit.pos.x = this.pos.x + (this.half.x * sx);
            hit.pos.y = box.pos.y;
        } else {
            sy = sign(dy);
            hit.delta.y = py * sy;
            hit.normal.y = sy;
            hit.pos.x = box.pos.x;
            hit.pos.y = this.pos.y + (this.half.y * sy);
        }
        return hit;
    }
}
function absVector(v){
    return createVector(abs(v.x), abs(v.y));
}

function Hit (){
    this.pos = createVector(); // point of contact 
    this.delta = createVector(); // is a vector that can be added to the colliding object’s position to move it back to a non-colliding state.
    this.normal = createVector(); // normal of point of contact
}