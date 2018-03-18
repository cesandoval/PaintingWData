$(function() {
  var files;

  var $zip_file = $('#file-selector');
  var $file_info = $('#upload-file-info');
  var $upload_btn = $('#upload');
  var $add_file_btn = $('.custom-upload');
  var $progress_bar = $('.progress-bar');
  var $filename_div = $('#file-name-display');
  $zip_file.on('change', prepareForUpload);
  console.log($zip_file, 777777777)

  function prepareForUpload(event)
  {
    console.log("change");
    files = event.target.files;
    var filename = $($zip_file).val().replace(/C:\\fakepath\\/i, '');
    $file_info.html(filename);
    $upload_btn.removeClass('hidden');
    $add_file_btn.addClass('btn-visited');
    $filename_div.text("File added.");
  }

  $upload_btn.on('click', upload);

function upload(e)
{
    console.log(e, 000000000)
    e.stopPropagation(); 
    e.preventDefault(); 

    var data = new FormData();
    console.log(data, 11111111111)
    $.each(files, function(key, value)
    {
        data.append(key, value);
    });

    var flashHandler = $('#flashes');

    flashHandler.on('flash', function(event, message){
        console.log(event, message, 2222222222)
        var flash = $('<div class="flash">');
        flash.text(message);
        flash.on('click', function(){
            $(this).remove();
            });
        $(this).append(flash);
    });

    $.ajax({
        url: '/upload',
        xhr: function () {
        var xhr = new window.XMLHttpRequest();
        $('.progress').removeClass('hidden');
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                console.log(5555555555)
                var percentComplete = (evt.loaded / evt.total)*100; 
                $progress_bar.text(percentComplete + '%');
                $progress_bar.width(percentComplete + '%');
            }
        }, false);
        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                console.log(66666666)
                var percentComplete = (evt.loaded / evt.total)*100; 
                $progress_bar.text(percentComplete + '%');
                $progress_bar.width(percentComplete + '%');
            }
        }, false);
       
        return xhr;
    },
        type: 'POST',
        data: data,
        cache: false,
        processData: false, 
        contentType: false, 
        success: function(data, textStatus, jqXHR)
        {
            console.log(data, 33333333)
            if(typeof data.error === 'undefined')
            {
                console.log( data, 4444444444)
                window.location.replace("/uploadViewer/"+data.id);

            }
            else
            {
                console.log("54444444");
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log("the errors happened here");
            console.log("55555555");
            console.log(jqXHR, textStatus, errorThrown)
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
            // window.location.replace("/upload");
        }
    });
}

});