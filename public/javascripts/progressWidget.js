

var $progressTab = $('.progressWidget')
var isPolling = false;
var pollType = 'shapes'; // poll shapes by default, we can switch to voxels and use the same helper
var currentJobs;
loadCurrentJobs();
var selectedIDs = 0;

// class progressWidget {
//     state = {
//         isPolling: false,
//         currentJobs = currentJobs
//     }
// }



function toggleProgressWidget(){
    console.log('toggleFired')
    // e.preventDefault();
    // $('progress-widget').toggle();
    var pollFunction; 
    var numIds = selectedIDs == 0 ? null : selectedIDs
    
    switch(pollType){// link in voxels here
        case 'shapes':
            pollFunction = pollShapeUpdates;
        default:
            pollFunction = pollShapeUpdates;      
    }

    if(!isPolling) {
        isPolling = !isPolling;            
        window.setTimeout(pollFunction, 5500);
    }
    else {
        isPolling = !isPolling;            
        window.clearTimeout(pollFunction);
    }  
}




function streamProgress() {
    xhr = new window.XMLHttpRequest() 
}

function pollShapeUpdates() { // move to public side (client) otherwise jquery won't work
console.log('polling fired')
suffix = "";//d ? "/id:" + id: ""
if(!isPolling) {// in case of delayed changes
    return window.clearTimeout(pollShapeUpdates);
}

console.log(suffix);
$.ajax({
    url: "/update/shapes" + suffix,
    type: 'GET',
    cache: false, // should this be?
    processData: false, 
    // contentType: false,
    contentType: 'application/json; charset=utf-8', 
    success: function (data) {
        console.log('success');
        updateJobs(data.progress); // resp needs to be formatted as an obj?
        if(currentJobs.length) {
            updateHtml(currentJobs);
        } 
        else {
            clearHTML();
        }
    },
    complete: toggleProgressWidget,
    failure: function (err) {
        console.log(err);
    }
});
}// make sure to fix the polling


function updateJobs(arr) {
    jobsCompleted = []
    newJobs = []

    if(!arr)
        return false // don't update arr

    for(var j = 0; j < arr.length; j++) { // can be length 1 if it is length 0 return
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
                else {
                    $('#flashes').trigger('flash', jobName + " was not found in the queue Error[1]")                            
                }
            } // in case we want to make them stay in the queue until they're been x'ed out. (localstorage)
            // finishedJobsAlert(jobsCompleted);
        }

        else if (input.length == 3) { // t
            console.log('currentJobs -= ' + input);        
            
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
                    newJobs.push(currentJobs.splice(i,1, input));
                }
            }
            if(!inArr)
                currentJobs.push(input)
        }
    }
    localStorage.setItem('currentJobs', JSON.stringify(currentJobs));
    
    console.log(currentJobs)
    console.log(jobsCompleted)
    console.log('updated jobs: ' + newJobs)

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

function updateHtml(jobs) {
    var progressList = clearHTML();
    var count = 0;
    // var progressList = "";
    jobs.forEach(job => {
        console.log('adding html: ' + job);
        jobNode = document.createElement('li');   
        jobNode.innerHTML;
        // progressList += "<li>" + createProgressBar(...job.slice(0,job.length-2)) + "</li>";
        jobNode.innerHTML += createProgressBar(...job.slice(1,job.length));
        progressList.appendChild(jobNode);    
        console.log(createProgressBar(...job.slice(1,job.length)));
        count++;
    });
    // document.getElementById("jobList").find('progressList').innerHTML = progressList;
}


function loadCurrentJobs() {
    try {
        currentJobs = JSON.parse(localStorage.getItem('currentJobs'));
        currentJobs = currentJobs == null ? [] : currentJobs;//if there exists no currentJob array, make one 
        console.log(currentJobs);
    }// load in current jobs from cache
    catch(e){
        console.log('ERROR: ' + e)
    }
    updateHtml(currentJobs);
}

function clearHTML() {
    var progressList = document.getElementById('progressList');     
    if(progressList && progressList.hasChildNodes()){
        progressList.innerHTML = '';
    }
    return progressList
}

// finishedJobsAlert = function(arr) {
//     if(!arr)
//         return;
//     var contents = "The following jobs have completed: \n"
//     for(item in arr) {
//         contents += "Job: " + item[0] + "\n"
//     }
//     return alert(contents)
// }

function createProgressBar(jobName, numerator, denominator) { // refactor tojade ( pass the entire array)
    console.log(jobName, numerator, denominator)
    jobname = escapeHTML(jobName);
    var percentage = ((numerator/denominator)*100).toFixed(2).toString();
    var innerString = jobName + ": " + numerator + "/" + denominator;
    console.log(percentage)
    var html = `
    <div class="progress" style="margin: 5px; border-width: 1px">
    <span class="progress-label" style="position: absolute; margin-left: 5px; text-overflow: ellipsis;"> ${innerString} </span>
    <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
    aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
    html +=  percentage+ "%\"></div></div>";
    return html
}

function escapeHTML (unsafe_str) {
    return unsafe_str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}
