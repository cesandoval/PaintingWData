var json = localStorage.getItem('progressWidget');
var widget;

//todo
// build state object for widget class
//finish widget constructor
///flesh out widge t on display
//augment upload controller to send a resposne id to the widget
// construct widget in script that runs in layout
// figure out how to pass the res to the layout code
// refactor ping protocol ping -> async updat, ping  handle errors, maybe build a failure counter or something.
// we have to remove complete ids from the user side, probably hande within the menu class (add button tag with event)

//

function ProgressWidget(uploadID = null) {
    // isPolling
    // pollType
    // currentJobs
    // selectedIDs
    // $progressTab

    // flashHandler
    $.widget("progressWidget", {
        options: {
            value: uploadID
        },

        _create: function () {
            // load saved state 
            var savedState = localStorage.getItem('progressWidget'),
                state = null;

            // var progressTab = this.element;
            this.$progressTab = this.element;
            this._createWidgetMenu();

            if (savedState) {
                this.state = JSON.parse(savedState);
                if(this.options.value && this.state.selectedIDs.indexOf(this.optiona.value) == -1){
                    this.state.selectedIDs.shift(this.options.value);
                }
            }
            else {
                state = this._defaultState();
            }
            widget.flashHandler = $('#flashes');
            this._bindUIActions();

            // get the widget stub
            // initialize widget hidden
            var $progressTab = $('');

            $progressTab.after(this.$widgetMenu);

        },

        _defaultState: function () {
            return {
                currentJobs: [],
                isPolling: false,
                pollType: "shapes",
                selectedIDs: [1, 2, 3, 4, 5, 6],
                maxTimeouts: 3, // param for the default num of timeouts.
                timeouts: maxTimeouts
            }
        },

        _createWidgetMenu: function () {
            var $progressWidget = this.element,
                opts = this.options,
                widgetMenu = '';

            widgetMenu += `<div class="widgetmenu"">
                <span id="widgetcaption">${widgetCaption}</span>
                    <ul id="jobList">   
            `
            for (job in this.state.currentJobs) {
                widgetMenu += '\t';
                widgetMenu += createProgressBar(...job);
                widgetMenu += '\n';
            }

            // '\n';
            widgetMenu += '\t</div>\n';
            widgetMenu += '</div">';
            this.$widgetMenu =  $(widgetMenu);

        },
        _bindUIActions: function () {
            this._on(this.$progressTab, {
                click: '_toggleDisplay'
            })
            this._on(this.$widgetMenu.children('close-btn'), 
            {
                click: '_destroyChild(this.id)'
            });
            this._on(this.$flashhandler, {
                'flash': function(event, message){
                var flash = $('<div class="flash">');
                flash.text(message);
                flash.on('click', function(){
                    $(this).remove();
                    });
                $(this).append(flash);
            }
        });


        },
        _destroyChild: function(id){
            if(id === null){
                console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                return false;

            }
            this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
            this.trigger('change');
        },
        

        _onDestroy: function () {
            localStorage.setItem('progressWidget', this.state);
            this.$widgetMenu.hide();
            this.$widgetMenu.remove();
            this.$progressTab.remove();//????
            // this.$
        },

        _toggleDisplay: function () {
            this.$widgetMenu.slideToggle();
            if (!this.$widgetMenu.is(":hidden")) { // if visible
                // hidden works better than visible for some resason
                this.state.isPolling = true;
                this.state.timeouts = this.state.maxTimeouts;
                this._xhrLoop();
            } else {
                this.state.isPolling = false;// set polling var to false
                //maybe add interrupt
            }
        },


        // Create a public method.
        _updateJobs: function (arr) {
            jobsCompleted = [];
            newJobs = [];

            if (!arr)
                return false; // don't update arr

            for (var j = 0; j < arr.length; j++) { // can be length 1 if it is length 0 return
                var input = arr[j];
                if (input.length == 0)
                    continue; //continue when no vals

                if (typeof input === 'string') { //error message
                    var error = input.split('$$');
                    var jobName = error[1].substring(0, error[1].lastIndexOf("."));

                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (jobName.contains(this.state.currentJobs[i][1])) {
                            // this.state.currentJobs.pop(i)
                            jobCompleted += this.state.currentJobs.splice(i, 1);
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

                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (input[0] == this.state.currentJobs[i][0]) { // assuming ids work
                            jobCompleted += this.state.currentJobs.splice(i, 1);
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
                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (input[0] == this.state.currentJobs[i][0]) { // assuming ids work
                            inArr = true;
                            newJobs.push(this.state.currentJobs.splice(i, 1, input));
                        }
                    }
                    if (!inArr)
                        this.state.currentJobs.push(input)
                }
            }
            // localStorage.setItem('this.state.currentJobs', JSON.stringify(this.state.currentJobs));
            console.log(this.state.currentJobs)
            console.log(jobsCompleted)
            console.log('updated jobs: ' + newJobs)
        },

        _xhrLoop: function () {// this should be private. ping protocol 2
            var pollquery = this.state.pollType + "?shapes=" + this.state.selectedIDs.join("$$");
            if (this.state.isPolling) {
                this._createXhrRequest(pollquery);
                console.log('firing pollFunction: ' + pollquery);

            }
            else {
                return false;
            }
        },


        _createXhrRequest: function (pollquery) {// ping protocol 3
            var xhr = XMLHttpRequest();
            xhr.open('GET', '/' + pollquery, true);// rework poll functino to be a parameter with ids for both voxels and shapes
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var arr;
                    try {
                         arr = JSON.parse(xhr.response);
                         this._updateJobs(arr);
                    } catch(e) {
                        console.log('XHR ERROR: ' + e.toString());
                    }
                    if (this.state.isPolling)
                        this._xhrLoop();

                }
            }.bind(this);
            xhr.timeout = 500
            xhr.responsetype = "json"
            xhr.ontimeout = function () {
                this.state.timeouts -= 1;
                if (this.state.timeouts == 0) {
                    this.state.isPolling = false;
                    console.log('too many timeout errors, polling stopped')
                }
            }.bind(this);
        }



    });



}





    // updateHtml(jobs) {
    //     var progressList = clearHTML();
    //     var count = 0;
    //     // var progressList = "";
    //     jobs.forEach(job => {
    //         console.log('adding html: ' + job);
    //         jobNode = document.createElement('li');
    //         jobNode.innerHTML;
    //         // progressList += "<li>" + createProgressBar(...job.slice(0,job.length-2)) + "</li>";
    //         jobNode.innerHTML += createProgressBar(...job);
    //         progressList.appendChild(jobNode);
    //         // console.log(createProgressBar(...job.slice(1, job.length)));
    //         count++;
    //     });
    //     // document.getElementById("jobList").find('progressList').innerHTML = progressList;
    // }


    



