function ScreenShake(){
    var self = this;
    self.scale = 0.9;
    self.amount = createVector();
    var range = {min: 0, max: 0};

    self.setRange = function(min, max){
        range.min = min;
        range.max = max;
    };

    self.update = function(){
        range.min *= self.scale;
        range.max *= self.scale;
        self.amount.set(random(range.min, range.max), random(range.min, range.max));
    };
}
