
function PanControls(_camera, _objects, _planes, _domElement) {

    if (_objects instanceof THREE.Scene) {
        _objects = _objects.children;
    }
    var _projector = new THREE.Projector();
    var _mouse = new THREE.Vector3(),
        _offset = new THREE.Vector3();
    var _selected;
    _domElement.addEventListener('mousemove', _onDocumentMouseMove, false);
    _domElement.addEventListener('mousedown', _onDocumentMouseDown, false);
    _domElement.addEventListener('mouseup', _onDocumentMouseUp, false);

    function _onDocumentMouseMove(event) {
        
        if (isMouseDownRightPAN) {
            
            event.preventDefault();
            _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
            _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;
            var ray = _projector.pickingRay(_mouse, _camera);
            //console.log(_projector);
            if (_selected) {
                var targetPos = ray.ray.direction.clone().multiplyScalar(_selected.distance).add(ray.ray.origin);
                targetPos.y = 0;
                _offset.y = 0;
                firstpos.x = _selected.object.position.x;
                firstpos.z = _selected.object.position.z;
                _selected.object.position.copy(targetPos.sub(_offset));
                secpos.x = _selected.object.position.x;
                secpos.z = _selected.object.position.z;
                panTarget.x = (-firstpos.x + secpos.x) * 1;
                panTarget.z = (-firstpos.z + secpos.z) * 1;
            }
            
            var intersects = ray.intersectObjects(_objects);
            if (intersects.length > 0) {
                _domElement.style.cursor = 'pointer';
            } else {
                _domElement.style.cursor = 'auto';
            }
            
            return;
            
        }
    }

    function _onDocumentMouseDown(event) {
        
        if (shiftDOWN === true && event.which==3 ) {
            isMouseDownRightPAN = true;
            // console.log(_objects[0]);
            event.preventDefault();
            _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
            _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;
            var ray = _projector.pickingRay(_mouse, _camera);
            var intersects = ray.intersectObjects(_planes);
            //console.log(intersects);
            if (intersects.length > 0) {
                _selected = intersects[0];
                _offset.copy(_selected.point).sub(_selected.object.position);
                _domElement.style.cursor = 'move';
            }
        }
    }

    function _onDocumentMouseUp(event) {
        event.preventDefault();
        if (_selected) {
            _selected = null;
        }
        _domElement.style.cursor = 'auto';
    }
}