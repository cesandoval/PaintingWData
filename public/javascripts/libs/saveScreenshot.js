//this js file is for taking the actual screenshot converting to a blob and then sending a post request
//to a route I make to save it to S3

$(function() { 
    var renderer = new THREE.WebGLRenderer({
            precision: 'mediump',
            antialias: true,
            preserveDrawingBuffer: true,
        });
    renderer.setPixelRatio(window.devicePixelRatio);
    //figure out correct width and height
    renderer.setSize(425, 425);
    renderer.setClearColor(new THREE.Color('white'));

    renderer.domElement.toBlob(function(blob) {
        var fd = new FormData();
        fd.append("fileToUpload", blob);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/screenshot", true);
        xhr.send(fd);
    });
});