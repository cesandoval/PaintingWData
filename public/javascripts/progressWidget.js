
// refactor widget elements to cached eles
// put the flashes on a html div that has a removable event




// save sate on destroy

//left to do 
//flash alerts )(removable)
// finish polling, make sure refreshing works
// make sure support for multiple items works
// 


function progressWidget() {
    // isPolling
    // pollType
    // currentJobs
    // selectedIDs
    // $el
    // flashHandler

    $.widget("custom.progressWidget", {
        options: {
            value: 0
        },

        //constructor
        _create: function () {
            console.log('initialize widget')
            // load saved state 
            this.element;
            this.$el = $(this.element);
            this.$anchor = $('.progress-tracker')
            this.$flashhandler = $('#flashes');
            var savedState = window.localStorage.getItem('progressWidget');

            //if window.localStorage, initialize the widget with old state, else make new widget
            if (savedState && savedState !== 'undefined') {
                this.state = JSON.parse(savedState);
                if (this.options.value && this.state.selectedIDs.indexOf(this.options.value) == -1) {
                    this.state.selectedIDs.shift(this.options.value);
                }
            }
            else {
                this.state = this._defaultState();
            }
            this.state.fullRefresh = 5; // so that thte state is fully refreshed on creation
            //check if a new layer has just been uploaded
            var urlString = window.location.pathname;
            if (urlString.indexOf('/layers') != -1) {
                try {
                    var temp = urlString.split('/');
                    this.state.uploadId = parseInt(temp[temp.length -1]);
                }
                catch (e) {
                    console.log('PROGRESSWIDGET ERROR: error adding ID, url: ' + urlString)
                    console.log(this.state.uploadId)
                }
            }

            // if a new layer has just been uploaded, poll it and display it
            if (this.state.uploadId != null) {
                this.state.isPolling = true;
                this._xhrLoop(); // start polling on open wasn't working
                this.state.isPolling = false
                this.state.uploadId = null;
                if (this.state.pageReload === false)
                    this.state.pageReload = true;
                if (!this.state.isDisplayed) {
                    this._toggleDisplay();
                    this.state.isDisplayed = true;
                }
            }
            else {
                this.refresh();//initialize child views  
            }
            this._bindUIActions();

            if (this.state.isDisplayed) {
                this.$el.show(200)
            }
            else {
                this.$el.hide();

            }
        },

        //created childviews, called on change event
        _createWidgetMenu: function () {
            if(this.state.fullRefresh != 5){
                this._partialRefresh();
                return
            }
            var $progressWidget = this.element,
                opts = this.options,
                widgetCaption = "This tracks all current shape jobs in the queue. If you would like to turn off flash requests, click the options button",
                htmlBuilder = '';


            htmlBuilder += `
            <div id="widget-menu"">
                <span class="tooltiper" data-tooltip="${widgetCaption}"><i class="fa fa-question" style="top:'0px!important'"/></span>            
                <ul id="jobList"></ul>
            </div>   
            `
            this.state.currentJobs;
            widgetMenu = $.parseHTML(htmlBuilder);
            widgetMenu = $(widgetMenu);
            widgetMenu.text = widgetCaption;
            if (this.state.currentJobs.length) {
                this.state.currentJobs.forEach(job => {
                    htmlBuilder = createProgressBar(...job);
                    var temp = $.parseHTML(htmlBuilder);
                    widgetMenu.find('#jobList').append(temp);
                })
            }
            else {
                widgetMenu.find('#jobList').append($.parseHTML(noJobs()));
            }

            if ($('#widget-menu').length) {
                $('#widget-menu').remove();
            }

            this.$widgetMenu = widgetMenu;
            this.$el.append(this.$widgetMenu);

            if (this.$widgetMenu.children().length) {
                $('.close-btn').on('click', this._closeItem.bind(this));
            }
            this.state.fullRefresh = 0;  
            toolTiper();            
        },


        _partialRefresh: function() {
            this.state.currentJobs.forEach(job => {
                var [id, jobName, numerator, denominator] = job,
                percentage = ((numerator / denominator) * 100).toFixed(2).toString(),
                innerString = jobName + ": " + numerator + "/" + denominator,
                menuItem = $('#' + id),
                datatool = menuItem.find('.tooltiper').attr('data-tooltip', innerString)
                menuItem.find('.progress-label').text(percentage + '%');
                menuItem.find('.progress-bar').css('width', percentage + '%');
            });
        },

        _closeItem: function (e) {// for removing menu items from clicks
            var menuItem = $(e.target).closest('.menu-item');
            var id = menuItem.attr('id')
            menuItem.remove();
            if (id === null) {
                console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                return false;
            }
            this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
            // update removal for async calls
            var delJob = this.state.currentJobs.filter((item) => {
                if (item[0] == id) {
                    return item;
                }
            });
            var removed = this.state.currentJobs.splice(this.state.currentJobs.indexOf(delJob), 1);
            console.log(removed)
            this.refresh();
            e.preventDefault();
        },

        _bindUIActions: function () {
            this._on(this.$anchor, {
                click: '_toggleDisplay'
            })

            window.addEventListener('beforeunload', this._destroy.bind(this), false);

            this._on(this.$flashhandler, {
                'flash': function (event, message) {
                    var flash = $('<div class="flash">');
                    flash.text(message);
                    flash.on('click', function () {
                        $(this).remove();
                    });
                    $(this).append(flash);
                }
            });


        },

        //unload widget: save state and remove all components.
        _destroy: function () {
            var test = JSON.stringify(this.state);
            window.localStorage.setItem('progressWidget', JSON.stringify(this.state));
            window.localStorage.getItem('progressWidget');

            if(this.state.isDisplayed)
                this.$el.hide(200);

            if (this.$widgetMenu) {
                this.$widgetMenu.remove();
            }

            if (this.$el && this.$el.children().length)
                this.$el.children().remove();//????
        },

        //toggles display and polling controls
        _toggleDisplay: function (e) {
            if(e)
                e.preventDefault();

            if (this.state.isDisplayed) {
                this.state.isPolling = false;// set polling var to false                
                this.$el.hide(200);
                this.state.isDisplayed = !this.state.isDisplayed;

            } else {
                this.$el.show(200);
                this.state.isDisplayed = !this.state.isDisplayed;
                this.state.isPolling = true;
                this.state.timeouts = 3;
                this._xhrLoop();
            }
        },

        //refresh state, should be triggered on init, user input (deletion), update jobs,=
        refresh: function () {
            console.log('refreshed')
            this._createWidgetMenu();



            if (this.state.currentJobs.length == 0 && this.state.isDisplayed) {
                this.selectedIDs = []
                this._toggleDisplay();
            }
            else {
                this.state.selectedIDs = this.state.currentJobs.map(function (obj) {
                    return obj[0];
                });
            }
            if (this.state.pageReload) {
                this.state.isPolling = false;
                location.reload(false);
            }
        },

        // update state.currentJobs
        updateJobs: function (arr) {
            jobsCompleted = [];
            newJobs = [];

            if (!arr)
                return false; // don't update arr

            for (var j = 0; j < arr.length; j++) { // can be length 1 if it is length 0 return
                var input = arr[j];
                if (input.length == 0)
                    continue; //continue when no vals

                if (typeof input === 'string') { //error message
                    var error = input.split('$$'),
                        jobname;
                    try {
                        jobName = error[1].substring(0, error[1].lastIndexOf("."));
                    } catch (e) {
                        console.log(e)
                        continue;
                    }

                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (jobName.contains(this.state.currentJobs[i][1])) {
                            this.state.fullRefresh = 5;
                            jobsCompleted += this.state.currentJobs.splice(i, 1);
                            console.log(jobName + " has been removed from the queue (load error)");
                            // for testing only
                            $('#flashes').trigger('flash', jobName + " has been removed from the queue")
                        }
                        else {
                            $('#flashes').trigger('flash', jobName + " was not found in the queue Error[1]")
                        }
                    } // in case we want to make them stay in the queue until they're been x'ed out. (window.localStorage)
                }

                else if (input.length == 3) {
                    console.log('currentJobs -= ' + input);
                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (input[0] == this.state.currentJobs[i][0]) {
                            jobsCompleted += this.state.currentJobs.splice(i, 1);
                            this.selectedIDs.splice(i, 1);
                            this.state.fullRefresh = 5;
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
                        if (input[0] == this.state.currentJobs[i][0]) {
                            inArr = true;
                            newJobs.push(this.state.currentJobs.splice(i, 1, input));
                        }
                    }
                    if (!inArr)
                        this.state.currentJobs.push(input)
                }
            }
            if (newJobs.length && !this.state.isDisplayed) {
                this._toggleDisplay();
            }
            this.refresh();
            // window.localStorage.setItem('this.state.currentJobs', JSON.stringify(this.state.currentJobs));
            console.log(this.state.currentJobs)
            console.log(jobsCompleted)
            console.log('updated jobs: ' + newJobs)
        },

        //XhrRequest Entry point. This is called upon completion of the last poll (async)
        _xhrLoop: function () {
            var pollquery = this.state.pollType + "?shapes=" + this.state.selectedIDs.join("$$");
            if (this.state.isPolling) {
                this.request = this._createXhrRequest(pollquery);
                console.log('firing pollFunction: ' + pollquery);
                console.log('polling? ' + this.state.isPolling)
                console.log('displayed? ' + this.state.isDisplayed)

                $(window).on("beforeunload", function (event) {// abort the call on page unload
                    if (this.request && this.request.readyState !== XMLHttpRequest.DONE)
                        this.request.abort();
                });
                this.request.send();
            }
            else {
                return false;
            }
        },

        //xhrpolling body method, created the request and handlers
        _createXhrRequest: function (pollquery) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/update/' + pollquery, true);// rework poll functino to be a parameter with ids for both voxels and shapes
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == 200) {
                    console.log('polling done')
                    var progress;
                    try {
                        progress = JSON.parse(xhr.response);

                        this.updateJobs(progress.progress);
                    } catch (e) {
                        console.log('XHR ERROR: ' + e.toString());
                    }
                    if (this.state.isPolling) {
                        setTimeout(this._xhrLoop(), 100);
                                                
                    }
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
            return xhr;
        },

        publicMethod: function (id) {
            console.log('This is a Public Method')
        },

        _defaultState: function () {
            return {
                currentJobs: [],
                isPolling: false,
                pollType: "shapes",
                selectedIDs: [],
                timeouts: 3,
                isDisplayed: false,
                uploadId: null,
                fullRefresh: 5,
                pageReload: false // shows if there is a page reload pending 9ie, a new objecti s loaded and completed). Can be turned off?
            }
        }
    });


}


