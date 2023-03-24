$( document ).ready(function() {

    console.log( "ready!" );

    function showDetails(data2, active_elem) {
        //console.log(data2);

        var i = $(active_elem).attr("idx");

        var table = $("#details");
        table.empty();
        $("#details-head").empty();
        $(".active").removeClass("active");

        $(active_elem).addClass("active")
        
        //console.log(i);

        // fill details
        $("#details-head").append("<tr><th colspan='4'>"+data2[i]["title"]+"</th></tr>")
        if (data2[i]["persons"].length > 0) {
            table.append("<tr><td>Author:</td><td colspan='3'>"+data2[i]["author"]+"</td></tr>")
        }
        else {
            table.append("<tr><td>Author:</td><td colspan='3'></td></tr>")
        }
        if (data2[i]["publishing_info"].length > 0) {
            table.append("<tr><td></td><td>Year:</td><td>Place:</td><td>Printer/Publisher:</td></tr>")

            for (var j = 1; j < data2[i]["publishing_info"].length + 1; ++j) {
                var pubinfo = data2[i]["publishing_info"][j-1];
                table.append("<tr><td>Publication "+j+":</td><td>"+pubinfo["date"]+"</td><td>"+pubinfo["place"]+"</td><td>"+pubinfo["publisher"]+"</td></tr>")
            }
        }
        else {
            table.append("<tr><td>Date of Printing:</td><td></td></tr>")
            table.append("<tr><td>Place of Printing:</td><td></td></tr>")
            table.append("<tr><td>Printer:</td><td></td></tr>")
        };
        table.append("<tr><td>Full Text:</td><td colspan='3'>"+data2[i]["text"]+"</td></tr>")
        // add image
        source = "https://www.e-manuscripta.ch/bau/i3f/v20/"+data2[i]["image_id"]+"/"+data2[i]["image_coord"]+"/full/0/default.jpg"
        table.append("<tr><td colspan='4'><img src="+source+" class='img-fluid'></img></td></tr>")

        // fill related hits
        var table = $("#related");
        table.empty();
        for (var j = 0; j < data2[i]["sent_transf_most_sim"].length; ++j) {
            var elem = $("<td class='link-related'>"+data2[data2[i]["sent_transf_most_sim"][j]]["title"]+"</td>")
            elem.attr("idx", data2[i]["sent_transf_most_sim"][j])
            var row_elem = $("<tr></tr>");
            row_elem.append(elem)
            table.append(row_elem)
            $(".link-related").click(function() {showDetails(data2, this);});
        }
    }

    // load data
    $.getJSON("https://dsdepot.github.io/dsdmain/data_w_emb.json", function( data ) {
        for (var i = 0; i < data.length; ++i) {
            //console.log(data[i]["title"])
            if (data[i]["title"] == "") {
                data[i]["title"] = data[i]["text"];
            }
            var elem = $('<li class="list-group-item">' + data[i]["title"] + '</li>')
            
            elem.attr("idx", i)
            $("#search-results").append(elem)
        }

        $(".list-group-item").click(function() {showDetails(data, this);});

        $("#StartFilter").click(function () {
            var wordFilter = $("#myInput").val().toLowerCase();
            var authorFilter = $("#FilterAuthor").val().toLowerCase();
            var placeFilter = $("#FilterPlace").val().toLowerCase();
            var printerFilter = $("#FilterPrinter").val().toLowerCase();
            var startYear = $("#startYearFilter").val();
            var endYear = $("#endYearFilter").val();
            $("#search-results li").filter(function () {
                if (wordFilter) {
                    var wordCorr = $(this).text().toLowerCase().indexOf(wordFilter) > -1;
                } else {
                    var wordCorr = true;
                }
                if (authorFilter && data[$(this).attr("idx")]["author"] != "") {
                    var authorCorr = data[$(this).attr("idx")]["author"].toLowerCase().indexOf(authorFilter) > -1;
                } else if (authorFilter) {
                    var authorCorr = false; // false if we search and there is no hit
                } else {
                    var authorCorr = true;
                }
                if (placeFilter) {
                    pubinfos = data[$(this).attr("idx")]["publishing_info"]
                    if (pubinfos.length > 0) {
                        var placeCorr = false;
                        for (var i = 0; i < pubinfos.length; ++i) {
                            if (pubinfos[i]["place"].toLowerCase().indexOf(placeFilter) > -1) {
                                var placeCorr = true;
                            }
                        }
                    } 
                    else {
                        var placeCorr = false;
                    }
                } else {
                    var placeCorr = true;
                }
                if (printerFilter) {
                    pubinfos = data[$(this).attr("idx")]["publishing_info"]
                    if (pubinfos.length > 0) {
                        var printerCorr = false;
                        for (var i = 0; i < pubinfos.length; ++i) {
                            if (pubinfos[i]["publisher"].toLowerCase().indexOf(printerFilter) > -1) {
                                var printerCorr = true;
                            }
                        }
                    } 
                    else {
                        var printerCorr = false;
                    }
                } else {
                    var printerCorr = true;
                }
                if (startYear || endYear) {
                    if (!startYear) {
                        startYear = 0;
                    }
                    if (!endYear) {
                        endYear = 2000;
                    }
                    var yearCorr = false;
                    pubinfos = data[$(this).attr("idx")]["publishing_info"]
                    for (var i = 0; i < pubinfos.length; ++i) {
                        if (Number(pubinfos[i]["date"]) <= endYear && Number(pubinfos[i]["date"]) >= startYear) {
                            var yearCorr = true;
                        }
                    }
                }
                else {
                    var yearCorr = true;
                }
                if (wordCorr && authorCorr && placeCorr && printerCorr && yearCorr) {
                    var result = true;
                } else {
                    var result = false;
                }
                $(this).toggle(result)
            });
        });   

        /*
        $("#myInput").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#search-results li").filter(function () {
                $(this).toggle(
                    $(this).text().toLowerCase().indexOf(value) > -1 &&
                    (data[$(this).attr("idx")]["publishing_info"].length > 1) && (data[$(this).attr("idx")]["publishing_info"][0]["date"].toLowerCase().indexOf(value) > -1)
                    )
            });
        });
    
        $("#FilterYear").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#search-results li").filter(function () {
                if (value) {
                    $(this).toggle(
                        $(this).text().toLowerCase().indexOf(value) > -1 &&
                        (data[$(this).attr("idx")]["publishing_info"].length > 1) && (data[$(this).attr("idx")]["publishing_info"][0]["date"].toLowerCase().indexOf(value) > -1)
                        )
                } else {
                    $(this).toggle(true)
                }
            });
        });
        */
    });
});
