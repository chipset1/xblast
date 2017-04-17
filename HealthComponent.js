function HealthComponent(maxHealth){
    var self = this;
    this.max = maxHealth;
    this.current = this.max;
    this.add = function(value){
        if(underMax()){
            this.current += value;
        }
    };
    this.sub = function(value){
        if(this.current > 0){
            this.current -= value;
        }
    };

    this.equals = function(value){
        return this.current === value;
    };

    function underMax(){
        return self.current < self.max;
    }
    this.isZero = function(){
        return this.current <= 0;
    };
}
