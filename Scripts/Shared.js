// JavaScript source code

function SetDefaultButton(BindTo, DefautlButton) {
    $(BindTo).unbind("keydown");
    $(BindTo).bind("keydown", function (event) {
        // track enter key
        var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
        if (keycode == 13) { // keycode for enter key
            // force the 'Enter Key' to implicitly click the Update button
            //document.getElementById(DefautlButton).click();
            $(DefautlButton).click();
            return false;
        } else {
            return true;
        }
    });
}

var errorFunction = function (jqXHR, exception) {
    var msg = '';
    if (jqXHR.status === 0) {
        return;
        //msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status == 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    alert(msg);
}

var sortSelect = function (select, attr, order) {
    if (attr === 'text') {
        if (order === 'asc') {
            $(select).html($(select).children('option').sort(function (x, y) {
                return $(x).text().toUpperCase() < $(y).text().toUpperCase() ? -1 : 1;
            }));
            //$(select).get(0).selectedIndex = 0;
            //e.preventDefault();
        }// end asc
        if (order === 'desc') {
            $(select).html($(select).children('option').sort(function (y, x) {
                return $(x).text().toUpperCase() < $(y).text().toUpperCase() ? -1 : 1;
            }));
            //$(select).get(0).selectedIndex = 0;
            //e.preventDefault();
        }// end desc
    }

};


$(function () {
    SetDefaultButton("#search-item-input", "#seach-itm-btn");
    $(".error-container").collapse({ toggle: false });

    
    // Force autofocus
    $(".modal").on("shown.bs.modal", function () {
        $(this).find('[autofocus]').focus();
    })
    // Force autofocus

    $("#seach-itm-btn").on("click", function () {
        var regEx = /^[a-zA-Z0-9]+/;
        var search = $("#search-item-input").val();

        if (!regEx.test(search)) {

            $("#error").addClass("in");
            return;

        } else {

            $("#error").removeClass("in");
            window.location.href = ROOT + "Search?q=" + search;
        }

    })

    $("#search-item-input").on("keyup", function () {
        $("#error").removeClass("in");
    })

    //$("#divSearch").collapse({ toggle: false });
    var lastScrollTop = 0;
    var HeaderHeight = $("#divHeader").height();
    $("#BodySection").css('margin-top', HeaderHeight);
    $("#divHeader").addClass("fix-header");
    
    $(window).scroll(function (event) {
        UpdateHeaderDisplay();
    });

    function UpdateHeaderDisplay() {
        var st = $(window).scrollTop();
        if ($("#divHeader").hasClass("fix-header")) {
            st += HeaderHeight;
        }
        
        if (st - 10 <= HeaderHeight) {
            $("#divHeader").removeClass("shadow");
        }
        else {
            $("#divHeader").addClass("shadow");
        }
        
        if (st - 100 <= HeaderHeight) {
            $("#divHeader").finish();
            $("#divHeader").show();
        }
        else {
            if (st != lastScrollTop) {
                if (st > lastScrollTop) {
                    // downscroll code
                    if (Math.abs(st - lastScrollTop) > 20) {
                        if ($("#divHeader").is(":visible")) {
                            $("#divHeader").slideUp();
                        }

                        lastScrollTop = st;
                    }
                } else {
                    // upscroll code
                    if (Math.abs(st - lastScrollTop) > 100) {
                        if (!$("#divHeader").is(":visible")) {
                            $("#divHeader").slideDown();
                        }

                        lastScrollTop = st;
                    }
                }
            }
        }
    }
});