///////////////////////////////////////////
// The main entry point of progressWidget.
///////////////////////////////////////////
$(document).ready(() => {
    if (!$('.progress-tracker').length) {// only launch if a user is signed in
        return
    }
    progressWidgetInit();
    var trackerBody = $('<div class="progress-tracker-body" />')
        .insertAfter('.progress-tracker')
        .progressWidget();
});

////////////////////////////////////////////
// The widget.
////////////////////////////////////////////
function progressWidgetInit(){
    $.widget("custom.progressWidget", {
        /**
        * Widget constructor.
        * @constructor
        */
        _create: function(){
            this._loadVariables();
            this._checkUrl();
            // We access the code below if and only if we don't have anything new to query.
            this._createWidgetMenu();
            this._display();
            // This is the main loop: we query the controller, update the data structures accordingly, and then
            // update the widget to that effect.
            setInterval(function(){
                this._queryController();
            }.bind(this), 1000);
        },

        /**
        * Called after we've created the widget and binded actions. This will display if isDisplayed is
        * true.
        */
        _display: function(){
            if (this.state.isDisplayed)
                this.$el.show();
            else
                this.$el.hide();
        },

        /**
        * Called from _create; loads the local variables, and, if savedState is defined, that, too.
        */
        _loadVariables: function(){
            // Loads the elements into more convenient names.
            this.element;
            this.$el = $(this.element);
            this.$anchor = $('.progress-tracker')
            this.$flashhandler = $('#flashes');
            // Other stuff to keep track of.
            this.jobsAdded = false; // If true, we only access _updateWidgetMenu. If false, we'll have to access _createWidgetMenu to update.
            this.flashes = []; // The array of flashes.
            this.reset = false; // Do we reset upon refresh?
            // Stuff pertaining to this.state.queryIds.
            this.request = null; // The current XMLHTTPRequest, when querying for job progress.
            this.progress = []; // This gets populated upon querying the controller for job progress. Of course, the
                                // hard part is comparing this to the current jobs (this.state.jobs)
            // Loads the saved state.
            var savedState = window.localStorage.getItem('progressWidget');
            if (savedState && savedState !== 'undefined')
                this.state = JSON.parse(savedState);
            else
                this.state = this._defaultState();
        },

        /**
        * This processes the URL to see if any new uploads have occurred; if so, this is added to queryIds, and then we save our
        * state to localStorage in preparation for a refresh.
        */
        _checkUrl: function(){
            // Are we uploading layers? /layers/<user_id>/<file_id>
            // Are we uploading voxels? /voxels/<user_id>/<hash_voxel_id>$$<...data_layer_id's> (joined by double dollars)
            // What if we're not uploading anything? (layers) /layers/<user_id> OR (voxels) /voxels/<user_id>
            var urlString = window.location.pathname;
            var isLayerUrl = contains(urlString, '/layers'),
                isVoxelUrl = contains(urlString, '/voxels'),
                urlHasUploads = (urlString.match(/\/\d+(?!\.)\/\d+(?!\.)/) != null); // This matches two numbers with no decimal points.
            if ((isLayerUrl || isVoxelUrl) && urlHasUploads) {
                try {
                    // We now split, and parse the URL. It differs if we have layers vs. voxels.
                    var temp = urlString.split('/');
                    var uploadInfo = temp[temp.length - 1];
                    if (isLayerUrl){
                        // Add layerInfo to the set of shapes to query.
                        var layerInfo = parseInt(uploadInfo);
                        this.state.queryIds.shapes.push(layerInfo);
                    }
                    else {
                        // Slightly more complicated. Add {hash: {<id's>}} to the voxels to query.
                        var voxelInfo = uploadInfo.split("$$");
                        var hash = voxelInfo[0],
                            dataLayerIds = voxelInfo.slice(1);
                        this.state.queryIds.voxels[hash] = dataLayerIds;
                    }
                    // Save the state to localStorage; refresh the page.
                    window.localStorage.setItem('progressWidget', JSON.stringify(this.state));
                    window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                }
                catch (e) {
                    console.log('PROGRESSWIDGET ERROR: error adding ID, url: ' + urlString)
                    console.log(this.uploadId)
                }
            }
        },

        /**
        * Creates the base widget menu, when we're free to (after any ID's have been uploaded).
        */
        _createWidgetMenu: function(){
            var $progressWidget = this.element,
                widgetCaption = "This tracks all current jobs in the worker queue. hover over the job names to see how many shapes/voxels have been processed.",
                refreshCaption = "Click here to reset the Progress Tracker.",
                htmlBuilder = '';

            htmlBuilder += `<div id="widget-menu">
                <span class="tooltiper caption-left" data-tooltip="${widgetCaption}"><i class="fa fa-question" style="top:'0px!important'"/></span>
                <span class="tooltiper caption-right" data-tooltip="${refreshCaption}"><i class="fa fa-refresh refresh-widget" style="top:'0px!important'"/></span>
                <ul id="jobList"></ul>
            </div>`;
            this.state.jobs;
            widgetMenu = $.parseHTML(htmlBuilder);
            widgetMenu = $(widgetMenu);
            widgetMenu.text = widgetCaption;
            // Adds the job display to the widgetMenu, if there are any.
            if (this.state.jobs.length > 0) {
                this.state.jobs.slice().reverse().forEach(job => {
                    htmlBuilder = createProgressBar(...job);
                    var temp = $.parseHTML(htmlBuilder);
                    widgetMenu.find('#jobList').append(temp);
                });
            }
            else {
                widgetMenu.find('#jobList').append($.parseHTML(noJobs()));
            }
            // Now we remove the existing widget, and replace it with the widget we've just created.
            if ($('#widget-menu').length)
                $('#widget-menu').remove();

            this.$widgetMenu = widgetMenu;
            this.$el.append(this.$widgetMenu);
            // toolTiper, do your magic!
            toolTiper();
            // Bind UI Actions.
            this._bindUIActions();
        },

        /**
        * Creates a flash.
        */
        _createFlash: function (input) {
            this.$anchor.trigger('pflash', ["\t Progress Tracker: ", input]);
        },

        /**
        * Binds UI actions to the widget.
        */
        _bindUIActions: function(){
            // Event handler for closing out a job.
            if (this.$widgetMenu.children().length) {
                $('.close-btn').on('click', this._closeItem.bind(this));
            }
            // Event handler for resetting the widget, upon refresh.
            this._on($('.refresh-widget'), {
                click: '_toggleReset'
            })
            // Event handler for displaying the widget.
            this._on(this.$anchor, {
                click: '_toggleDisplay'
            });
            // Event listener for unloading a page.
            window.addEventListener('beforeunload', this._destroy.bind(this), false);
            // Event handler for whenever _createFlash is called.
            this._on(this.$anchor, {
                'pflash': function (e) {
                    e.preventDefault();
                    if (!e.handled){
                        e.handled = true;
                        var event = arguments[1],
                            message = arguments[2];

                        var flash = $('<div class="pflash alert alert-info alert-dismissible"> <strong>' + event + '</strong>' + message + '</div>');

                        flash.on('click', function () {
                            $(this).fadeOut(1000, function() {
                                $(this).remove();
                            });
                        });
                        var t = setTimeout(function () {
                            $(flash).fadeOut(1000, function () {
                                $(this).remove();
                            });
                            this.flashes.shift();
                        }.bind(this).bind(flash), 5000); // This is the flashTimeout.
                        this.flashes.push(t);
                        $('.navbar-fixed-top').append(flash);
                    }
                }
            });
        },

        /**
        * Helper method for _bindUIActions.
        * When we unload a page, this function is called. The state is saved and all components are removed.
        */
        _destroy: function () {
            // Save the state to localStorage if this.reset is False, and vice versa.
            if(!this.reset)
                window.localStorage.setItem('progressWidget', JSON.stringify(this.state));
            else
                window.localStorage.removeItem('progressWidget');
            // Hide the widget.
            if (this.state.isDisplayed)
                this.$el.hide();
            // Remove the widget menu.
            if (this.$widgetMenu) {
                this.$widgetMenu.remove();
            }
            // Clear timeouts for any flashes.
            if (this.flashes.length) {
                this.flashes.forEach(item => {
                    clearTimeout(item);
                });
            }
            // Remove all children of this.$el.
            if (this.$el && this.$el.children().length)
                this.$el.children().remove();
        },

        /**
        * Helper method for _bindUIActions.
        * When the "Progress Tracker" button is clicked, the display is toggled.
        * TODO (minor): Add poll query timing features. For now, we update every second or so, no matter the toggle.
        */
        _toggleDisplay: function(e) {
            e.preventDefault();
            if (!e.handled){
                e.handled = true;
                this.state.isDisplayed = !this.state.isDisplayed;
                if (this.state.isDisplayed)
                    this.$el.slideDown(200);
                else
                    this.$el.slideUp(200);
            }
        },

        /**
        * Helper method for _bindUIActions.
        * When the refresh button is clicked, this function is called.
        */
        _toggleReset: function(e) {
            e.preventDefault();
            if (!e.handled){
                e.handled = true;
                this.reset = !this.reset;
                messages = ["State will no longer reset on page refresh.", "State will reset on page refresh. To cancel, click the refresh button again."];
                this._createFlash(messages[+this.reset]);
                return;
            }
        },

        /**
        * Helper method for _bindUIActions.
        * When an "x" button is clicked, a job is closed out.
        */
        _closeItem: function(e) {
            e.preventDefault();
            if (!e.handled){
                e.handled = true;
                // Physically remove the item from the UI.
                var menuItem = $(e.target).closest('.menu-item');
                var id = menuItem.attr('id');
                menuItem.remove();
                // Some error message
                if (id === null) {
                    console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                    this._createFlash('Error destroying child, reset local storage or contact developers if this persists.')
                    return false;
                }
                // Manage the arrays.
                for (var i = 0; i < this.state.jobs.length; i++) {
                    if (this.state.jobs[i][0] == id){
                        // Remove the job from this.state.queryIds.
                        this._removeFromQueryIds(this.state.jobs[i]);
                        // Remove the job from this.state.jobs.
                        this.state.jobs.splice(i, 1);
                    }
                }
                this._createWidgetMenu();
            }
        },

        /**
        * Queries the controller for the specified voxels and IDs.
        */
        _queryController: function(){
            // This assembles all of the queries from queryIds to a string:
            // [id1$$id2$$...][hash1$numIds1$$hash2$numIds2$$...]
            var arrOfQueries = this.state.queryIds.shapes.slice(0);
            $.each(this.state.queryIds.voxels, function(hash, dataLayerIds){
                arrOfQueries.push(hash + '$' + dataLayerIds.length);
            });
            var queryParam = "shapes?shapes=" + arrOfQueries.join('$$');
            // Now, we ask AJAX about this URL.
            this.request = this._createXhrRequest(queryParam);
            $(window).on("beforeunload", function (event) { // Abort the call on page unload.
                if (this.request && this.request.readyState !== XMLHttpRequest.DONE)
                    this.request.abort();
            });
            this.request.send();
        },

        /**
        * Creates a request. (see app/controller/updateController.js)
        */
        _createXhrRequest: function (pollquery) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/update/' + pollquery, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == 200) {
                    var progress = JSON.parse(xhr.response);
                    this.progress = progress.progress;
                    // We now update the arrays and the widget menu.
                    if (this.progress && this.progress != "undefined") {
                        this._updateArrays();
                        if (!this.jobsAdded){
                            this._createWidgetMenu();
                            this.jobsAdded = true;
                        }
                        else {
                            this._updateWidgetMenu();
                        }
                    }
                }
            }.bind(this);
            xhr.responsetype = "json";
            return xhr;
        },

        /**
        * Given the results from _queryController, we update the arrays.
        */
        _updateArrays: function(){
            // First, update this.state.jobs with info from this.progress.
            // If there's a job in this.progress that's not in this.state.jobs, add it. There should be at most 1.
            this.progress; // Reminder: this shows an array of 6-length arrays: [id, jobName, num, den, pollType, completed]
            for (var i in this.progress){
                var job = this.progress[i];
                var newJob = true;
                for (var j in this.state.jobs){
                    var candJob = this.state.jobs[j];
                    // Does the job ID match the job ID that we're considering?
                    if (job[0] == candJob[0]){
                        // If so, then update the numerator and denominator.
                        candJob[2] = job[2];
                        candJob[3] = job[3];
                        newJob = false;
                    }
                }
                // If not for anything in this.state.jobs, add it.
                if (newJob){
                    this.state.jobs.push(job);
                }
            }
            // Next, check the jobs list to see if anything has completed. If so, remove the job ID from
            // this.state.queryIds, and create a flash.
            for (var i in this.state.jobs){
                var job = this.state.jobs[i];
                if (job[2] >= job[3] && !job[5]){
                    job[5] = true;
                    this._createFlash(job[1] + " has completed!");
                    this._removeFromQueryIds(job);
                }
            }
        },

        /**
        * Given a job (6-length array etc.), the job is removed from this.state.queryIds.
        */
        _removeFromQueryIds: function(job){
            if (job[4] == "voxels"){ // JSON vs Set. Lol.
                delete this.state.queryIds.voxels[job[0]];
            }
            if (job[4] == "shapes"){
                var index = this.state.queryIds.shapes.indexOf(job[0]);
                this.state.queryIds.shapes.splice(index, 1);
            }
        },

        /**
        * Updates the widget menu based on what happened to the arrays.
        */
        _updateWidgetMenu: function(){
            this.state.jobs.forEach(job => {
                var [id, jobName, numerator, denominator, type, completed] = job,
                    percentage = ((numerator / denominator) * 100).toFixed(2).toString(),
                    innerString = jobName + ": " + numerator + "/" + denominator,
                    frac = numerator + "/" + denominator,
                    menuItem = $('#' + id),
                    datatool = menuItem.find('.tooltiper').attr('data-tooltip', frac)
                menuItem.find('.progress-label').text(percentage + "%");
                menuItem.find('.progress-bar').css('width', percentage + "%");
            });
        },

        /**
        * Loads the default state.
        */
        _defaultState: function(){
            return {
                isDisplayed: false, // Default: don't display.
                queryIds: {
                    shapes: [], // An array of ID's.
                    voxels: {},  // A JSON, mapping a voxel's hash property to an array of its corresponding data layer IDs.
                },
                jobs: [] // Each element of the array is of the form: [id, jobName, numerator, denominator, type (voxel or shape), completed (boolean)]
            };
        },
    });
}

///////////////////////////////////////////
// The rest are helper methods.
///////////////////////////////////////////
function contains(listable, match){
    return listable.indexOf(match) != -1;
}

function clearHTML() { // helper method that returns cleared inner html section
    var progressList = document.getElementById('progressList');
    if (progressList && progressList.hasChildNodes()) {
        progressList.innerHTML = '';
    }
    return progressList
}

function noJobs() {// return div with default message for no currnet jobs
    return `<div id="no-jobs" class="menu-item" style="">
    <div> There are no current jobs </div>
    </div>`
}

function createProgressBar(id, jobName, numerator, denominator, type) { //clear a single progress bar DOM Element
    jobname = escapeHTML(jobName);
    var percentage = ((numerator / denominator) * 100).toFixed(2).toString(),
        innerString = jobName + ": " + numerator + "/" + denominator,
        // If complete, just say "Job Complete"
        frac = (numerator == denominator) ? "Job Complete" : (numerator + "/" + denominator + " processed");
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
