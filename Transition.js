function Transition(length){
    var self = this;
    var hasStarted = false;
    var startTime = 0;

    self.start = function(){
        startTime = millis();
        hasStarted = true;
    };

    self.map = function(min, max){
        return map(millis(), startTime, startTime + length, min, max);
    };

    self.isRunning = function(){
        // come up with a better function name
        if(millis() > startTime + length){
            hasStarted = false;
        }
        return hasStarted;
    };
}
