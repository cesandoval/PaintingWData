var json = localStorage.getItem('progressWidget');
var widget;



class progressWidget {
    // isPolling
    // pollType
    // currentJobs
    // selectedIDs
    // $progressTab
    // flashHandler

    constructor() {
        this.$progressTab = $('.progressWidget');
        this.flashHandler = $('#flashes');
        this.$pollingToggle = $('#PollingToggle');
        this.isPolling = false;
        this.currentJobs = [];
        this.selectedIDs = 0;
        this.pollType = "shapes";
        this.pollFunction = this.pollShapeUpdates;


        this.flashHandler.on('flash', function (event, message) {
            var flash = $('<div class="flash">');
            flash.text(message);
            flash.on('click', function () {
                $(this).remove();
            });
            $(this).append(flash);
        });

        // this.$progressTab.on('toggleProgress', this.toggleProgressWidget); // set progress toggle handler
        this.$pollingToggle.on('click', this.toggleProgressWidget)
        // this.on('toggleDisplay', this.toggleDisplay);
        // this.on('save', saveState)
    }


    xhrLoopRequest() {

        switch (this.pollType) {// link in voxels here
            case 'shapes':
                pollFunction = this.pollShapeUpdates;
            default:
                pollFunction = this.pollShapeUpdates;
        }
        console.log('firing pollFunction')
        await pollFunction();
        window.setTimeout(this.xhrLoopRequest, 500);
    }


    toggleProgressWidget() {
        // e.preventDefault();
        // $('progress-widget').toggle();
        var pollFunction;
        var numIds = this.selectedIDs == 0 ? null : this.selectedIDs

        if (!this.isPolling) {
            console.log('toggleFired');
            
            this.isPolling = !this.isPolling;
            window.setTimeout(this.xhrLoopRequest, 500);
        }
        else {
            this.isPolling = !this.isPolling;
            window.clearTimeout(this.xhrLoopRequest);
        }
    }



    async pollShapeUpdates() { // move to public side (client) otherwise jquery won't work
        console.log('pollshapeupdates fired')
        suffix = "";//d ? "/id:" + id: ""
        if (!this.isPolling) {// in case of delayed changes
            return window.clearTimeout(this.xhrLoopRequest);
        }

        console.log(suffix);
        await $.ajax({
            url: "/update/shape" + suffix,
            type: 'GET',
            cache: false, // should this be?
            processData: false,
            // contentType: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                console.log('success');
                updateJobs(data.progress); // resp needs to be formatted as an obj?
                if (this.currentJobs.length) {
                    updateHtml(this.currentJobs);
                }
                else {
                    clearHTML();
                }
            },
            // complete: xhrLoopRequest,
            failure: function (err) {
                console.log(err);
            }
        });
        return xhrLoopRequest();
    }// make sure to fix the polling


    updateHtml(jobs) {
        var progressList = clearHTML();
        var count = 0;
        // var progressList = "";
        jobs.forEach(job => {
            console.log('adding html: ' + job);
            jobNode = document.createElement('li');
            jobNode.innerHTML;
            // progressList += "<li>" + createProgressBar(...job.slice(0,job.length-2)) + "</li>";
            jobNode.innerHTML += createProgressBar(...job.slice(1, job.length));
            progressList.appendChild(jobNode);
            // console.log(createProgressBar(...job.slice(1, job.length)));
            count++;
        });
        // document.getElementById("jobList").find('progressList').innerHTML = progressList;
    }


    updateJobs(arr) {
        jobsCompleted = []
        newJobs = []

        if (!arr)
            return false // don't update arr

        for (var j = 0; j < arr.length; j++) { // can be length 1 if it is length 0 return
            var input = arr[j];
            if (input.length == 0)
                continue; //continue when no vals

            if (typeof input === 'string') { //error message
                var error = input.split('$$')
                var jobName = error[1].filename.substring(0, filename.lastIndexOf("."));

                for (var i = 0; i < this.currentJobs.length; i++) {
                    if (jobName.contains(this.currentJobs[i][1])) {
                        // this.currentJobs.pop(i)
                        jobCompleted += this.currentJobs.splice(i, 1);
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

                for (var i = 0; i < this.currentJobs.length; i++) {
                    if (input[0] == this.currentJobs[i][0]) { // assuming ids work
                        jobCompleted += this.currentJobs.splice(i, 1);
                        if (input[2]) {
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

            else if (input.length == 4) { // add new jobs to the end of the list
                var inArr = false;
                for (var i = 0; i < this.currentJobs.length; i++) {
                    if (input[0] == this.currentJobs[i][0]) { // assuming ids work
                        inArr = true;
                        newJobs.push(this.currentJobs.splice(i, 1, input));
                    }
                }
                if (!inArr)
                    this.currentJobs.push(input)
            }
        }
        // localStorage.setItem('this.currentJobs', JSON.stringify(this.currentJobs));
        console.log(this.currentJobs)
        console.log(jobsCompleted)
        console.log('updated jobs: ' + newJobs)
    }

}
// End Class



function initialize() {
    var savedState = localStorage.getItem('progressWidget');
    if (savedState) {
        widget = JSON.parse(json);
        widget.$progressTab = $('.progressWidget'); // reinitialize the jquery tab
        widget.flashHandler = $('#flashes');
        
    } else {
        progressWidget = new progressWidget();
    }
}

function saveState() {
    localStorage.setItem('progressWidget', progressWidget);
}




function clearHTML() { // helper method that returns cleared inner html section
    var progressList = document.getElementById('progressList');
    if (progressList && progressList.hasChildNodes()) {
        progressList.innerHTML = '';
    }
    return progressList
}



function createProgressBar(jobName, numerator, denominator) { //cleare a single progress bar DOM Element
    console.log(jobName, numerator, denominator)
    jobname = escapeHTML(jobName);
    var percentage = ((numerator / denominator) * 100).toFixed(2).toString();
    var innerString = jobName + ": " + numerator + "/" + denominator;
    console.log(percentage)
    var html = `
    <div class="progress" style="margin: 5px; border-width: 1px">
    <span class="progress-label" style="position: absolute; margin-left: 5px; text-overflow: ellipsis;"> ${innerString} </span>
    <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
    aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
    html += percentage + "%\"></div></div>";
    return html
}

function escapeHTML(unsafe_str) { // make sure strings are XXS Safe
    return unsafe_str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#39;')
        .replace(/\//g, '&#x2F;')
}

initialize();




// function loadCurrentJobs() {
//     try {
//         currentJobs = JSON.parse(localStorage.getItem('currentJobs'));
//         currentJobs = currentJobs == null ? [] : currentJobs;//if there exists no currentJob array, make one 
//         console.log(currentJobs);
//     }// load in current jobs from cache
//     catch(e){
//         console.log('ERROR: ' + e)
//     }
//     updateHtml(currentJobs);
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