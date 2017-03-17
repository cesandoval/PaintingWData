/*@author Wenzhe Peng | pwz@mit.edu | 2016*/



window.my_func = require("../modules/my_func");
window.intro_index = 0;//the current background serie for the intro page
window.page_index = 0;//the current page for the intro page
window.pageNum = 6;//page number for each intro page
window.total_intro = 2;//
window.scroll_steps = 200;
window.index_chosen = 0;
window.initsection = "";


function MyUI(params) {
    window.func = new window.my_func({
    });
}

MyUI.prototype = {
    myinit:function(){
        window.mytest = this;

        queue()
            .defer(d3.json, 'src/param/publications.json')
            .defer(d3.json, 'src/param/projects.json')
            .defer(d3.json, 'src/param/courses.json')
            .defer(d3.json, 'src/param/members.json')
            .defer(d3.json, 'src/param/news.json')
            .await(window.mytest.initcontrol);
    },

    test:function(error,publications,projects,courses,members,news){
        console.log(error,publications,projects,courses,members,news);

    },
    initcontrol: function (error,publications,projects,courses,members,news) {


        console.log(publications,projects,courses,members,news);
        $(document).ready(function () {

            window.mytest.switchDisplay();

            window.initsection = window.location.href.split("#")[1];

            if(window.initsection){
                event.preventDefault();

                console.log(window.initsection);
                $('html, body').stop().animate({
                    scrollTop: $("#"+window.initsection).offset().top - 80
                }, {
                        duration: 100,
                        complete: function() {
                        }
                    });
            }

        });


        window.mytest.publication_viz(publications);
        window.mytest.loadProjectLst(projects);
        window.mytest.loadCourseLst(courses);
        window.mytest.loadTeamLst(members);
        window.mytest.loadNewsLst(news);

        window.setInterval(function(){
            /// call your function here
            window.index_chosen++;

            if (window.index_chosen > window.pageNum - 1){
                window.index_chosen = 0;
            }

            func.updateIntroProj();

        }, 7000);

        $("#scroll_indicator").click(function(event){
            var perc = (event.pageY-$(this).offset().top)/$(this).height(); 
            window.index_chosen = Math.round(perc * (window.pageNum-1));
            func.updateIntroProj();

        })

        $("#move_right").click(function () {
            window.intro_index += 1;
            window.index_chosen = 0;

            if (window.intro_index > window.total_intro - 1) {
                window.intro_index = 0;
            }

            func.updateIntroProj();
        });

        $("#move_left").click(function () {
            window.intro_index -= 1;
            window.index_chosen = 0;

            if (window.intro_index < 0) {
                window.intro_index = window.total_intro - 1;
            }

            func.updateIntroProj();
        });

        $(".menu_btn").click(function(){
            $(".btn_wrapper").toggleClass("tohide");
        });

        $(".mybtn").click(function(){
            d3.select(".btn_wrapper").classed("tohide",true);

        });


        $(".expand_proj").click(function () {

            $(".expanded_proj .holder").empty();
            d3.select(".expanded_proj .holder").append("iframe")
                .attr("src", d3.select(this).attr("mylink"))
                .attr("id", "iframe_proj");
            
            

            $("#iframe_proj").load(function () {
                $(".expanded_proj").css("opacity", 1);
                $(".expanded_proj").css("height", 0);

                window.mytest.fixiframe('#iframe_proj');

                func.expand_function("iframe_proj", $(".expanded_proj"));

            });

            $('html, body').stop().animate({
                scrollTop: $(".expanded_proj").offset().top - 80
            }, 1000);

        });

        $(".expanded_proj .close_expanded").click(function () {
            $(".expanded_proj .holder").empty();
            $(".expanded_proj").css("height", 0);
            $(".expanded_proj").css("opacity", 0);
        });

        $(".expand_course").click(function () {
            $(".expanded_course").css("opacity", 1);
            $(".expanded_course").css("height", 0);
            $(".expanded_course .holder").empty();
            d3.select(".expanded_course .holder").append("iframe")
                .attr("src", d3.select(this).attr("mylink"))
                .attr("id", "iframe_course");

            $("#iframe_course").load(function () {
                $(".expanded_course").css("opacity", 1);
                window.mytest.fixiframe('#iframe_course');

                func.expand_function("iframe_course", $(".expanded_course"));
            });

            $('html, body').stop().animate({
                scrollTop: $(".expanded_course").offset().top - 80
            }, 1000);

        });

        

        $(".expanded_course .close_expanded").click(function () {
            $(".expanded_course .holder").empty();
            $(".expanded_course").css("height", 0);
            $(".expanded_course").css("opacity", 0);

        });

        $(".pop_team").click(function () {
            //console.log($(this).attr("bio1"));

            d3.select("body").append("div")
                .attr("class", "pop_team_box_back").style("top", $(document).scrollTop() + "px")
                ;

            var thisholder = d3.select("body").append("div")
                .attr("class", "pop_team_box").style("top", $(document).scrollTop() + window.innerHeight * 0.2 + "px");

            thisholder
                .append("img").attr("src", "img/thex.png").attr("class", "close_expanded");

            var left_panel = thisholder.append("div").attr("class","col-sm-5 box_column");
            var right_panel = thisholder.append("div").attr("class","col-sm-7 box_column left_mark");

            left_panel.append("img").attr("class","member_box_img").attr("src",$(this).attr("img_url"));
            left_panel.append("p").attr("class","member_box_title").text($(this).attr("name"));
            left_panel.append("p").attr("class","member_box_email").text($(this).attr("email"));

            var r1_1_0 = left_panel.append("div").attr("class", "icon_links_box");

            if ($(this).attr("home_url")) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + $(this).attr("home_url") + '" target="_blank"><img src="img/homepage.png" class="icon_link_img mybtn"></a>');
            }

            else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/homepage.png" class="icon_link_img mybtn">');
            }

            if ($(this).attr("twitter_url")) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + $(this).attr("twitter_url") + '" target="_blank"><img src="img/twitter.png" class="icon_link_img mybtn"></a>');
            }
            else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/twitter.png" class="icon_link_img mybtn">');
            }

            if ($(this).attr("linkedin_url")) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + $(this).attr("linkedin_url") + '" target="_blank"><img src="img/linkedin.png" class="icon_link_img mybtn"></a>');
            } else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/linkedin.png" class="icon_link_img mybtn">');
            }

            if ($(this).attr("github_url")) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + $(this).attr("github_url") + '" target="_blank"><img src="img/github.png" class="icon_link_img mybtn"></a>');
            } else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/github.png" class="icon_link_img mybtn">');
            }

            right_panel.append("p").attr("class","member_box_bio").text($(this).attr("bio1"));
            if($(this).attr("bio2")){
                right_panel.append("p").attr("class","member_box_bio").text($(this).attr("bio2"));
            }
            if($(this).attr("bio3")){
                right_panel.append("p").attr("class","member_box_bio").text($(this).attr("bio3"));
            }

            $(".pop_team_box .close_expanded").click(function () {
                d3.selectAll(".pop_team_box").remove();
                d3.selectAll(".pop_team_box_back").remove();
            });

            $(".pop_team_box_back").click(function () {
                d3.selectAll(".pop_team_box").remove();
                d3.selectAll(".pop_team_box_back").remove();
            });
            
        });

        $(".news_item").click(function (e) {

            if($(e.target).attr("class").indexOf("close_expanded")==-1){
                d3.selectAll(".news_item").select(".insider").classed("tohide",false);
                d3.selectAll(".news_item").select(".news_content").remove();
                d3.selectAll(".news_item").select(".close_expanded").remove();

                var mythis = d3.select(this);
                mythis.select(".insider").classed("tohide",true);
                mythis.append("img").attr("src","img/thex.png").attr("class","close_expanded");

                mythis.append("div").attr("class","news_content");

                $(".news_content").empty();

                console.log(mythis.attr("pageurl"));


                d3.select(".news_content").append("iframe")
                    .attr("src", mythis.attr("pageurl"))
                    .attr("id", "iframe_news");

                $("#iframe_news").load(function () {

                    window.mytest.fixiframe('#iframe_news');

                    func.expand_function("iframe_news", $(".news_content"));
                });


                $('html, body').stop().animate({
                    scrollTop: $(".news_content").offset().top - 80
                }, 1000);

            }

            $(".news_item .close_expanded").click(function(){
                mythis.select(".insider").classed("tohide",false);
                mythis.select(".news_content").remove();
                d3.select(this).remove();
            });


        })

        d3.selectAll(".tm_wrapper .icon_over").on("mouseover", function () {
            d3.select(this).style("opacity", 0.6);
        }).on("mouseout", function () {
            d3.select(this).style("opacity", 0);
        });

        d3.selectAll(".project_icon").on("mouseover", function () {
            d3.select(this).select(".project_over").style("opacity", 1);
        }).on("mouseout", function () {
            d3.select(this).select(".project_over").style("opacity", 0);
        });

        $(document).scroll(function () {

            d3.select(".pop_team_box").remove();
            d3.select(".pop_team_box_back").remove();

            $('.header').css({
                "position": $(this).scrollTop() > window.innerHeight - 1 ? "fixed" : "relative",
                "top": 0,
                "z-index": 10,
                "background-color": $(this).scrollTop() > window.innerHeight - 1 ? "black" : "white",
                //"border-bottom": $(this).scrollTop() > window.innerHeight-1 ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(0,0,0,0.5)"
            });

            $(".header_placeholder").css({
                "position": "relative",
                "height": $(this).scrollTop() > window.innerHeight - 1 ? "80px" : "0px",
            });

            $('.header_content_buttons ul').css({
                "color": $(this).scrollTop() > window.innerHeight - 1 ? "white" : "black",
            });

            $('.cddl_logo').attr({
                "src": $(this).scrollTop() > window.innerHeight - 1 ? "img/cddl_logo_rev.png" : "img/cddl_logo.png",
            });
            $('.menu_btn').attr({
                "src": $(this).scrollTop() > window.innerHeight - 1 ? "img/menu_inv.png" : "img/menu.png",
            });
            $('.btn_wrapper').css({
                "background-color": $(this).scrollTop() > window.innerHeight - 1 ? "black" : "white",
            });




            $("#projects").css({
                "background-color": window.mytest.getColor(($("#projects").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $("#courses").css({
                "background-color": window.mytest.getColor(($("#courses").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $("#team").css({
                "background-color": window.mytest.getColor(($("#team").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $("#publications").css({
                "background-color": window.mytest.getColor(($("#publications").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $(".timeline_node").css({
                "border": "4px solid " + window.mytest.getColor(($("#publications").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $("#news").css({
                "background-color": window.mytest.getColor(($("#news").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });
            $("#hiring").css({
                "background-color": window.mytest.getColor(($("#hiring").offset().top - $(this).scrollTop() - 80) / window.innerHeight)
            });

        });


        $(".middle").css("height", window.innerHeight);
        $(".project_icon").css("height", $(".project_icon").css("width").split("p")[0] * 0.66 + "px");
        $(".left_link").css("width", window.innerWidth * 0.12);
        $(".right_link").css("width", window.innerWidth * 0.12);

        $(window).resize(function () {
            $(".middle").css("height", window.innerHeight);
            $(".project_icon").css("height", $(".project_icon").css("width").split("p")[0] * 0.66 + "px");
            $(".left_link").css("width", window.innerWidth * 0.12);
            $(".right_link").css("width", window.innerWidth * 0.12);
            window.mytest.switchDisplay();

        });

        d3.selectAll(".header_content_buttons ul")
            .on("mouseover", function () {
                d3.select(this).select("hr").style("border-bottom", "1px solid rgb(128,128,128)")
                    .style("width", "100%");
            }).on("mouseout", function () {
                d3.select(this).select("hr").style("border-bottom", "1px solid rgb(128,128,128)")
                    .style("width", "0%");
            });

        $('a[href^="#"]').on('click', function (event) {

            //$('body').removeClass('stop-scrolling');
            //window.page_index = 300;

            var target = $(this.getAttribute('href'));
            if (target.length) {
                event.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 80
                }, {
                        duration: 1000,
                        complete: function() {
                            //window.location.href = window.location.href.split("#")[0]+"#"+target.attr("id");
                        }
                    });
            }
        });
    },

    getColor: function (ratio) {
        if (ratio < 0)
            ratio = 0;
        if (ratio > 1)
            ratio = 1;
        var value = 255 - ratio * 255;
        value = parseInt(value);
        return "rgb(" + value + "," + value + "," + value + ")";
    },

    publication_viz: function (data) {
        var data_yeared = func.group_by_year(data);

        var publication_panel = d3.select(".publication_details");

        for (k in data_yeared) {

            var yearly_viz = publication_panel.insert("div",":first-child")
                .attr("class", "section_content row magin_bottom")
                .attr("id", "publication_viz");
            yearly_viz.append("div")
                .attr("class", "timeline row")
                .append("div")
                .attr("class", "flag")
                .text(k);

            yearly_viz.append("div")
                .attr("class", "verticle_tl_left");
            yearly_viz.append("div")
                .attr("class", "verticle_tl_right");

            data_yeared[k].forEach(function (dd, i) {

                var thistitle = yearly_viz.append("div")
                    .attr("class", "timeline row");

                var color_flag = "";
                if (i % 2 == 0) {
                    var timelinecontent = thistitle.append("div")
                        .attr("class", "timeline_content to_left " + color_flag);
                } else {
                    var timelinecontent = thistitle.append("div")
                        .attr("class", "timeline_content to_right " + color_flag);
                }

                timelinecontent.append("p").text(dd.title).attr("class", "titled");
                timelinecontent.append("p").text("").style("opacity", "0").style("height", "0").attr("class", "addition")
                    .html("<span>By:</span> " + dd.authors);
                timelinecontent.append("p").text("").style("opacity", "0").style("height", "0").attr("class", "addition")
                    .html("<span>In:</span> " + dd.where);
                timelinecontent.append("p").text("").style("opacity", "0").style("height", "0").attr("class", "addition")
                    .html("<span>Type:</span> " + dd.type);

                timelinecontent.on("mouseover", function () {

                    timelinecontent.selectAll(".addition")
                        .style("display", "block")
                        .transition()
                        .style("height", function () {
                            var height0 = d3.select(this).style("height");
                            var myheight = d3.select(this).style("height", "auto").style("height");

                            if (height0 != myheight)
                                d3.select(this).style("height", "0");

                            return (+myheight.split("px")[0]) + "px";
                        })
                        .style("opacity", "1")
                        .duration(300);

                    timelinecontent.select(".titled").classed("title_str", true);

                }).on("mouseout", function () {
                    timelinecontent.selectAll(".addition")
                        .transition()
                        .style("height", "0px")
                        .style("opacity", "0")
                        //.style("display", "none")
                        .duration(300);

                    timelinecontent.select(".titled").classed("title_str", false);

                });

                var thisnode = thistitle.append("div")
                    .attr("class", "timeline_node");

                if (i % 2 == 0) {
                    thisnode.append("div").attr("class", "left_link");
                } else {
                    thisnode.append("div").attr("class", "right_link");
                }
            })
        }
    },

    loadProjectLst: function (data) {
        var contentholder = d3.select("#project_cont");

        data.forEach(function (d) {

            var h1 = contentholder.append("div").attr("class", "col-sm-3 project_icon");
            var h2 = h1.append("div").attr("class", "project_over");
            h2.append("img").attr("src", "img/plus.png").attr("class", "icon_plus expand_proj mybtn").attr("mylink", d.pageurl);
            h2.append("p").attr("class", "project_title").text(d.title);
            h1.append("img").attr("src", d.iconurl).attr("class", "proj_icon")
        });
    },

    loadCourseLst: function (data) {
        var contentholder = d3.select("#course_cont");

        data.forEach(function (d) {

            var h1 = contentholder.append("div").attr("class", "col-sm-3 project_icon");
            var h2 = h1.append("div").attr("class", "project_over");
            h2.append("img").attr("src", "img/plus.png").attr("class", "icon_plus expand_course mybtn").attr("mylink", d.pageurl);
            h2.append("p").attr("class", "project_title").text(d.title);
            h1.append("img").attr("src", d.iconurl).attr("class", "proj_icon")
        });
    },

    loadTeamLst: function (data) {
        var contentholder = d3.select(".member_cont");

        data.forEach(function (d) {
            var r0 = contentholder.append("div").attr("class", "col-sm-3 tm_wrapper");

            var r1_0 = r0.append("div").attr("class", "team_icon");
            r1_0.append("img").attr("src", d.img_url);

            var r1_1 = r0.append("div").attr("class", "icon_over");
            r1_1.append("img").attr("src", "img/plus.png").attr("class", "icon_plus mybtn pop_team")
                .attr("name", d.name)
                .attr("bio1", d.bio1)
                .attr("bio2", d.bio2)
                .attr("bio3", d.bio3)
                .attr("img_url", d.img_url)
                .attr("home_url", d.home_url)
                .attr("twitter_url", d.twitter_url)
                .attr("github_url", d.github_url)
                .attr("linkedin_url", d.linkedin_url)
                .attr("email",d.email);
            var r1_1_0 = r1_1.append("div").attr("class", "icon_links");

            if (d.home_url.length) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + d.home_url + '" target="_blank"><img src="img/homepage.png" class="icon_link_img mybtn"></a>');
            }
            else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/homepage.png" class="icon_link_img mybtn">');
            }

            if (d.twitter_url.length) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + d.twitter_url + '" target="_blank"><img src="img/twitter.png" class="icon_link_img mybtn"></a>');
            }
            else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/twitter.png" class="icon_link_img mybtn">');
            }

            if (d.linkedin_url.length) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + d.linkedin_url + '" target="_blank"><img src="img/linkedin.png" class="icon_link_img mybtn"></a>');
            } else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/linkedin.png" class="icon_link_img mybtn">');
            }

            if (d.github_url.length) {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<a href="' + d.github_url + '" target="_blank"><img src="img/github.png" class="icon_link_img mybtn"></a>');
            } else {
                r1_1_0.append("div")
                    .attr("class", "icon_25")
                    .attr("style", "padding:0px;")
                    .html('<img src="img/github.png" class="icon_link_img mybtn">');
            }



            r0.append("p").attr("class", "member_name").text(d.name);
            r0.append("p").attr("class", "member_role").text(d.role);

        });
    },

    loadNewsLst: function (data) {
        var contentholder = d3.select(".news_section");



        data.forEach(function(d){
            var news_item = contentholder.append("div").attr("class","news_item").attr("pageurl",d.pageurl);
            var insider_news = news_item.append("div").attr("class","insider");
            var imgwrapper = insider_news.append("div").attr("class","col-sm-3 new_imgwrapper");
            imgwrapper.append("img").attr("class","news_img").attr("src",d.iconurl);

            var right_section = insider_news.append("div").attr("class","col-sm-9 section_left");
            right_section.append("div").attr("class","news_title").text(d.title);
            right_section.append("div").attr("class","news_indication").text("read more...");
            right_section.append("div").attr("class","news_time").text(d.time);



        })


    },

    fixiframe: function(myid){
        $(myid).contents().find("head")
            .append($("<style type='text/css'>  *{background-color:rgba(0,0,0,0)!important; overflow:hidden;}  .content_left{width:65%;float:left;} .content_right{width:33%;float:left;} .content_right_full{width:100%;float:right;}</style>"));
        $(myid).contents().find("a")
            .attr("target","_blank")
            .attr("href", function(d,dd){
                console.log(d,dd);
                if(dd){
                    var out = dd;
                    if(out.indexOf("?q=")>-1)
                        out = dd.split("?q=")[1];
                    if(out.indexOf("&sa=D&ust=")>-1)
                    out = out.split("&sa=D&ust=")[0];
                    return out;
                }
            })
            ;
        $(myid).contents().find("img")
            .css("width","100%").css("height","auto");
        $(myid).contents().find("span")
            .css("width","100%").css("height","auto");
        $(myid).contents().find("body")
            .css("padding","0 0 0 0");



        $(myid).contents().find("span")
            .filter(function(){
                return this.innerHTML.indexOf("&lt;iframe")!=-1;
            }).html(function(){
                return this.innerHTML.replace("&lt;","<").replace("&gt;",">");
            });
        $(myid).contents().find("td")
            .filter(function(){
                if($(this).attr("colspan") == "1" && $(this).attr("rowspan") == "1"){
                    var widththis = +d3.select(this).style("width").split("px")[0];
                    //console.log($(document).width(),widththis);

                    if($(document).width()<500){
                        if(this.innerHTML.indexOf("Overview")!=-1){
                            $(this).replaceWith( "<div class = 'content_right_full left_proj'>"+$(this).html()+"</div>"
                            );
                        }else{
                            $(this).replaceWith( "<div class = 'content_right_full right_proj'>"+$(this).html()+"</div>"
                            );
                        }

                    }else{
                        if(this.innerHTML.indexOf("Overview")!=-1){
                            $(this).replaceWith( "<div class = 'content_left'>"+$(this).html()+"</div>"
                            );
                        }else{
                            $(this).replaceWith( "<div class = 'content_right'>"+$(this).html()+"</div>"
                            );
                        }
                    }

                    return true;
                }
            });
            
            $(myid).contents().find("div")
            .filter(function(){
                //console.log($(this).attr("class"));
                if($(this).attr("class"))
                return $(this).attr("class").indexOf("left_proj")>-1;
            }).insertAfter(
                $(myid).contents().find("div")
                .filter(function(){
                    if($(this).attr("class"))
                    return $(this).attr("class").indexOf("right_proj")>-1;
                })
            )

    },

    switchDisplay: function(){
        if($(document).width()<500){//is mobile
            $(".desktop_display").addClass("tohide");
            $(".mobile_display").removeClass("tohide");
        }else{
            $(".desktop_display").removeClass("tohide");
            $(".mobile_display").addClass("tohide");
        }
    }
}