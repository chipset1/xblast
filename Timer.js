function Timer(timerInterval, numberOfCycles) {
    var lastInterval = -1;
    var cycleCounter;
    var interval = timerInterval;

    this.canRun = function(wait) {
        // wait toggle whether the timer should run and return turn
        // immediately or if it should wait 1 cycle before returning turn
        wait = wait || false;
        var curr = millis();
        if(lastInterval < 0 && wait) lastInterval = curr;
        if(curr-lastInterval >= interval || (lastInterval < 0 && !wait)) {
            lastInterval = curr;
            return true;
        }
        return false;
    };

}
