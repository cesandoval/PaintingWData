// Hide and Show the Parallel Coords Widget
function toggleQueryData() {
    $('#dataShow').click(function(){
    	if ($('#parcoords').css('display') == 'none') {
    		$('#parcoords').show();
		} else {
			$('#parcoords').hide();	
		}	
    });
};

toggleQueryData();
