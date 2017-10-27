var $progressTab = $('.progressWidget')

var isPolling = false;
var pollType = 'shapes' // poll shapes by default, we can switch to voxels and use the same helper
var currentJobs = [[11,'Risk_cancerresp', 100, 1000000]]
var selectedIDs = 0


function toggleProgressWidget(){
    console.log('toggleFired')
    // e.preventDefault();
    // $('progress-widget').toggle();
    var pollFunction; 
    var numIds = selectedIDs == 0 ? null : selectedIDs
    
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
console.log('polling fired: ' + id)
suffix = id ? "/id:" + id: ""
console.log(suffix)
$.ajax({
    url: "/update/shapes" + suffix,
    type: 'GET',
    cache: false, // should this be?
    processData: false, 
    // contentType: false,
    contentType: 'application/json; charset=utf-8', 
    success: function (data) {
        console.log('success')
        updateJobs(data.progress); // resp needs to be formatted as an obj?


        // if (data.progress.length > 1) {
        //     output = []
        //     console.log(data.progress)
        //     for(item in data.progress) {
        //         output.append(handleProgess(item))
        //     }
        //     return output
        // }
        // else {
        //     return handleProgess(data.progress)
        // }
    },
    failure: function (err) {
        console.log(err);
    }
});
}

function updateJobs(arr) {
    jobsCompleted = []
    newJobs = []
    if(!arr)
        return false // don't update arr
    for(var j = 0; i < arr.length; j++) { // can be length 1 if it is length 0 return
        var input = arr[j];
        if(input.length == 0)
            continue; //continue when no vals
        
        if(typeof input === 'string') { //error message
            var error = input.split('$$')
            var jobName = error[1].filename.substring(0, filename.lastIndexOf("."));
            for(var i = 0; i < currentJobs.length; i++) {
                if(jobName.contains(currentJobs[i][1])) {
                    // currentJobs.pop(i)
                    jobCompleted += currentJobs.splice(i,1);
                    console.log(jobName + " has been removed from the queue (load error)");
                    // for testing only
                    $('#flashes').trigger('flash', jobName + " has been removed from the queue")        
                }
            } // in case we want to make them stay in the queue until they're been x'ed out. (localstorage)
            // finishedJobsAlert(jobsCompleted);
        }
        if (input.length == 3) { // t
            console.log('currentJobs -=' + input);        
            
            for(var i = 0; i < currentJobs.length; i++) {
                if(input[0] == currentJobs[i][0]) { // assuming ids work
                    jobCompleted += currentJobs.splice(i,1);
                    if(input[2]) {
                        console.log(input[1] + " has been removed from the queue (success)");
                        // for testing only
                        $('#flashes').trigger('flash', input[1] + " has completed!");
                    }
                    else {
                        console.log(input[1] + " has been removed from the queue (data error)");
                        // for testing only
                        $('#flashes').trigger('flash', input[1] + " was invalid!");
                    }
                }
            }
        }
        else if(input.length == 4) { // add new jobs to the end of the list
            var inArr = false;
            for(var i = 0; i < currentJobs.length; i++) {
                if(input[0] == currentJobs[i][0]) { // assuming ids work
                    inArr = true;
                    newJobs += currentJobs.splice(i,1, input);
                }
            }
            if(!inArr)
                currentJobs.append(input)
        }
    }
    console.log(currentJobs)
    console.log(jobsCompleted)
    console.log(newJobs)

}

var flashHandler = $('#flashes');

    flashHandler.on('flash', function(event, message){
        var flash = $('<div class="flash">');
        flash.text(message);
        flash.on('click', function(){
            $(this).remove();
            });
        $(this).append(flash);
    });

// function updateHtml(newJobs) {
//     var progressList = "";
    
//     currentJobs = newJobs; // update jobs in progress
//     for(job in currentJobs) {
//         console.log('adding html: ' + job);
//         progressList += "<li>" + createProgressBar(...job.slice(0,job.length-2)) + "</li>";
//     }
//     document.getElementById("jobList").children[0].innerHTML = progressList;
// }

// finishedJobsAlert = function(arr) {
//     if(!arr)
//         return;
//     var contents = "The following jobs have completed: \n"
//     for(item in arr) {
//         contents += "Job: " + item[0] + "\n"
//     }
//     return alert(contents)
// }

createProgressBar = function(jobName, numerator, denominator) { // refactor tojade ( pass the entire array)
var percentage = (((numerator/denominator)*100).floor()).toString();
var html = `<div class="progress">
<div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
aria-valuemin="0" aria-valuemax="100" style="width:`;
html +=  percentage+ "%\">" + jobName + ": " + numerator + "/" + denominator + "</div></div>";
return html
}
