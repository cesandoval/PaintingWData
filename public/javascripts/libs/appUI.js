$(function(){
    var vplContainer = $(".vplContainer");
    var parcoordsContainer = $(".parcoords");

    if (!(parcoordsContainer.hasClass('hidden'))){
        vplContainer.addClass('hidden');
    }

    $('#graphShow').on('click', function(){
        if(vplContainer.hasClass('hidden')){
            vplContainer.removeClass('hidden');
            parcoordsContainer.addClass('hidden')
        }
        else{
            vplContainer.addClass('hidden');
        }
    })

    $('#dataShow').on('click', function(){
        if(parcoordsContainer.hasClass('hidden')){
            parcoordsContainer.removeClass('hidden');
            vplContainer.addClass('hidden');
        }
        else{
            parcoordsContainer.addClass('hidden');
        }
    })

});
