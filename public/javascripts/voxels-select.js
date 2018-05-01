var $datavoxel = $('.datavoxel');
var $openVoxel = $('#openVoxel');
var $selectedLayers = $('#selectedLayers');
var $voxelPrivacy = $('.public');

var currentSelectedId = 0 ;

function deselectAll(){
	$datavoxel.removeClass('selected_layer');
}

var selectedVoxelId = 1;
$datavoxel.click(function(){
	var $datalayer = $(this); 
	if(!($datalayer.hasClass("selected_layer"))){
		deselectAll();
		selectedVoxelId = $datalayer.attr('id').split('_')[1];
		$datalayer.addClass('selected_layer');

		$selectedLayers.val(selectedVoxelId);
	}
});

$voxelPrivacy.click(function(){
	var id = $(this).context.id;
	var isPublic = $(this).context.checked;
	var request = {id: id, public: isPublic};
	$.ajax({
		url : "/voxelPrivacy/",
		type: 'POST',
		data: request
	});
});