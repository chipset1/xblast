function Transition(length){
    var hasStarted = false;
    var startTime = 0;

    this.start = function(){
        startTime = millis();
        hasStarted = true;
    };

    this.map = function(min, max){
        return map(millis(), startTime, startTime + length, min, max);
    };

    this.isRunning = function(){
        // come up with a better function name
        if(millis() > startTime + length){
            hasStarted = false;
        }
        return hasStarted;
    };
}
