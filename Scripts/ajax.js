
function RioAjaxObject(type, url, data, success, error, errorContainer, complete, noLoader, keepLoaderOnComplete, defaultErrorMessage, isAsync) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.success = success;
    this.error = error;
    this.errorContainer = errorContainer;
    this.complete = complete;
    this.noLoader = noLoader;
    this.keepLoaderOnComplete = keepLoaderOnComplete;
    this.defaultErrorMessage = defaultErrorMessage;
}

function postData(url, data, success, error, errorContainer, complete, noLoader, keepLoaderOnComplete, defaultErrorMessage) {
    var ajaxRequest = new RioAjaxObject('POST', url, data, success, error, errorContainer, complete, noLoader, keepLoaderOnComplete, defaultErrorMessage);
    
    return ajaxData(ajaxRequest);
}

function getData(url, data, success, error, errorContainer, complete, noLoader, keepLoaderOnComplete, defaultErrorMessage) {
    var ajaxRequest = new RioAjaxObject('GET', url, data, success, error, errorContainer, complete, noLoader, keepLoaderOnComplete, defaultErrorMessage);

    return ajaxData(ajaxRequest);
}

function ajaxData(request) {
    if (!request.defaultErrorMessage) {
        request.defaultErrorMessage = "An error occurred";
    }

    if (request.errorContainer) {
        dismissError(request.errorContainer);
    }

    if (!request.noLoader) {
        addLoader();
    }

    return $.ajax({
        type: request.type,
        url: request.url,
        data: request.data,
        success: function (data) {
            if (request.success) {
                request.success(data);
            }
            
            //if (!data.IsSuccessful) {
            //    if (request.errorContainer) {
            //        showError(request.errorContainer, data.FormattedMessages || request.defaultErrorMessage);
            //    }

            //    // if we were unsuccessful, then we need to dismiss the spinner
            //    request.keepLoaderOnComplete = false;
            //}
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (request.error) {
                request.error(jqXHR, errorThrown);
            }

            if (request.errorContainer) {
                showError(request.errorContainer, data.message || data.statusText || request.defaultErrorMessage);
            }

            // if we errored out, then we need to dismiss the loader
            request.keepLoaderOnComplete = false;
        },
        complete: function (jqXHR) {

            //if (request.complete) {
            //    request.complete(data);
            //}

            if (!request.noLoader && !request.keepLoaderOnComplete) {
                removeLoader();
            }
        }
    });
}

function addLoader() {
    $("#loader").removeClass("hidden");
}

function removeLoader() {
    $("#loader").addClass("hidden");
}

function dismissError(container) {
    $(container).collapse("hide")
        .find("small")
        .text("");
}

function showError(container, msg) {
    $(container).collapse("show")
                .find("small")
                .text(msg);
}


 $(function () {

    // serialize object for ajax request
     $.fn.serializeObject = function (Encode) {
         Encode = Encode || false;
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                if (Encode)
                    o[this.name].push(encodeURIComponent(this.value) || '');
                else
                    o[this.name].push(this.value || '');
            } else {
                if (Encode)
                    o[this.name] = encodeURIComponent(this.value) || '';
                else
                    o[this.name] = this.value || '';
            }
        });
        return o;
    };
});