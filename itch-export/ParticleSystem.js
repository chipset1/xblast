function ParticleSystem(){
    var particles = [];

    this.add = function(particle){
        particles.push(particle);
    }
    this.update = function(dt){
        // for(var i = pa)
        particles.forEach(function(p){
            p.update(d);
        });
    }
    this.display = function(){
        particles.forEach(function(p){
            p.display(d);
        });
    }
}