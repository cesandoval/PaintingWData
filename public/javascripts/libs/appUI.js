$(function(){
    var vplContainer = $(".vplContainer");
    $('#graphShow').on('click', function(){
        if(vplContainer.hasClass('hidden')){
            vplContainer.removeClass('hidden');
        }
        else{
            vplContainer.addClass('hidden');
        }
    })

});