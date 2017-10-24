export default class Graph {
    constructor(canvasElement, height, width) {
        // Initialize a Canvas for Three.js
        // + all this necessary to see things
        this.canvas = canvasElement
        this.clientHeight = height
        this.clientWidth = width
        this.scene = this.initScene()
        //this.scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );
        this.camera = this.initCamera(this.clientWidth, this.clientHeight)
        this.renderer = this.initRenderer(this.clientWidth, this.clientHeight)
        this.controls = this.initControls(this.camera, this.canvas)

        // Optional
        // this.gridHelperId = this.initGrid(this.scene);

        // Put canvas onto the page
        this.insertCanvas(this.canvas, this.renderer.domElement)

        this.frameTime = new Date().getTime()
        this.startTime = new Date().getTime()

        this.renderUntil = Date.now()
        this.untilTime = this.renderUntil - Date.now()
        this.rendering = false
    }

    // Create a Scene
    initScene() {
        return new THREE.Scene()
    }

    // Create a Camera
    initCamera(width, height) {
        var camera = new THREE.PerspectiveCamera(90, width / height, 0.01, 1500)
        camera.position.y = 300
        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))
        camera.enablePan = true
        camera.enableRotate = false
        return camera
    }

    // Create a Renderer
    initRenderer(width, height) {
        var renderer = new THREE.WebGLRenderer({
            precision: 'mediump',
            antialias: true,
            preserveDrawingBuffer: true,
        })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(width, height)
        renderer.setClearColor(new THREE.Color('white'))

        window.render = () => renderer.render(this.scene, this.camera)

        window.getScreenShot = () => {
            const img = renderer.domElement.toDataURL('image/jpeg')
            const w = window.open('about:blank', 'PaintingWithData Screenshot')
            w.document.write(
                "<img src='" + img + "' alt='PaintingWithData Screenshot'/>"
            )
        }

        return renderer
    }

    // Initialize Controls Object
    initControls(camera, canvas) {
        let controls = new THREE.OrbitControls(camera, canvas)
        controls.enableRotate = false
        return controls
    }

    // Appends canvas onto the element
    insertCanvas(element, canvas) {
        element.appendChild(canvas)
    }

    start() {
        // (function() {
        //     window.requestAnimationFrame =
        //         window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        //         window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        // })();

        window.addEventListener('resize', this.onResize.bind(this), false)
        this.renderSec(7)

        window.renderSec = this.renderSec.bind(this)

        window.setInterval(() => {
            if (!this.rendering) {
                window.requestAnimationFrame(() => {
                    window.render()
                })
            }
        }, 2000)

        // default mouseUp to renderSec(1)
        document.body.addEventListener('mouseup', () => {
            this.renderSec(1, 'mouseUp')
        })

        // default mouseDown to renderSec(0.5)
        document.body.addEventListener('mousedown', () => {
            this.renderSec(0.5, 'mouseDown')
        })
    }

    addMesh(mesh) {
        this.scene.add(mesh)
    }

    initGrid(scene) {
        var gridHelper = new THREE.GridHelper(500, 200)
        const gridHelperId = gridHelper.id
        scene.add(gridHelper)
        return gridHelperId
    }

    // Modifies `this.gridHelperId`
    showGrid(scene) {
        if (this.gridHelperId == undefined) {
            this.gridHelperId = this.initGrid(scene)
            return this.gridHelperId
        } else {
            return this.gridHelperId
        }
    }

    // Modifies `this.gridHelperId`
    hideGrid(scene, id) {
        if (this.gridHelperId != undefined) {
            let grid = scene.getObjectById(id)
            scene.remove(grid)
            this.gridHelperId = undefined
            return 0
        } else {
            return -1
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth * 0.799 / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
            Math.floor(window.innerWidth * 0.799),
            window.innerHeight
        )
    }

    renderSec(sec = 1, label = '') {
        const untilTime = Date.now() + sec * 1000

        if (untilTime > this.renderUntil) this.renderUntil = untilTime

        // if(until > 0){
        if (this.rendering == false) {
            this.render()
        }

        console.log(`renderSec(${sec}) until ${this.renderUntil}. ${label}`)
    }

    render() {
        this.renderer.render(this.scene, this.camera)

        const until = Math.ceil((this.renderUntil - Date.now()) / 1000)

        if (this.untilTime != until) {
            this.untilTime = until
            console.log(`render ${until} secs`)
        }

        if (until > 0) {
            this.rendering = true
            window.requestAnimationFrame(() => {
                this.render()
            })
        } else {
            this.rendering = false
        }

        // window.requestAnimationFrame( this.render.bind(this) );
        // setTimeout(this.render.bind(this), 1000); // do not under 1000
    }
}
