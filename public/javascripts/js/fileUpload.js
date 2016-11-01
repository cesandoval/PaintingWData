$(function() {
  var files;

  var $zip_file = $('#file-selector');
  var $file_info = $('#upload-file-info');
  var $upload_btn = $('#upload');
  var $progress_bar = $('.progress-bar');
  $zip_file.on('change', prepareForUpload);

  function prepareForUpload(event)
  {
    console.log("change");
    files = event.target.files;
    var filename = $($zip_file).val().replace(/C:\\fakepath\\/i, '');
    $file_info.html(filename);
    $upload_btn.removeClass('hidden');
  }

  $upload_btn.on('click', upload);

function upload(e)
{
    e.stopPropagation(); 
    e.preventDefault(); 

    var data = new FormData();
    $.each(files, function(key, value)
    {
        data.append(key, value);
    });

    $.ajax({
        url: '/upload',
        xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = (evt.loaded / evt.total)*100; 
                $progress_bar.text(percentComplete + '%');
                $progress_bar.width(percentComplete + '%');
            }
        }, false);
        xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
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
            if(typeof data.error === 'undefined')
            {
                
                window.location.replace("/uploadViewer/"+data.id);

            }
            else
            {
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log("the errors happened here");
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
}

});