function updateCameraRotation() {

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
   // camera.position.y = distance * Math.sin(rotation.y);
    camera.position.y = camera.position.y < 10 ? 10 : camera.position.y;
    console.log(camera.position.y);
    
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

}

function updateCameraPan() {
    
    var ii;

    pan.x += (panTarget.x - pan.x) * 0.08;
    pan.z += (panTarget.z - pan.z) * 0.08;

    for (ii = 0; ii < planeObjects.length; ii++) {
        planeObjects[ii].position.x += pan.x + panTarget.x;
        planeObjects[ii].position.z += pan.z + panTarget.z;
    }
    
    for (ii = 0; ii < panObjects.length; ii++) {
        panObjects[ii].position.x += pan.x + panTarget.x;
        panObjects[ii].position.z += pan.z + panTarget.z;
    }
    
    for (ii = 0; ii < nurbsObjects.length; ii++) {
        nurbsObjects[ii].position.x += pan.x + panTarget.x;
        nurbsObjects[ii].position.z += pan.z + panTarget.z;
    }
    
    
    if (panHOLDmove !== true) {
        panTarget.x = 0;
        panTarget.z = 0;
    }

}