var test = function () {
    if (!$('.progress-tracker').length) {// only launch if a user is signed in
        return
    }
    progressWidget();
    var trackerBody = $('<div class="progress-tracker-body" />')
        .insertAfter('.progress-tracker')
        .progressWidget();
}
test();

function clearHTML() { // helper method that returns cleared inner html section
    var progressList = document.getElementById('progressList');
    if (progressList && progressList.hasChildNodes()) {
        progressList.innesrHTML = '';
    }
    return progressList
}


function closeItem(e) {
    var menuItem = $(e.target).closest('.menu-item');
    var id = menuItem.attr('id')

    if (id === null) {
        console.log('UPLOAD WIDGET Error: False destroychild id' + id)
        return false;

    }
    this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
    var delJob = this.state.currentJobs.filter((item) => {
        if (item[0] == id) {
            return item;
        }
    });
    this.state.currentJobs.splice(this.state.currentJobs.indexOf(delJob), 1)
    this.refresh();
    e.preventDefault();

}

function noJobs() {// return div with default message for no currnet jobs
    return `
    <div id="no-jobs" class="menu-item" style="">
    <div> There are no current jobs </div>
    </div>`
}

function createProgressBar(id, jobName, numerator, denominator) { //cleare a single progress bar DOM Element
    console.log(jobName, numerator, denominator)
    jobname = escapeHTML(jobName);
    var percentage = ((numerator / denominator) * 100).toFixed(2).toString();
    var innerString = jobName + ": " + numerator + "/" + denominator;
    console.log(percentage)
    var html = `
    <div id="${id}" class="menu-item" style="">
        <div class="container">
        <span class="tooltiper" data-tooltip="${innerString}"> ${jobName}</span>
        <span class="progress-label" style=""> ${percentage}% </span>
        <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
            aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
    html += percentage + `%\">
        </div>
        <i id="${id}" class="fa fa-times close-btn" aria-hidden="true"></i>            
        </div>
    </div>
    
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

function toolTiper(effect) {
    $('.tooltiper').each(function (i, j) {
        console.log('i: ' + i)
        console.log('j: ' + j)
        var toolTip = $(this);
        var eLcontent = toolTip.attr('data-tooltip'),
            eDir = toolTip.attr('data-dir'),
            eLtop = toolTip.position().top,
            eLleft = toolTip.position().left;
        $(this).append('<span class="tooltip">' + eLcontent + '</span>');
        var eLtw = $(this).find('.tooltip').width(),
            eLth = $(this).find('.tooltip').height();
        //modify here with parameter for different directoins

        if (i === 0) {
            $(this).find('.tooltip').css({
                "top": '0px',
                "left": '-100px',
                "z-index": '100'
            });
            $(this).find('.tooltip').addClass('no-after');
        }
        else if (i === 1) {
            $(this).find('.tooltip').css({
                "top": '0px',
                "left": '-10px',
                "z-index": '100'
            });
            $(this).find('.tooltip').addClass('no-after');

        }
        else {
            $(this).find('.tooltip').css({
                "top": (0 - eLth - 20) + 'px',
                "left": '-20px'
            });
        }
    });
}

// var html = `
// <div id="menu-itemid${id}" class="menu-item" style="">
//     <div class="tooltip progress-label"> ${innerString}
//         <span class="tooltiptext"> ${innerString} </span> </div>
//     <span class="progress-label" style=""> ${innerString} </span>
//     <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
//         aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
// html += percentage + `%\"></div>
// <button id=close-btn${id} type="button" class="close-btn" aria-label="Close">
// <span aria-hidden="true">&times;</span>
// </button></div>
// `;
// return html
// }