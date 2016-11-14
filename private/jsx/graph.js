export default class Graph {
    constructor(canvasElement, height, width) {
        // Initialize a Canvas for Three.js
        // + all this necessary to see things
        this.canvas = canvasElement;
        this.clientHeight = height;
        this.clientWidth = width;
        this.scene = this.initScene();
        //this.scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );
        this.camera = this.initCamera( this.clientWidth, this.clientHeight );
        this.renderer = this.initRenderer( this.clientWidth, this.clientHeight, window.devicePixelRatio );
        this.controls = this.initControls(this.camera, this.canvas)

        // Optional
        this.gridHelperId = this.initGrid(this.scene);

        // Put canvas onto the page
        this.insertCanvas(this.canvas, this.renderer.domElement);


    }

    // Create a Scene
    initScene() {
        return new THREE.Scene();
    }

    // Create a Camera
    initCamera(width, height) {
        var camera = new THREE.PerspectiveCamera(90, width / height, 5, 1500);
        camera.position.y = 300;
        camera.lookAt(new THREE.Vector3(0.0,0.0,0.0));
        camera.enablePan = true;
        camera.enableRotate = false;
        return camera;
    }

    // Create a Renderer
    initRenderer(width, height, pixelRatio) {
        var renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias: true });
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height )
        renderer.setClearColor(new THREE.Color('white'));
        return renderer;
    }

    // Initialize Controls Object
    initControls(camera, canvas) {
        let controls = new THREE.OrbitControls( camera, canvas );
        controls.enableRotate = false;
        return controls;
    }

    // Appends canvas onto the element
    insertCanvas(element, canvas) {
        element.appendChild(canvas);
    }

    start() {
        window.addEventListener( 'resize', this.onResize.bind(this), false );
        this.render();
    }

    addMesh(mesh) {
        this.scene.add( mesh );
    }

    initGrid(scene){
        var gridHelper = new THREE.GridHelper(500, 200);
        const gridHelperId = gridHelper.id;
        scene.add(gridHelper);
        return gridHelperId;
    }

    // Modifies `this.gridHelperId`
    showGrid(scene) {
        if (this.gridHelperId == undefined){
            this.gridHelperId = this.initGrid(scene)
            return this.gridHelperId;
        } else {
            return this.gridHelperId;
        }
    }

    // Modifies `this.gridHelperId`
    hideGrid(scene, id) {
        if (this.gridHelperId != undefined) {
            let grid = scene.getObjectById(id);
            scene.remove(grid);
            this.gridHelperId = undefined;
            return 0;
        } else {
            return -1;
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth * 0.799 / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( Math.floor(window.innerWidth * 0.799) , window.innerHeight );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame( this.render.bind(this) );
    }
}
