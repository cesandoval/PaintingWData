/** 
 * a progress tracker widget that keeps track of a users reecent uploads
 * 
 * @param options.value - DEPRECATED. was initially used to load ids one at a time for testing.
 * 
 *   \\ COPY LOGIC
 * if you are changing the length of the default state to be a different size than it is currently, destrcuturing assignment in the _create method
 * should prevent errors. Note that it does NOT save all values. users will have their state set to default except for fields you explicity copy over so
 * if you chagne defualt state make sure to check over the copy logic.
 * 
 * This widget is designed to work for shapes with getLastIds from the updateController. See app/controllers/updateController.js
 *      to add voxels, add another endpoint to updateController
 * 
 * state variables -
 *              *currentJobs:   - an array of the jobs currently being queried, updated, adn displayed in the widget body.(json responses parsed by updateJobs)
                pollType:       - a toggle for the xhrRequest. a posssible hook for adding voxels to this progress widget
                *selectedIDs:   - an array of the ids currently being queried. added as a parameter to the xhr get request
                timeouts:       - DEPRECATED initaially toggled poslling state from active to rest 
                                the widget was active when open, and the rest state was a slower background refresh
                *isDisplayed:   - keeps track of the widgets viewState
                fullRefresh:    - when fullRefresh == 5, the widget menu body (job tiles, icons and tooltips) are completely removed and replaced
                *completedJobs: - an array of recentyl completed jobs. These jobs are also displayed in the widget body
 *
 *              * - indicates core logic that is compied over. see // COPY LOGIC
 *  
*/
function progressWidgetInit() {

    $.widget("custom.progressWidget", {
        options: {
            value: 0
        },

        _create: function () {
            // localVariables, not saved in state
            this.element;
            this.$el = $(this.element);
            this.$anchor = $('.progress-tracker')
            this.$flashhandler = $('#flashes');
            this.recentlyDeleted = []; // holds recently deleted jobs, used to keep selectedIds state from regressing
            this.inLoop = false; // informs calls if the widget is in the xhrLoop fucntion seuqence
            this.pollTimeout = null;
            this.flashes = [];
            this.flashTimeout = 5000;
            this.pageReload = false;
            this.uploadId = null;
            this.ajaxInProgress = true;
            this.reset = false;

            //load saved state
            var stateString = window.localStorage.getItem('progressWidget');

            //if window.localStorage, initialize the widget with old state, else make new widget
            if (stateString && stateString !== 'undefined') {
                this.state = JSON.parse(stateString);
                savedState = JSON.parse(stateString);
                // to prevent mutability errors we parse twice. DO NOT REVERSE ORDER

                if (this.options.value && this.state.selectedIDs.indexOf(this.options.value) == -1) {// you can insert raw values in to the query list with the console
                    this.state.selectedIDs.shift(this.options.value);
                }

                var temp = this._defaultState();// compare loaded state to default (look for chagnes)

                if (this.state.length != temp.length) {
                    this.state = ({ ...this.state } = { ...temp }); // destructuring assignment

                    // COPY LOGIC (see class javadoc)
                    this.state.completedJobs = savedState.completedJobs;
                    this.state.currentJobs = savedState.currentJobs;
                    this.state.selectedIDs = savedState.selectedIDs;
                    this.state.isDisplayed = savedState.isDisplayed;
                }
            }
            else {
                this.state = this._defaultState();
            }
            this.state.fullRefresh = 5; // so that thte state is fully refreshed on creation
            //check if a new layer has just been uploaded
            var urlString = window.location.pathname;
            if (urlString.indexOf('/layers') != -1) {
                if (urlString.match(/\/\d+(?!\.)\/\d+(?!\.)/) != null) { // match two numbers with no decimal points
                    try {
                        var temp = urlString.split('/');
                        this.uploadId = parseInt(temp[temp.length - 1]);
                        if (typeof this.uploadId === 'number')
                            this.state.selectedIDs.unshift(this.uploadId);
                    }
                    catch (e) {
                        console.log('PROGRESSWIDGET ERROR: error adding ID, url: ' + urlString)
                        console.log(this.uploadId)
                    }
                }
            }

            // if a new layer has just been uploaded, poll it and display it
            if (this.uploadId != null) {
                this.uploadId = null;
                this.pageReload = true;
            }

            this.refresh();
            this._bindUIActions();

            if (this.state.isDisplayed) {
                this.state.pollingState = 1;
                this.$el.show()
            }
            else {
                this.state.pollingState = 0;
                this.$el.hide();
            }
            this._xhrLoop();
        },


        _createFlash: function (input) {
            this.$anchor.trigger('pflash', ["\t Progress Tracker: ", input]);
        },

        //creates childviews for the widget menu, called on change event.
        _createWidgetMenu: function () {
            if (this.state.fullRefresh != 5 && this.state.pollingState != 0 && !this.pageReload) {
                this._partialRefresh();
                return
            }
            var $progressWidget = this.element,
                opts = this.options,
                widgetCaption = "This tracks all current shape jobs in the worker queue. hover over the job names to see how many shapes have been processed.",
                refreshCaption = "Click here to reset the Progress Tracker.",
                htmlBuilder = '';


            htmlBuilder += `<div id="widget-menu">
                <span class="tooltiper caption-left" data-tooltip="${widgetCaption}"><i class="fa fa-question" style="top:'0px!important'"/></span> 
                <span class="tooltiper caption-right" data-tooltip="${refreshCaption}"><i class="fa fa-refresh refresh-widget" style="top:'0px!important'"/></span> 
                <ul id="jobList"></ul>
            </div>   
            `
            this.state.currentJobs;
            widgetMenu = $.parseHTML(htmlBuilder);
            widgetMenu = $(widgetMenu);
            widgetMenu.text = widgetCaption;

            if (this.state.currentJobs.length || this.state.completedJobs.length) {
                if (this.state.currentJobs.length) {
                    this.state.currentJobs.forEach(job => {
                        htmlBuilder = createProgressBar(...job);
                        var temp = $.parseHTML(htmlBuilder);
                        widgetMenu.find('#jobList').append(temp);
                    })
                }
                if (this.state.completedJobs.length) {
                    this.state.completedJobs.forEach(job => {
                        var id = job[0], name = job[1];
                        htmlBuilder = createCompleteBar(id, name);
                        var temp = $.parseHTML(htmlBuilder);
                        widgetMenu.find('#jobList').append(temp);
                    })
                }
            }

            else {
                widgetMenu.find('#jobList').append($.parseHTML(noJobs()));
            }

            if ($('#widget-menu').length) {
                $('#widget-menu').remove();
            }

            this.$widgetMenu = widgetMenu;
            this.$el.append(this.$widgetMenu);

            // menu event handlers
            if (this.$widgetMenu.children().length) {
                $('.close-btn').on('click', this._closeItem.bind(this));
            }

            this._on($('.refresh-widget'), {
                click: '_toggleReset'
            })

            this.state.fullRefresh = 0;
            toolTiper();
        },

        /**
         * only updates current css values instead of replacing the entire job div and tooltip.
         * prevents tooltips from being replaced at thte polling rate, rendering them unusable.
         */
        _partialRefresh: function () {
            this.state.currentJobs.forEach(job => {
                var [id, jobName, numerator, denominator] = job,
                    percentage = ((numerator / denominator) * 100).toFixed(2).toString(),
                    innerString = jobName + ": " + numerator + "/" + denominator,
                    frac = numerator + "/" + denominator,
                    menuItem = $('#' + id),
                    datatool = menuItem.find('.tooltiper').attr('data-tooltip', frac)
                menuItem.find('.progress-label').text(percentage + '%');
                menuItem.find('.progress-bar').css('width', percentage + '%');
            });
        },

        /**
         * searches the current menu in dom for the job clicked on
         * removes the corresponding job id from the selected id list, currentJobs, and completedJobs
         */
        _closeItem: function (e) {// for removing menu items from clicks
            var menuItem = $(e.target).closest('.menu-item');
            var id = menuItem.attr('id')
            menuItem.remove();

            if (id === null) {
                console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                this._createFlash('Error destroying child, reset local storage or contact developers if this persists.')
                return false;
            }
            var inCurrentJobs = true;

            if (this.state.selectedIDs.indexOf(id) === -1) {
                inCurrentJobs = false;
            }

            if (inCurrentJobs) { // if its in the current jobs list
                var delId = this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
                this.recentlyDeleted.push(delId);
                // update removal for async calls
                var delJob = this.state.currentJobs.filter((item) => {
                    if (item[0] == id) {
                        return item;
                    }
                });
                var removed = this.state.currentJobs.splice(this.state.currentJobs.indexOf(delJob), 1);
            }
            else { // if its in the completed job list
                this.recentlyDeleted.push(id);
                // update removal for async calls
                var delJob = this.state.completedJobs.filter((item) => {
                    if (item[0] == id) {
                        return item;
                    }
                });
                var removed = this.state.completedJobs.splice(this.state.currentJobs.indexOf(delJob), 1);
            }
            // console.log(removed)
            this.refresh();
            e.preventDefault();
        },

        /**
         * adds events
         *      beforeunload - toggle widget _destroy: saves state unless reset button is pressed
         *      pflash - custom flash handler. flashes bootstrap alerts to the bottom of the nav bar
         *           removable on click
         *           this.flashTimeout defines period before flashes fade out automatically.
         */
        _bindUIActions: function () {
            this._on(this.$anchor, {
                click: '_toggleDisplay'
            })

            window.addEventListener('beforeunload', this._destroy.bind(this), false);

            this._on(this.$anchor, {
                'pflash': function () {
                    // var eventData = arguments[1];
                    var event = arguments[1],
                        message = arguments[2];

                    var flash = $('<div class="pflash alert alert-info alert-dismissible"> <strong>' + event + '</strong>' + message + '</div>');

                    flash.on('click', function () {
                        $(this).fadeOut(1000, function () {
                            $(this).remove();
                        });
                    });
                    var t = setTimeout(function () {
                        $(flash).fadeOut(1000, function () {
                            $(this).remove();
                        });
                        this.flashes.shift();
                    }.bind(this).bind(flash), this.flashTimeout);
                    this.flashes.push(t);
                    $('.navbar-fixed-top').append(flash);
                }
            }
            );


        },

        /**
         * unload widget: save state and remove all components.
         */ 
        _destroy: function () {
            var test = JSON.stringify(this.state);
            if (!this.reset) {
                window.localStorage.setItem('progressWidget', JSON.stringify(this.state));
            }
            else {
                window.localStorage.removeItem('progressWidget');
            }
            var temp = window.localStorage.getItem('progressWidget'); // sets changes 


            if (this.state.isDisplayed)
                this.$el.hide();

            if (this.$widgetMenu) 
                this.$widgetMenu.remove();
            
            if (this.flashes.length) {
                this.flashes.forEach(item => {
                    clearTimeout(item);
                })
            }
            if (this.$el && this.$el.children().length)
                this.$el.children().remove();
        },

        /** 
         * toggles the state reset of the progress tracker on page refresh.
         * this.reset
        */
        _toggleReset: function (e) {
            console.log(this.state);
            if (e)
                e.preventDefault();

            this.reset = !this.reset;

            if (this.reset) {
                this._createFlash("State will reset on page refresh. To cancel, click the refresh button again");
            }
            else {
                this._createFlash("State will no longer reset on page refresh.");

            }
            return
        },

        //toggles display and polling controls
        _toggleDisplay: function (e) {
            if (e)
                e.preventDefault();

            if (this.state.isDisplayed) {
                this.state.pollingState = 0;// set polling var to false                
                this.$el.slideUp(200);
                this.state.isDisplayed = !this.state.isDisplayed;

            } else {
                this.$el.slideDown(200);
                this.state.isDisplayed = !this.state.isDisplayed;

                if (this.state.selectedIDs.length !== 0) {
                    if (!this.ajaxInProgress) {
                        this.ajaxInProgress = true;
                        this._xhrLoop();
                    } else if (!this.inLoop && this.request === null) {
                        clearTimeout(this.pollTimeout)
                        this._xhrLoop();
                    }
                    this.state.pollingState = 1;
                }
                this.state.timeouts = 5;
            }
        },

        //refresh state, should be triggered on init, user input (deletion), update jobs
        refresh: function () {
            // console.log('refreshed')
            this._createWidgetMenu();

            if (this.state.currentJobs.length === 0 && !this.pageReload) {
                this.pollingState = 0;
                this.state.selectedIDs = [];
            }
            else {
                var temp = this.state.currentJobs.map(function (obj) {
                    if (this.recentlyDeleted.indexOf(obj[0]) === -1)
                        return obj[0];
                }.bind(this));
                if (temp.length)
                    this.state.selectedIDs.concat(temp);

                temp = new Set(this.state.selectedIDs);
                this.state.selectedIDs = Array.from(temp);
            }
            if (this.state.selectedIDs.length === 0) {
                this.state.pollingState = 0;
            } else if (this.state.selectedIDs.length !== 0 && this.state.isDisplayed) {
                this.state.pollingState = 1;
            }

            if (!this.request && !this.inLoop && !this.pageReload)
                this._xhrLoop();

        },

        /**
         * update state variables:
         *       currentJobs
         *       completedJobs
         *       selectedIds
         * 
         * updates recentlyDeleted Field
         * creates flash events
         * 
         * inputs should be of the form...
         *  [id, jobname, progress, denominator] if the job is in progress or waiting (null null when the job has been deleted after completion)
            [id, jobname, bool] bool == true if the job is done, false if the output is invalid
            [id$$jobname$$Errormessage]
            [~/~ Error message here]
         */
        _updateJobs: function (arr) {
            var newJobs = [];
            var delId, index, complete;


            if (!arr)
                return false; // don't update arr

            for (var j = 0; j < arr.length; j++) { // can be length 1 if it is length 0 return
                var input = arr[j];
                if (input.length == 0)
                    continue; //continue when no vals

                if (input.length === 1) { //error message
                    input = input[0]; // unwrap string

                    if (input.match(/\~\/\~/) != null) {
                        input = input.substr(input.indexOf('~/~') + 4, input.length)
                        this._createFlash(input);
                        continue;
                    }

                    var error = input.split('$$'),
                        jobname;
                    try {
                        jobName = error[1].substring(error[1].lastIndexOf("/") + 1, error[1].length);
                    } catch (e) {
                        console.log(e)
                        continue;
                    }


                    for (var i = 0; i < this.state.currentJobs.length; i++) {

                        if (jobName.indexOf(this.state.currentJobs[i][1]) != -1) {
                            this.state.fullRefresh = 5;
                            complete = this.state.currentJobs.splice(i, 1); complete = complete[0];
                            this.state.completedJobs.push(complete);
                            index = this.state.selectedIDs.indexOf(complete[0])
                            delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                            this.recentlyDeleted.push(delId);
                            // console.log(jobName + " has been removed from the queue (load error)");

                            this._createFlash(jobName + " has been removed from the queue");
                            break;
                        }
                        else if (i == this.state.currentJobs.length - 1) {
                            this._createFlash(jobName + " was not found in the queue. Error on processing initialization")
                        }
                    } // in case we want to make them stay in the queue until they're been x'ed out. (window.localStorage)
                }

                else if (input.length == 3) {
                    // console.log('currentJobs -= ' + input);
                    var inArrs = false;
                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (input[0] == this.state.currentJobs[i][0]) {

                            complete = this.state.currentJobs.splice(i, 1); complete = complete[0];
                            this.state.completedJobs.push(complete);
                            index = this.state.selectedIDs.indexOf(complete[0])
                            delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                            this.recentlyDeleted.push(delId);
                            this.state.fullRefresh = 5;

                            if (input[2] === true) {
                                // console.log(input[1] + " has been removed from the queue (success)");

                                var hasCompleted = false;
                                this.state.completedJobs.map(job => {
                                    if (job[0] === complete[0]) {
                                        hasCompleted = true;
                                    }
                                });

                                if (!hasCompleted)
                                    this.state.completedJobs.push(complete);

                                this._createFlash(input[1] + " has completed!");
                            }

                            else {
                                // console.log(input[1] + " has been removed from the queue (data error)");
                                // for testing only
                                this._createFlash(input[1] + " has been removed from the Tracker - Data format was invalid!");
                            }
                            inArrs = true;
                            break;

                        }

                        if (!inArrs && i === this.state.currentJobs.length - 1) {
                            index = this.state.selectedIDs.indexOf(input[0])
                            delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                            this.state.completedJobs.push(input);
                            inArrs = true;
                            this._createFlash(input[1] + " has completed!");

                        }
                    }
                    if (!inArrs && this.state.currentJobs.length === 0) { // for loop doesn't fire if its tempty
                        index = this.state.selectedIDs.indexOf(input[0])
                        delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                        this.recentlyDeleted.push(delId);
                        this.state.completedJobs.push(input);
                        this._createFlash(input[1] + " has completed!");

                    }
                }

                else if (input.length == 4) { // add new jobs to the end of the list
                    var inArr = false;
                    for (var i = 0; i < this.state.currentJobs.length; i++) {
                        if (input[0] == this.state.currentJobs[i][0]) {
                            if (input[2] === input[3]) {
                                complete = this.state.currentJobs.splice(i, 1); complete = complete[0];
                                this.state.completedJobs.push(complete);
                                index = this.state.selectedIDs.indexOf(complete[0]);
                                delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                                this.recentlyDeleted.push(delId);
                                this.state.fullRefresh = 5;
                                inArr = true;
                                this._createFlash(input[1] + " has completed!");
                                break;
                            }

                            inArr = true;
                            newJobs.push(this.state.currentJobs.splice(i, 1, input));
                            break;
                        }
                    }
                    if (!inArr) {
                        if (input[2] === input[3]) {
                            this.state.completedJobs.push(input);
                            index = this.state.selectedIDs.indexOf(input[0]);
                            delId = this.state.selectedIDs.splice(index, 1); // stop querying this job
                            this.recentlyDeleted.push(delId);
                            this._createFlash(input[1] + " has completed!");
                        } else {
                            this.state.currentJobs.push(input);
                        }


                        this.state.fullRefresh = 5;
                    }
                }
            }

            // remove duplicates
            if (this.state.completedJobs.length) {
                var temp = new Set(this.state.completedJobs.map(i => {
                    return i[0];
                }));

                this.state.completedJobs = this.state.completedJobs.filter(job => {
                    if (temp.has(job[0])) {
                        temp.delete(job[0]);
                        return job;
                    }
                });
            }

            this.refresh();
            // console.log(this.state.currentJobs)
            // console.log('completed jobs: ' + this.state.completedJobs)
            // console.log('updated jobs: ' + newJobs)
        },

        /**
         * XhrRequest Entry point. This is called upon completion of the last poll (async)
         * 
         * @field inLoop - prevents calls to xhrLoop from being duplicated
         */
        _xhrLoop: function () {
            this.inLoop = true;
            var queryIds = this.recentlyDeleted.length === 0 ? this.state.selectedIDs.filter(function (id) {
                if (this.recentlyDeleted.length && this.recentlyDeleted.indexOf(id) === -1) {
                    return id;
                }
                else if (!this.recentlyDeleted.length)
                    return id;
            }.bind(this)) : this.state.selectedIDs;

            queryIds = new Set(queryIds);// remove duplicates
            queryIds = Array.from(queryIds);

            var pollquery = this.state.pollType + "?shapes=" + queryIds.join("$$");
            if (this.ajaxInProgress && !this.request) {
                this.request = this._createXhrRequest(pollquery);
                // console.log('firing pollFunction: ' + pollquery);
                // console.log('polling? ' + this.ajaxInProgress)
                // console.log('displayed? ' + this.state.isDisplayed)

                $(window).on("beforeunload", function (event) {// abort the call on page unload
                    if (this.request && this.request.readyState !== XMLHttpRequest.DONE)
                        this.request.abort();
                    this.ajaxInProgress = false;
                });

                this.request.send();
                this.inLoop = false;
            }
            else if (this.ajaxInProgress && this.request) {
                return;
            }
            else {
                if (this.request)
                    this.request.abort();

                var timeout = 5000;
                this.refresh();
                // this.pollTimeout = setTimeout(function () { this._xhrLoop() }.bind(this), timeout);
            }
        },

        /**
         * xhrpolling body method, created the request and handlers
         * 
         * timeout logic is deprecated
        */
        _createXhrRequest: function (pollquery) {
            var timeout = this.state.pollingState === 0 ? 5000 : 100;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/update/' + pollquery, true);// rework poll functino to be a parameter with ids for both voxels and shapes
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status == 200) {
                        // console.log('polling done')
                        var progress;
                        try {
                            progress = JSON.parse(xhr.response);
                            // console.log(progress.toString());
                            this._updateJobs(progress.progress);

                            if (this.pageReload) {
                                setTimeout(function () {
                                    this.request.abort();
                                    window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                                }.bind(this), 1000);
                                return;
                            }
                        } catch (e) {
                            progress = JSON.parse(xhr.response);
                            this._updateJobs(progress.progress);
                            if (e.name !== "SyntaxError") {
                                console.log('Server Error: Reponse cannot be parsed.' + e.toString());
                                this._createFlash('Server Error - if this persists please contact the developers')
                            }
                        }
                    }
                    if (this.ajaxInProgress) {
                        var timeout = this.state.pollingState === 0 ? 5000 : 100;
                        this.pollTimeout = setTimeout(function () { this.request = null; this._xhrLoop(); }.bind(this), timeout + 200);
                    }
                }
            }.bind(this);
            // xhr.timeout = timeout + 200;
            xhr.responsetype = "json"
            // xhr.ontimeout = function () {
            //     if(this.state.timeouts > 0)
            //          this.state.timeouts -= 1;

            //     if (this.state.timeouts == 0) {
            //         this.pollingState = 0;
            //     }
            //     var timeout = this.state.pollingState === 0 ? 5000 : 100;

            //     if (!this.inLoop && this.request === null)
            //     {
            //         this.pollTimeout = setTimeout(function () { this._xhrLoop() }.bind(this), timeout +200);

            //     }
            // }.bind(this);
            return xhr;
        },

        /**
         * DO NOT MODIFY THIS FUNCTION BEFORE READING COPY LOGIC
         * see the class javadoc for more info.
         */
        _defaultState: function () {
            return {
                currentJobs: [],
                pollType: "shapes",
                selectedIDs: [],
                timeouts: 5,
                isDisplayed: false,
                fullRefresh: 5,
                completedJobs: []
            }
        }
    });
}

