//this js file is for taking the actual screenshot converting to a blob and then sending a post request
//to a route I make to save it to S3
$(function() { 
    var renderer = new THREE.WebGLRenderer({
            precision: 'mediump',
            antialias: true,
            preserveDrawingBuffer: true,
        });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(425, 425);
    renderer.setClearColor(new THREE.Color('white'));

    var img = renderer.domElement.toDataURL('image/png');
    var request = {id: datavoxelId, data: img};
    $.ajax({
        type: 'POST',
        url: '/screenshot',
        data: request     
    });
});