(function() {
	'use strict';


	var graphicScale = L.control.graphicScale({
		doubleLine: true,
		fill: 'hollow',
        showSubunits: true
	}).addTo(map);

    var scaleText = L.DomUtil.create('div', 'scaleText' );
    graphicScale._container.insertBefore(scaleText, graphicScale._container.firstChild);
    scaleText.innerHTML = '<h1>Leaflet Graphic Scale</h1><p>style: <span class="choice">hollow</span>-<span class="choice">line</span>-<span class="choice">fill</span>-<span class="choice">nofill</span></p>';

    var styleChoices = scaleText.querySelectorAll('.choice');

    for (var i = 0; i < styleChoices.length; i++) {
        styleChoices[i].addEventListener('click', function(e) {
            graphicScale._setStyle( { fill: e.currentTarget.innerHTML } );
        });
    }

})();