function initialize() {//
    var savedState = localStorage.getItem('progressWidget');
    if (savedState) {
        widget = JSON.parse(json);
        widget.$progressTab = $('.progressWidget'); // reinitialize the jquery tab
        widget.flashHandler = $('#flashes');

        window.progressWidget = widget;

    } else {
        widget = new progressWidget();
        window.progressWidget = widget;
    }
}

$(function(){
    ProgressWidget();
    $("joblist").progressWidget( {value: 10000});
})



function clearHTML() { // helper method that returns cleared inner html section
    var progressList = document.getElementById('progressList');
    if (progressList && progressList.hasChildNodes()) {
        progressList.innerHTML = '';
    }
    return progressList
}



function createProgressBar(id, jobName, numerator, denominator) { //cleare a single progress bar DOM Element
    console.log(jobName, numerator, denominator)
    jobname = escapeHTML(jobName);
    var percentage = ((numerator / denominator) * 100).toFixed(2).toString();
    var innerString = jobName + ": " + numerator + "/" + denominator;
    console.log(percentage)
    var html = `
    <div class="progress-widget" style="">
        <div class="tooltip progress-label"> ${innerString}
            <span class="tooltiptext"> ${innerString} </span> </div>
        <span class="progress-label" style=""> ${innerString} </span>
        <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
            aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
    html += percentage + `%\"></div>
    <button id=${id} type="button" class="close-btn" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button></div>
    `;
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

// initialize();



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