// matthew's dirty global variables
// these should probably go into another place


    var planeObjects = [];
    var panplanes = [];
    var panObjects=[];

var viewObjects = [];

var camera;

    var projector = new THREE.Projector();
var selectObjects=[];

var SELECTED=[];

    var shiftDOWN = false;
    var escDOWN = false;
    var ctrlDOWN = false;


    var newSEL;
    var CLICKEDsel=1;
    var saveColorR=null;
    var saveColorG;
    var saveColorB;
    
    var SELECTED=0;
    var mark=0;
    var selMARK=0;
    
        var zoomSpeed = 0;

    var mouse = {x: 0,y: 0},
        mouseOnDown = {x: 0,y: 0};

    var rotation = {x: 0,y: 0},
        target = {x: Math.PI * -0.5 / 2,y: Math.PI / 4.0},
     //  target = {x: Math.PI * 0 / 2,y: Math.PI / 4.0},
        targetOnDown = {x: 0,y: 0};

    var PI_HALF = Math.PI / 2;

    var overRenderer;

    var distance = 10000,
        distanceTarget = 10000;

    var panObjects=[];
    
    
        var isMouseDownRightPAN;
    var mouseOnDownPAN = {
        x: 0,
        y: 0
    };
    var panTarget = {
        x: 0,
        z: 0
    },
        targetOnDownPAN = {
            x: 0,
            y: 0
        };
    var pan = {
        x: 0,
        z: 0
    };
    
    var firstpos = {
        x: 0,
        y: 0
    };
    var secpos = {
        x: 0,
        y: 0
    };
    var panHOLDmove = false;
    
    var projector = new THREE.Projector();


    var mouse3D, isMouseDownRight = false,
        isMouseDownLeft = false,
        onMouseDownPositionX, onMouseDownPositionY,
        radious = 800,
        theta = 45,
        onMouseDownTheta = 45,
        phi = 60,
        onMouseDownPhi = 60;
        
         var demo,
        mousedown = false,
        mouseup = true,
        mousedowncoords = {},
        marqueeGet = document.getElementById('select-marquee'),
        offset = {};



var indexOf = function(needle) {
    
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle);
};
