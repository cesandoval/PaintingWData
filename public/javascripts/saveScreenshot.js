//this js file is for taking the actual screenshot converting to a blob and then sending a post request
//to a route I make to save it to S3

function addOnPageLoad_() {
        window.addEventListener('DOMContentLoaded', function (e) {
            
        });
}

$(function() { 
    $("#btnSave").click(function() { 
        html2canvas($("#widget"), {
            onrendered: function(canvas) {
                theCanvas = canvas;


                canvas.toBlob(function(blob) {
                    saveAs(blob, "Dashboard.png"); 
                });
            }
        });
    });
});