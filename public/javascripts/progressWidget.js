//todo
// rename it progress tracker
// refactor widget elements to cached eles
// add refresh handlers on instantiation, update jobs, and user clicks
// build Widget CSS
// augment upload controller to send a resposne id to the widget

// pop up when the page is loaded
// once every ele is done processing respring page
// remove eles from the queueu once they have uploaded



//stopping point, trying to figure out removing wigets
//you added an event handler for the close button thing
//also make sure that tool tips are working or ask about it

// save sate on destroy



//this fucntion is supposed to take int he upload id, may refactor to a res param.

(function() {
    if(!$('.progress-tracker').length) {// only launch if a user is signed in
        return
    }
    else {


    // isPolling
    // pollType
    // currentJobs
    // selectedIDs
    // $el
    // flashHandler

    $.widget("custom.progressWidget", {
        

        options: {},
        
        //constructor
        _create: function () {
            console.log('this is a test')
            // load saved state 
            debugger

            this.trackerBody = $('.progress-tracker-body');
            this.$el = this.element;
            this.$el.after(this.trackerBody)
            
            this.trackerBody.appendTo('.progress-tracker');

            console.log('test passing')
            this.$flashhandler = $('#flashes');
            
            var savedState = localStorage.getItem('progressWidget');

            //if localstorage, initialize the widget with old state, else make new widget
            if (savedState) {
                this.state = JSON.parse(savedState);
                if(this.options.value && this.state.selectedIDs.indexOf(this.options.value) == -1){
                    this.state.selectedIDs.shift(this.options.value);
                }
            }
            else {
                this.state = this._defaultState();
            }

            var urlString  = window.location.pathname;
            if(urlString.indexOf('/layers') != -1) {
                var newId = parseInt(urlString.split('/')[-1])
                console.log(urlString)
                console.log(newId)
            }
            this._createWidgetMenu();//initialize child views            
            this._bindUIActions();
            //connect componenents
            // document.window.widget = this;// may not be neccessary as plugins are initialized on a component
        },



        //created childviews, called on change event
        _createWidgetMenu: function () {
            var $progressWidget = this.element,
                opts = this.options,
                widgetCaption = "this is a caption",
                htmlBuilder = '';

            htmlBuilder += `<div class="widgetmenu"">
                <span id="widgetcaption">${widgetCaption}</span>
                    <ul id="jobList"></ul>
                    </div>   
            `
            widgetMenu = $.parseHTML(htmlBuilder);
            widgetMenu = $(widgetMenu);
            this.state.currentJobs.forEach(job => {
                htmlBuilder = createProgressBar(...job);
                var temp = $.parseHTML(htmlBuilder);
                // temp.find('[data-toggle="tooltip"]').tooltip();
                widgetMenu.find('#jobList').append(temp);
                // widgetMenu += '\t';
                // widgetMenu += createProgressBar(...job);
                // widgetMenu += '\n';
            })
            $(function() {
                $('.js-tooltip').toolTip();
            });
            // '\n';
            // widgetMenu += '\t</div>\n';
            // widgetMenu += '</div">';



            this.$widgetMenu = widgetMenu;
            this.$el.after(this.$widgetMenu);

            if(this.$widgetMenu.children('.close-btn').length) {
                this._on(this.$widgetMenu.children('.close-btn'), 
                'click', (e) => {
                var id = this.$el.attr('id');
                    
                if(id === null){
                    console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                    return false;
    
                }
                this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
                var delJob = this.state.currentJobs.filter((item) => {
                    if(item[0] == id) {
                        return item;
                    }
                });
                //may neeed deljob[0]
                this.state.currentJobs.splice(this.state.currentJobs.indexOf(delJob), 1)
                this._trigger('change');

                e.preventDefault();
                // this.$el.parent().remove(); not sure if this will acutally work, may have to find selector by id
            })
            }

        },


        _bindUIActions: function () {
            this._on(this.$el, {
                click: '_toggleDisplay'
            })

            

            // this._on(this.$widgetMenu.children('close-btn'), 
            // {
            //     click: '_removeChild(this.id)'
            // });
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

        //removes a child from the selectedId list and the currentJob List
        _removeChild: function(id){
            if(id === null){
                console.log('UPLOAD WIDGET Error: False destroychild id' + id)
                return false;

            }
            this.state.selectedIDs.splice(this.state.selectedIDs.indexOf(id), 1);
            _.pluck()
            var delJob = this.state.currentJobs.filter((item) => {
                if(item[0] == id) {
                    return item;
                }
            });
            //may neeed deljob[0]
            this.state.currentJobs.splice(this.state.currentJobs.indexOf(delJob), 1)
            this._trigger('change');
        },
        
        //unload widget: save state and remove all components.
        _onDestroy: function () {
            localStorage.setItem('progressWidget', this.state);
            this.$widgetMenu.hide();
            this.$widgetMenu.remove();
            this.$el.remove();//????
            // this.$
        },

        //toggles display and polling controls
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

        //refresh state, should be triggered on init, user input (deletion), update jobs,=
        _refresh: function() {
            this._createWidgetMenu();
            this.this._trigger("change");
        },

        // update state.currentJobs
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

        //XhrRequest Entry point. This is called upon completion of the last poll (async)
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

        //xhrpolling body method, created the request and handlers
        _createXhrRequest: function (pollquery) {
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
        },

        publicMethod: function(id){
            console.log('This is a Public Method')
        },

        _defaultState: function () {
            return {
                currentJobs: [[1, 'jobname', 100, 1000]],
                isPolling: false,
                pollType: "shape",//TODO Change back to shape
                selectedIDs: [1],
                timeouts: 3
            }
        }

        // _cacheElements: function() {
        //     var $flashhandler = this.$flashhandler,
        //         $widgetMenu = cdthis.$widgetMenu,
        //         $delJobBtn = this.$widgetMenu.find('close-btn'),
        //         $lis = this.$el.children,
        //         $pollingBtn = this.$el.find('fa-pulse upload-tracker')
                
        //         this.cached = {
        //             //add all cached Jquery eles here
        //         }
                
        // }
    });
}


})


(function() {
    var trackerBody = $('<div class="progress-tracker-body" />')
        .appendTo('.progress-tracker')
        .progressWidget()
})

// (function($) {
//     var toolTip = {
//         init: function() {
//             this.each(function() {
//                 var $that = $(this);
//                 // our boolean object to check if it already exists on the page
//                 var $toolSpan = $('<div class="tooltip"><span class="tooltip_arrow"></span></div>');
//                 var preloadImages = function() {
//                     var tempImage = new Image();
//                     tempImage.src = 'http://i.imgur.com/K5ynr.png';
//                     tempImage = null;
//                 };
//                 preloadImages();
//                 $that.mouseover(function() {
//                     var $altText = $that.attr('alt');
//                     var $parentWidth = $that.outerWidth(true);
//                     var $pos = $that.offset();
//                     var $tip = $toolSpan.clone(true);

//                     $that.parent().after($tip);
//                     $tip.prepend($altText);
//                     $that.parent().next($tip).css({
//                         top: $pos.top - 30,
//                         left: $pos.left + ($that.width() /2) - ($tip.outerWidth(true)/2)
//                     }).fadeIn(100);
//                     $(".tooltip_arrow", $that.parent().next()).css({
//                         left: ($tip.outerWidth(true) / 2)
//                     }).fadeIn(100);
//                 }).mouseout(function() {
//                     $that.parent().next().fadeOut(100).remove();
//                 });
//             });
//         } /* end init */
//     };
//     $.fn.toolTip = toolTip.init;
// })(jQuery);

    


//deprecated, nay need to rework this so that it can launch from the upload controller but I don't think iw will be necessary
// function initialize() {//
//     var savedState = localStorage.getItem('progressWidget');
//     if (savedState) {
//         widget = JSON.parse(json);
//         widget.$el = $('.progressWidget'); // reinitialize the jquery tab
//         widget.flashHandler = $('#flashes');

//         window.progressWidget = widget;

//     } else {
//         widget = new progressWidget();
//         window.progressWidget = widget;
//     }
// }




//for testing
    // var p = ProgressWidget();
    // (function() {
    //     if(!$('progress-tracker').length) {
    //         return
    //     }
    //     else {

    //     }
    // })
    // console.log(ProgressWidget(1));
    // console.log($("upload-tracker").after(p))

    // // This is how instantiate a widget. 
    // var progress = $( "<div></div>" )
    //     .appendTo( "body" )
    //     .progressWidget({ value: 10000 });

    // progress.progressWidget('publicMethod', id);

    // $.custom.progressWidget( {value: 10000}, $("upload-tracker").after(p));






// not sure if theese funcitons need to be within the widget or if ti matters that they are/ aren't. what do you reccomnet @carlos?    
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
    <div id="${id}" class="menu-item" style="">
        <div class="js-tooltip" alt="${innerString}"> ${jobName}</div>
        <span class="progress-label" style=""> ${percentage}% </span>
        <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40"
            aria-valuemin="3" aria-valuemax="100" style="min-width: 1%; width:`;
    html += percentage + `%\"></div>
    <button id="${id}" type="button" class="close-btn" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button></div>"
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