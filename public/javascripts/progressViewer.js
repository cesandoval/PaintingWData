var $progressTab = $('.progressWidget')

var isPolling = false;
var pollType = 'shapes' // poll shapes by default, we can switch to voxels and use the same helper
var currentJobs = []



function toggleProgressWidget(e){
    $('progress-widget').toggle();
    var pollFunction; 


    var numIds = req.body.numIds ? req.body.numIds : null
    
    switch(pollType){
        case 'shapes':
            pollFunction = pollShapeUpdates;
        default:
            pollFunction = pollShapeUpdates;      
    }

    if(!isPolling) {
        setTimeout(pollFunction(numIds), 1000);
    }
    else {
        clearTimeout(pollFunction);
    }


}

function pollShapeUpdates(id = null) { // move to public side (client) otherwise jquery won't work
suffix = id ? "" : "/id:" + id
$.ajax({
    url: "/update/shapes" + suffix,
    type: 'GET',
    cache: false, // should this be?
    processData: false, 
    // contentType: false,
    contentType: 'application/json; charset=utf-8', 
    success: function (data) {
        console.log(data);
        if (data.progress.length > 1) {
            output = []
            console.log(data.progress)
            for(item in data.progress) {
                output.append(handleProgess(item))
            }
            return output
        }
        else {
            return handleProgess(data.progress)
        }
    },
    failure: function (err) {
        console.log(err);
    }
});
}

function handleProgess(input) {
    console.log(input);
    var progressList = ""
    if (input.length == 0)
       return false; //stop the function since the value is empty.
    
    currentJobs.push(input);
    for(job in currentJobs) {
        progressList = "<li>" + createProgressBar(...job) + "</li>"
    }
    document.getElementById("jobList").children[0].innerHTML = progressList;
}

createProgressBar = function(jobName, numerator, denominator){
var percentage = (((numerator/denominator)*100).floor()).toString();
var html = `<div class="progress">
<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
aria-valuemin="0" aria-valuemax="100" style="width:`;
html +=  percentage+ "%\">" + jobName + ": " + numerator + "/" + denominator + "</div></div>";
return html
}
