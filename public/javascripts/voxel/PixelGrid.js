//Pixel Class
function PixelGrid(width, height, includeCorners, wrap) {
    console.log('Pixels loaded!')
    // a class for storing information in a raster grid format.
    width = typeof width !== 'undefined' ? width : 200;
    height = typeof height !== 'undefined' ? height : 200;
    includeCorners = typeof includeCorners !== 'undefined' ? includeCorners : false;
    wrap = typeof wrap !== 'undefined' ? wrap : false;
    
    this.includeCorners = includeCorners;
    this.wrap = wrap;
    this._res = [width, height];
    this.pxWidth = width;
    this.pxHeight = height;
    this.pixels = this.pxHeight*this.pxWidth;
    this.color = {r: 0, g: 0, b: 255, a: 1};
    
    // Property Arrays
    this._pixels = new Array(this.pixels);
    this._pxCoordinates = new Float32Array( this.pixels * 3);
    this._pixelsColor = new Float32Array( this.pixels * 3);
    this._pixelsScale = new Float32Array( this.pixels);
    this._neighbors = new Array(this.pixels);
    this._someNeighbors = new Array(this.pixels);
    this._opacity = new Float32Array( this.pixels);
    
    this._addresses = function() {
        for (i = 0; i < this.pxWidth*this.pxHeight; i++) {
            //console.log([Math.floor(i/this.pxWidth), i%this.pxWidth]);
            this._pixels[i] = [Math.floor(i/this.pxWidth), i%this.pxWidth];
        }
        return this._pixels;
    }
    
    this.setCoordinates = function(pixels) {
        for ( var i = 0, i3 = 0, l = pixels.length; i < l; i ++, i3 += 3 ) {
            geomPos = pixels[i];
            this._pxCoordinates[ i3 + 0 ] = geomPos.coordinates[0]*1000;
            this._pxCoordinates[ i3 + 1 ] = geomPos.coordinates[1]*1000;
            this._pxCoordinates[ i3 + 2 ] = 0;//geomPos.coordinates[2];
        }
    }
    
    this.setProperties = function(scale, colorScale, values, neighbors, newColor, brushRange) {
        neighbors = typeof neighbors !== 'undefined' ? neighbors : [];
        brushRange = typeof brushRange !== 'undefined' ? brushRange : [0, 1];

        if (typeof newColor !== 'undefined') {
            this.color = newColor;
        }
        currentColor = this.color;

        var color = new THREE.Color();
        for ( var i = 0, i3 = 0, l = values.length; i < l; i ++, i3 += 3 ) {
            var scales = values[i];
  
            if (neighbors.length>0) {
                var randomIndices = neighbors[i];
                var sum = 0;
                for (var n = 0; n < randomIndices.length; n++) {
                    sum += parseFloat(values[randomIndices[n]]);
                }
                sum += parseFloat(scales);
                var avg = sum/(randomIndices.length+1);
                scales = avg;
            }

            var val = colorScale(scales);

            color.set(val)

            this._pixelsColor[ i3 + 0 ] = color.r;
            this._pixelsColor[ i3 + 1 ] = color.g;
            this._pixelsColor[ i3 + 2 ] = color.b;
            
            if (scales < brushRange[0]) {
                this._pixelsScale[ i ] = 0;
            }
            else if (scales > brushRange[1]) {
                this._pixelsScale[ i ] = 0;
            }
            else {
                this._pixelsScale[ i ] = scale(scales);
            }
        }
    }
    
    this.setOpacity = function(value) {
        
        for ( var i = 0, l = this.pixels; i < l; i ++ ) {
            this._opacity[ i ] = value;
        }
        return this._opacity
    }
    
    this.getColors = function() {
        return this._pixelsColor;
    }
    
    this.getScales = function() {
        return this._pixelsScale;
    }
    
    this.getCoordinates = function() {
        return this._pxCoordinates;
    }
    
    this.getOpacities = function() {
        return this._opacity;
    }
    
    this.getNNeighbors = function() {
        return this._someNeighbors;
    }
    
    this.neighborsOf = function(pixelIndex) {
        var m = this.pxWidth;
        var n = this.pxHeight;
        var pixelAddress = this._pixels[pixelIndex];
        var x = pixelAddress[0];
            y = pixelAddress[1];
        
        var indices = [-1, 0, 1];
        var ret = [];
        var arrayM = Array.apply(null, Array(m)).map(function (_, i) {return i;});
        var arrayN = Array.apply(null, Array(n)).map(function (_, i) {return i;});
        
        for (var di = 0; di < indices.length; di++) {
            for (var dj = 0; dj < indices.length; dj ++) {
                var wBoolean = arrayM.indexOf(x+indices[di]) >= 0;
                var hBoolean = arrayN.indexOf(y+indices[dj]) >= 0;
                if (wBoolean == true && hBoolean == true) {
                    //if (!(indeces[di]==0 && indeces[dj]==0)) {
                    var new_index = ((x+indices[di])*m)+(y+indices[dj]);
                    ret.push(new_index);
                    //}
                }
                
            }
        }
        return ret;
    }
    
    this.nNeighbors = function(numberNeighbors) {
        for (var i = 0; i<this.pixels; i++) {
            var neighbors = this._neighbors[i];
            var currentIndex = neighbors.indexOf(i)
            var newNeighbors = neighbors.slice()
            newNeighbors.splice(currentIndex, 1);
            if (numberNeighbors > neighbors.length) {
                var randomIndices = newNeighbors;
            }
            else {
                var randomIndices = this.randomPick(newNeighbors,numberNeighbors);
                    }
            this._someNeighbors[i] = randomIndices;
        }
        return this._someNeighbors;

    }
    
    this.allNeighbors = function() {
        this._addresses();
        for (var i = 0; i<this.pxHeight*this.pxWidth; i++) {
            this._neighbors[i] = this.neighborsOf(i);
        }
        return this._neighbors
    }

    this.randomPick = function(myArray,nb_picks){
        for (i = myArray.length-1; i > 1  ; i--)
        {
            var r = Math.floor(Math.random()*i);
            var t = myArray[i];
            myArray[i] = myArray[r];
            myArray[r] = t;
        }
        return myArray.slice(0,nb_picks);
    }
}