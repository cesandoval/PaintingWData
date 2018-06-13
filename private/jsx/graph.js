import axios from 'axios'
// import * as d3 from 'd3'

export default class Graph {
    constructor(canvasElement, height, width) {
        // // Camera Settings
        // this.height = height
        // this.width = width
        // this.fov = 90
        // this.near = 0.01
        // this.far = 15000

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

        // // Setup D3 Style Zoom
        // this.zoom = d3
        //     .zoom()
        //     .scaleExtent([
        //         this.getScaleFromZ(this.far),
        //         this.getScaleFromZ(this.near),
        //     ])
        //     .on('zoom', () => {
        //         let d3_transform = d3.event.transform
        //         this.zoomHandler(d3_transform)
        //     })
        // this.view = d3.select(this.renderer.domElement)
        // this.setUpZoom()
    }

    // Create a Scene
    initScene() {
        return new THREE.Scene()
    }

    // Create a Camera
    initCamera(width, height) {
        // let aspect = width / height
        // var camera = new THREE.PerspectiveCamera(
        //     this.fov,
        //     aspect,
        //     this.near,
        //     this.far
        // )
        var camera = new THREE.PerspectiveCamera(
            90,
            width / height,
            0.01,
            15000
        )
        camera.position.y = 300
        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))
        camera.enablePan = true
        camera.enableRotate = false
        return camera
    }

    // toRadians(angle) {
    //     return angle * (Math.PI / 180)
    // }

    // getScaleFromZ(camera_z_position) {
    //     let half_fov = this.fov / 2
    //     let half_fov_radians = this.toRadians(half_fov)
    //     let half_fov_height = Math.tan(half_fov_radians) * camera_z_position
    //     let fov_height = half_fov_height * 2
    //     let scale = this.height / fov_height // Divide visualization height by height derived from field of view
    //     return scale
    // }

    // getZFromScale(scale) {
    //     let half_fov = this.fov / 2
    //     let half_fov_radians = this.toRadians(half_fov)
    //     let scale_height = this.height / scale
    //     let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians))
    //     return camera_z_position
    // }

    // zoomHandler(d3_transform) {
    //     let scale = d3_transform.k
    //     let x = -(d3_transform.x - this.width / 2) / scale
    //     let y = (d3_transform.y - this.height / 2) / scale
    //     let z = this.getZFromScale(scale)
    //     // canvas.controls.target
    //     console.log(z)

    //     this.camera.position.set(x, y, z)
    // }

    // setUpZoom() {
    //     this.view.call(this.zoom)
    //     let initial_scale = this.getScaleFromZ(this.far)
    //     var initial_transform = d3.zoomIdentity
    //         .translate(this.width / 2, this.height / 2)
    //         .scale(initial_scale)
    //     this.zoom.transform(this.view, initial_transform)
    //     this.camera.position.set(0, 0, this.far)
    // }

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
            // We might turn it directly into a blob instead...
            const img = renderer.domElement.toDataURL('image/png')
            // This opens up a new tab with the screenshot
            // const w = window.open('about:blank', 'PaintingWithData Screenshot')
            // w.document.write(
            //     "<img src='" + img + "' alt='PaintingWithData Screenshot'/>"
            // )

            var byteString = atob(img.split(',')[1])

            // separate out the mime component
            var mimeString = img
                .split(',')[0]
                .split(':')[1]
                .split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length)

            // create a view into the buffer
            var ia = new Uint8Array(ab)

            // set the bytes of the buffer to the correct values
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i)
            }
            var data = new Blob([ab], { type: mimeString })

            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile)
            }

            let textFile = window.URL.createObjectURL(data)

            let link = document.createElement('a')
            link.setAttribute('download', 'voxelExport.'.concat('png'))
            link.href = textFile
            document.body.appendChild(link)
            link.click()
        }

        window.screenshotToS3 = datavoxelId => {
            let resizedCanvas = document.createElement('canvas')
            let resizedContext = resizedCanvas.getContext('2d')
            let newHeight = 550
            let ratio = height / newHeight
            let newWidth = width / ratio

            resizedCanvas.height = newHeight.toString()
            resizedCanvas.width = newWidth.toString()
            resizedContext.drawImage(
                renderer.domElement,
                0,
                0,
                newWidth,
                newHeight
            )

            let img = resizedCanvas.toDataURL()
            let request = { id: datavoxelId, data: img }

            axios({
                method: 'post',
                url: '/screenshot',
                data: request,
            })
                .then(function(response) {
                    //handle success
                    console.log(response)
                })
                .catch(function(response) {
                    //handle error
                    console.log(response)
                })
        }

        return renderer
    }

    // Initialize Controls Object
    initControls(camera, canvas) {
        let controls = new THREE.OrbitControls(camera, canvas)
        controls.enableRotate = false

        // console.log(controls.domElement)
        // controls.domElement.addEventListener(
        //     'mousewheel',
        //     this.onDocumentMouseWheel,
        //     false
        // )

        return controls
    }

    onDocumentMouseWheel(event) {
        console.log(949494499)
        console.log(event)
        // var fovMAX = 160;
        // var fovMIN = 1;
        // camera.fov -= event.wheelDeltaY * 0.05;
        // camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
        // camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
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

    // eslint-disable-next-line
    renderSec(sec = 1, label = '') {
        const untilTime = Date.now() + sec * 1000

        if (untilTime > this.renderUntil) this.renderUntil = untilTime

        // if(until > 0){
        if (this.rendering == false) {
            this.render()
        }

        // console.log(`renderSec(${sec}) until ${this.renderUntil}. ${label}`)
    }

    render() {
        this.renderer.render(this.scene, this.camera)

        const until = Math.ceil((this.renderUntil - Date.now()) / 1000)

        if (this.untilTime != until) {
            this.untilTime = until
            // console.log(`render ${until} secs`)
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
