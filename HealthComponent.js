function HealthComponent(maxHealth){
    var self = this;
    self.max = maxHealth;
    self.current = self.max;
    self.add = function(value){
        if(underMax()){
            self.current += value;
        }
    };
    self.sub = function(value){
        if(self.current > 0){
            self.current -= value;
        }
    };

    self.equals = function(value){
        return self.current === value;
    };

    function underMax(){
        return self.current < self.max;
    }
    self.isZero = function(){
        return self.current <= 0;
    };
}
