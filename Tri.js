function Tri(x, y, {hue, saturation, brightness, scale, shimmerData}){
    var self = this;
    const width = 30;
    const height = 60;
    const right = PI/2;
    const left = -PI/2;
    const angle = chance(0.5) ? left: right;

    self.pos = createVector(x, y);
    self.initialBrightness = brightness;
    self.brightness = brightness;

    self.initialSaturation = saturation;
    self.saturation = saturation;
    self.hue = hue;
    self.initialHue = hue;
    self.alpha = 0;

    function shimmer(min, max){
        return map(sin(y + millis() * 0.0016), -1, 1, min, max);
    }

    self.center = function(){
        var offsetWidth = (width * scale) - (width * scale) / 2.9;
        var offsetHeight = (height * scale) / 2;
        if(angle === right){
            return createVector(self.pos.x - offsetWidth, self.pos.y + offsetHeight);
        } else {
            return createVector(self.pos.x + offsetWidth, self.pos.y - offsetHeight);
        }
    };

    function mapSin(value, min, max){
        return map(sin(value), -1, 1, min, max);
    }

    function seconds(){
        return millis()/1000;
    }

    self.display = function(){
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();

        // hsb 239 68 59
        // rgb 48 50 150
        // b 59 s 68

        // blue
        // hsb 159 84 91
        // rgb 38 232 165
        // b 91 s 84

        fill(self.hue + shimmer(shimmerData.min, shimmerData.max), self.saturation, self.brightness, self.alpha);

        var a = map(scale, 2.2, 4.3, 1, 5);
        var multScale = mapSin(y + cos(tan(3 * x)) + (seconds() / a), 1, 1.3);
        var offsetX = mapSin((y * x) + seconds(), 0, 10);
        var offsetY = mapSin((y / x) + seconds() / a, 0, 10);

        var points = {x1: 0,
                      y1: 0,
                      x2: height * scale * multScale,
                      y2: 0,
                      x3: width * scale * multScale,
                      y3: height * scale * multScale};

        const shakeScale = 0.9;
        translate(x + offsetX - (screenShake.amount.x * shakeScale), y + offsetY - (screenShake.amount.y * shakeScale));
        rotate(angle);
        triangle(points.x1, points.y1, points.x2, points.y2, points.x3, points.y3);
        pop();
    };
}