/**
 * @constructor loads in the progressWidget on page load
 */
$(document).ready(() => {
    if (!$('.progress-tracker').length) {// only launch if a user is signed in
        return
    }
    progressWidgetInit();
    var trackerBody = $('<div class="progress-tracker-body" />')
        .insertAfter('.progress-tracker')
        .progressWidget();
});


function noJobs() {// return div with default message for no current jobs
    return `<div id="no-jobs" class="menu-item" style="">
    <div> There are no current jobs </div>
    </div>`
}

//clear a single progress bar DOM Element
function createCompleteBar(id, jobName) { 
    // console.log(jobName, numerator, denominator)
    var numerator = 100, denominator = 100;
    jobname = escapeHTML(jobName);
    var percentage = "100/100",
        innerString = jobName + ": 100/100",
        frac = "Job Complete";
    // console.log(percentage)
    var html = `
    <div id="${id}" class="menu-item" style="">
        <div class="container">
        <span class="tooltiper" data-tooltip="${frac}"> ${jobName}</span>
        <span class="progress-label" style=""> ${percentage} </span>
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

//clear a single progress bar DOM Element
function createProgressBar(id, jobName, numerator, denominator) { 
    // console.log(jobName, numerator, denominator)
    jobname = escapeHTML(jobName);
    var percentage = ((numerator / denominator) * 100).toFixed(2).toString(),
        innerString = jobName + ": " + numerator + "/" + denominator,
        frac = numerator + "/" + denominator + " processed";
    // console.log(percentage)
    var html = `
    <div id="${id}" class="menu-item" style="">
        <div class="container">
        <span class="tooltiper" data-tooltip="${frac}"> ${jobName}</span>
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

// make sure strings are XXS Safe
function escapeHTML(unsafe_str) { 
    return unsafe_str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#39;')
        .replace(/\//g, '&#x2F;')
}

// tooltip logic from https://codepen.io/LawrenceScafuri/pen/mRrYqM
function toolTiper(effect) {
    $('.tooltiper').each(function (i, j) {
        // console.log('i: ' + i)
        // console.log('j: ' + j)
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
                "left": '-110px',
                "z-index": '100'
            });
            $(this).find('.tooltip').addClass('no-after');
        }
        else if (i === 1) {
            $(this).find('.tooltip').css({
                "top": '0px',
                "left": '190px',
                "z-index": '10000'
            });
            $(this).find('.tooltip').addClass('no-after');
        }
        else if (i === 2) {
            $(this).find('.tooltip').css({
                "top": '10px',
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
