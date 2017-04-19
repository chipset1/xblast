// general javascript util

function returnRandom(array){
    // return a random element from an array
    return array[int(random(array.length))];
}

function inbetween(number, min, max){
    return (number > min && number < max);
}

function arrayRemove (array, from) {
    return array.splice(from, 1);
}

function clog(){
    console.log.apply(null, Array.from(arguments));
}

// rest
function autoDat(obj){
    // only numbers
    // min and max 0 100 default
    // {param: {min: 0 max: 20}}
    var gui = new dat.GUI();
    var keys = Object.keys(obj); // use Object.entries
    keys.forEach(function(k){
        if(typeof(obj[k]) === "object"){
            var args = obj[k];
            args.min = args.min || 0;
            args.max = args.max || 100;
            obj[k] = args.min;
            gui.add(obj, k).min(args.min).max(args.max);
        }else{
            gui.add(obj, k).min(0).max(100);
        }
    });
}
