//Used to check if needed to save but now that the attributes and variants are loaded on the fly it doesn't work this way
//var origProductModel = "";

function displayDimValues() {
    $('[id*="imension"]').each(function () {
        var value = $(this).find("option:selected").text();
        $(this).closest(".col-sm-4").find("span.display-value").text(value);
    })
}

function DisplayAddTraitButton() {
    if ($("#StyleClass").val().trim().length > 0 && $("select[name='StyleTraitValues']").length < 2) {
        $(".add-trait-btn").show();
        $(".switch-trait-order-btn").hide();
    }
    else {
        $(".add-trait-btn").hide();

        if ($("select[name='StyleTraitValues']").length >= 2) {
            $(".switch-trait-order-btn").show();
        }
        else {
            $(".switch-trait-order-btn").hide();
        }
    }
}

function LoadAttributes(noLoader) {
    var ItemNumber = $("#InfoTemplate").data("itemnumber");
    var InfoTemplateID = $("option:selected", "#InfoTemplate").val();
    
    var input = { ItemNumber: ItemNumber, InfoTemplateID: InfoTemplateID };
    var url = ROOT + "Search/GetAttributes";
        
    var successFunction = function (data) {
        $("#template").html(data);
        $("#template").data("status", "");
        displayDimValues();
        //origProductModel = $("#frmProduct").serializeObject(true);
    }

    postData(url, input, successFunction, errorFunction, null, null, noLoader, null, null);
}

function LoadVariants(noLoader) {
    //Load Variants
    var ProductID = $("#StyleClass").data("productid");
    var StyleClassID = $("option:selected", "#StyleClass").val();

    var input = { ProductID: ProductID, StyleClassID: StyleClassID };
    var url = ROOT + "Search/GetVariants";

    var successFunction = function (data) {
        $("#traits").html(data);
        $("#traits").data("status", "");
        DisplayAddTraitButton();
    }

    return getData(url, input, successFunction, errorFunction, null, null, noLoader, true, null);
}

function LoadVariantProducts(noLoader) {
    //Load all items in variant
    var StyleClassID = $("option:selected", "#StyleClass").val();

    var input = { StyleClassID: StyleClassID };
    var url = ROOT + "Search/GetProductsByStyleParentID";

    var successFunction = function (data) {
        $("#variant-parent-item-list").html(data);
    }

    return getData(url, input, successFunction, errorFunction, null, null, noLoader, true, null);
}

$(function () {
    //origProductModel = $("#frmProduct").serializeObject(true);
    $("#add-traitvalue-form-position").collapse({ toggle: false });
    var offset = $(".divPreviousItem").offset();

    //var InitialLoadAttributes = LoadAttributes(true);
    //var InitialLoadVariants = LoadVariants(true);
    //var InitialLoadVariantProducts = LoadVariantProducts(true);
    LoadAttributes(true);
    LoadVariants(true);
    LoadVariantProducts(true);

    if ($("select[name='Categories']").find(":selected").val() == "") {
        $("#msg").find(".modal-title").html("I need a home... I need a category!");
        var $modal = $("#msg").modal();
    }

    $(window).scroll(function () {
        var scrollTop = $(window).scrollTop(); // check the visible top of the browser  

        if (offset.top < scrollTop) {
            $(".divPreviousItem").addClass("btnPreviousItemFixed");
            $(".divNextItem").addClass("btnNextItemFixed");
        }
        else {
            $(".divPreviousItem").removeClass("btnPreviousItemFixed");
            $(".divNextItem").removeClass("btnNextItemFixed");
        }
    });

    $("html").delegate(".btnMove", "click", function (e) {
        e.preventDefault();
        //TODO - abort the initial load ajax calls
        //InitialLoadAttributes.abort();
        //InitialLoadVariants.abort();
        //InitialLoadVariantProducts.abort();
        //ajaxAbortAll();
        //$.xhrQueue.abortAll();
        //$.xhrPool.abortAll();
        //alert("help");
        //ajaxAbortAll();
        //alert(9);
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?ItemNumber=" + $(this).data("id");
        location = newurl;
    });
    
    $("html").delegate("select[name='Categories']", "change", function (e) {
        $("select[name='Categories']").slice($("select[name='Categories']").index(this) + 1).remove();
        var CatID = $(this).find(":selected").val();

        if (CatID == "") {
            return;
        }

        var url = ROOT + "Search/GetCategories";
        var $this = $(this);
        var input = { ParentID: CatID };
        
        var successFunction = function (data) {
            if (data.Categories.length > 0) {
                var SubCat = $this.clone();
                SubCat.find("option:gt(0)").remove();
                $.each(data.Categories, function (i, Cat) {
                    SubCat.find("option:last").after(SubCat.find("option:first").clone().text(Cat.Name).val(Cat.Id));
                });
                $this.after(SubCat);
            }
        }

        postData(url, input, successFunction, errorFunction, null, null, true, null, null);
    });
    
    $("html").delegate("select[name='Chemicals']", "change", function (e) {
        //alert(5);
        //$("select[name='Chemicals']").slice($("select[name='Chemicals']").index(this) + 1).remove();
        if ($(this).val() == "") {
            $(this).remove();
        }
        else if ($("select[name='Chemicals']").index(this) >= $("select[name='Chemicals']").length - 1) {
            var NewChemicals = $(this).clone();
            NewChemicals.val("");
            $(this).after(NewChemicals);
        }
    });

    // #region auto expand textareas when copy too long after people starts writing
    $(document)
    .on('focus.autoExpand', 'textarea.autoExpand', function () {
        if ($(this).data('setup')) {
            return;
        }

        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
        autoExpand(this);

        $(this).data('setup', true);
    })
    .on('input.autoExpand', 'textarea.autoExpand', function () {
        autoExpand(this);
    });

    function autoExpand($this) {
        var minRows = $this.getAttribute('data-min-rows') | 0, rows;
        $this.rows = minRows;
        rows = Math.ceil(($this.scrollHeight - $this.baseScrollHeight) / 16);
        $this.rows = minRows + rows;
    }
    // #endregion auto expand textareas when copy too long after people starts writing https://codepen.io/vsync/pen/frudD

    // preview on modal
    $(document).on("click", ".web-preview", function (e) {
        var input = $(this).data("target")
        var textArea = $(input).val();

        if (textArea != "") {
            var $modal = $("#web-preview-modal").modal();
            $modal.find(".modal-body div").html(textArea)
        }
    });
    //preview on modal



    $("html").delegate("#InfoTemplate", "change", function (e) {
        e.preventDefault();

        var formData = $("#frmProduct").serializeObject(true);
        saveData(formData, false, true, LoadAttributes);

        //var InfoTemplate = formData["InfoTemplate"];
        //formData["InfoTemplate"] = "";
        //origProductModel["InfoTemplate"] = "";
        //if ($.param(formData) !== $.param(origProductModel)) {
        //    formData["InfoTemplate"] = InfoTemplate;
        //    saveData(formData, false, true, LoadAttributes);
        //}
        //else {
        //    LoadAttributes();
        //}
    });

    $("html").delegate(".add-attributevalue-btn", "click", function (e) {
        e.preventDefault();

        var AttributeID = $(this).data("id");
        var AttributeLabel = $(this).data("label");
        var AddTarget = $(this).data("add-target");

        $("#add-attributevalue-form").data("attributeid", AttributeID);
        $("#add-attributevalue-form").data("add-target", AddTarget);
        $("#AddAttributeValueTitle").text("Add new value for " + AttributeLabel);
        $("#NewAttributeValue").val("");
        var $modal = $("#add-attributevalue-modal").modal();
        $modal.find(".error-container").collapse("hide");
    });

    $(document).on("submit", "#add-attributevalue-form", function (e) {
        e.preventDefault();

        var AttributeID = $(this).data("attributeid");
        var AttributeValue = $.trim($(this).find("#NewAttributeValue").val());
        var AddTarget = $(this).data("add-target");
        var $modal = $(this).closest(".modal");

        if (!AttributeValue.trim()) {
            $("#AddAttributeValueMessage").text("Please enter a value.");
            $modal.find(".error-container").collapse("show");
            return;
        }

        if ($(AddTarget + " option:contains('" + AttributeValue + "')").length > 0) {
            $(AddTarget + " option").removeProp("selected");
            $(AddTarget + " option").filter(function () { return $(this).text().trim() == AttributeValue; }).prop("selected", "selected");
            $modal.modal("hide");
            return;
        }

        var input = { AttributeID: AttributeID, AttributeValue: AttributeValue };
        var url = ROOT + "Search/AddAttributeValue";

        var successFunction = function (data) {
            if (data.Status == "Successful") {
                //SubCat.find("option:last").after(SubCat.find("option:first").clone().text(Cat.Name).data("id", Cat.Id))
                $(AddTarget).find("option:last").after($(AddTarget).find("option:first").clone().text(AttributeValue).val(data.AttributeValueID).data("AttributeValueid", data.AttributeValueID));
                $(AddTarget + " option").removeProp("selected");
                sortSelect(AddTarget, 'text', 'asc');
                $(AddTarget + " option").filter(function () { return $(this).text().trim() == AttributeValue; }).prop("selected", "selected");
                $modal.modal("hide");
            }
            else {
                $("#AddAttributeValueMessage").text(data.Message);
                $modal.find(".error-container").collapse("show");
            }
        }

        postData(url, input, successFunction, errorFunction, null, null, null, null, null);
    });

    $("html").delegate("#StyleClass", "change", function (e) {
        e.preventDefault();

        ////Load Variants
        //var ProductID = $(this).data("productid");
        //var StyleClassID = $("option:selected", this).val();

        //var input = { ProductID: ProductID, StyleClassID: StyleClassID };
        //var url = ROOT + "Search/GetVariants";

        //var successFunction = function (data) {
        //    $("#traits").html(data);
        //    DisplayAddTraitButton();
        //}

        //var GetVariants = getData(url, input, successFunction, errorFunction, null, null, null, true, null);


        ////Load all items in variant
        //var input = { StyleClassID: StyleClassID };
        //var url = ROOT + "Search/GetProductsByStyleParentID";

        //var successFunction = function (data) {
        //    $("#variant-parent-item-list").html(data);
        //}

        //var GetProductsByStyleParentID = getData(url, input, successFunction, errorFunction, null, null, null, true, null);

        $.when(LoadVariants(), LoadVariantProducts()).done(function (a1, a2) {
            removeLoader();
        });
    });

    $("html").delegate(".add-variantparent-btn", "click", function (e) {
        e.preventDefault();

        $("#add-variantparent-form")[0].reset();
        var $modal = $("#add-variantparent-modal").modal();
        $modal.find(".error-container").collapse("hide");
    });

    $(document).on("submit", "#add-variantparent-form", function (e) {
        e.preventDefault();
        var model = $(this).serializeObject(true);
        var $modal = $(this).closest(".modal");

        if (!model.ItemNumber.trim()
            || !model.Name.trim()
            || !model.Description.trim()) {
            $("#AddVariantParentMessage").text("Please fill in the parent, name, and description fields.");
            $modal.find(".error-container").collapse("show");
            return;
        }

        if ($("#StyleClass option:contains('" + model.ItemNumber + "')").length > 0) {
            $("#StyleClass option").removeProp("selected");
            $("#StyleClass option").filter(function () { return $(this).text().trim() == model.ItemNumber; }).prop("selected", "selected");
            $("#StyleClass").change();
            $modal.modal("hide");
            return;
        }

        var url = ROOT + "Search/InsertVariantParent";

        var successFunction = function (data) {
            if (data.Status == "Successful") {
                //alert(data.Status);
                $("#StyleClass").find("option:last").after($("#StyleClass").find("option:first").clone().text(model.ItemNumber).val(data.StyleClassID));
                $("#StyleClass option").removeProp("selected");
                sortSelect("#StyleClass", 'text', 'asc');
                $("#StyleClass option").filter(function () { return $(this).text().trim() == model.ItemNumber; }).prop("selected", "selected");
                $("#StyleClass").change();
                $modal.modal("hide");
            }
            else {
                //alert(data.Message);
                $("#AddVariantParentMessage").text(data.Message);
                $modal.find(".error-container").collapse("show");
            }
        }

        postData(url, model, successFunction, errorFunction, null, null, null, null, null);
    });

    $("html").delegate(".add-trait-btn", "click", function (e) {
        e.preventDefault();

        $("#add-trait-form")[0].reset();
        var $modal = $("#add-trait-modal").modal();
        $modal.find(".error-container").collapse("hide");
    });

    $(document).on("submit", "#add-trait-form", function (e) {
        e.preventDefault();

        var model = $(this).serializeObject(true);
        var $modal = $(this).closest(".modal");
        model["StyleClass"] = encodeURIComponent($("#StyleClass").val()) || '';
        var url = ROOT + "Search/InsertTrait";

        if (!model.NewTraitName.trim()
            || !model.NewTraitPosition.trim()) {
            $("#AddTraitMessage").text("Please fill in all fields.");
            $modal.find(".error-container").collapse("show");
            return;
        }

        if (!(Math.floor(model.NewTraitPosition) == model.NewTraitPosition && $.isNumeric(model.NewTraitPosition))) {
            $("#AddTraitMessage").text("Position must be an integer");
            $modal.find(".error-container").collapse("show");
            return;
        }

        if (!model.StyleClass.trim()) {
            $("#AddTraitMessage").text("Please select a variant parent.");
            $modal.find(".error-container").collapse("show");
            return;
        }

        var successFunction = function (data) {
            if (data.Status == "Successful") {
                $("#traits").append(data.Html);
                DisplayAddTraitButton();
                $modal.modal("hide");
            }
            else {
                alert(data.Message);
            }
        }

        postData(url, model, successFunction, errorFunction, null, null, null, null, null);
    });

    $("html").delegate(".add-traitvalue-btn", "click", function (e) {
        e.preventDefault();

        var StyleTraitID = $(this).data("id");
        var StyleTraitDescription = $(this).data("description");
        var AddTarget = $(this).data("add-target");

        $("#add-traitvalue-form").data("styletraitid", StyleTraitID);
        $("#add-traitvalue-form").data("add-target", AddTarget);
        $("#AddStyleTraitValueTitle").text("Add new trait value for " + StyleTraitDescription);
        $("#add-traitvalue-form")[0].reset();

        $("#add-traitvalue-form-position").data("styletraitid", StyleTraitID);
        $("#add-traitvalue-form-position").data("add-target", AddTarget);

        var url = ROOT + "Search/GetUpdateStyleTraitValues";
        var input = { StyleTraitID: StyleTraitID };

        var successFunction = function (data) {
            if (data.Count > 0) {
                $("#other-traitvalues").html(data.Html);
                $("#add-traitvalue-form-position").collapse("show");
            }
            else {
                $("#add-traitvalue-form-position").collapse("hide");
            }

            var $modal = $("#add-traitvalue-modal").modal();
            $modal.find(".error-container").collapse("hide");
        }

        postData(url, input, successFunction, errorFunction, null, null, null, null, null);
    });

    $(document).on("submit", "#add-traitvalue-form", function (e) {
        e.preventDefault();

        var model = $(this).serializeObject(false);
        var $modal = $(this).closest(".modal");
        var AddTarget = $(this).data("add-target");
        model["StyleTrait"] = encodeURIComponent($(this).data("styletraitid")) || '';
        var url = ROOT + "Search/InsertTraitValue";

        if (!model.NewTraitValue.trim()
            || !model.NewTraitValuePosition.trim()) {
            $("#AddTraitValueMessage").text("Please fill in all fields.");
            $modal.find(".error-container").collapse("show");
            return;
        }

        if ($(AddTarget + " option:contains('" + model.NewTraitValue + "')").length > 0) {
            $(AddTarget + " option").removeProp("selected");
            $(AddTarget + " option").filter(function () { return $(this).text().trim() == model.NewTraitValue; }).prop("selected", "selected");
            $modal.modal("hide");
            return;
        }

        if (!(Math.floor(model.NewTraitValuePosition) == model.NewTraitValuePosition && $.isNumeric(model.NewTraitValuePosition))) {
            $("#AddTraitValueMessage").text("Position must be an integer");
            $modal.find(".error-container").collapse("show");
            return;
        }

        var successFunction = function (data) {
            if (data.Status == "Successful") {
                //$(AddTarget).find("option:last").after($(AddTarget).find("option:first").clone().text(model.NewTraitValue).val(data.StyleTraitValueID));
                //$(AddTarget + " option").removeProp("selected");
                //sortSelect(AddTarget, 'text', 'asc');
                //$(AddTarget + " option").filter(function () { return $(this).text().trim() == model.NewTraitValue; }).prop("selected", "selected");
                //$modal.modal("hide");

                var url = ROOT + "Search/GetUpdateStyleTraitValues";
                var input = { StyleTraitID: model.StyleTrait };

                var successFunction = function (data) {
                    $("#other-traitvalues").html(data.Html);
                    $("#add-traitvalue-form-position").collapse("show");
                    $modal.find(".error-container").collapse("hide");

                    $(AddTarget + " option[value!='']").remove();

                    $.each(data.StyleTraitValues, function (i, StyleTraitValue) {
                        $(AddTarget).find("option:last").after($(AddTarget).find("option:first").clone().text(StyleTraitValue.Value).val(StyleTraitValue.ID));
                    });

                    $(AddTarget + " option").removeProp("selected");
                    $(AddTarget + " option").filter(function () { return $(this).text().trim() == model.NewTraitValue; }).prop("selected", "selected");
                }

                postData(url, input, successFunction, errorFunction, null, null, null, null, null);
            }
            else {
                $("#AddTraitValueMessage").text(data.Message);
                $modal.find(".error-container").collapse("show");
            }
        }

        postData(url, model, successFunction, errorFunction, null, null, null, null, null);
    });

    $("html").delegate(".switch-trait-order-btn", "click", function (e) {
        e.preventDefault();

        var ProductID = $(this).data("productid");
        var StyleClassID = $("#StyleClass option:selected").val();
        var StyleTraitIDs = "";

        $("select[name='StyleTraitValues']").each(function () {
            if (StyleTraitIDs.length > 0) {
                StyleTraitIDs += ",";
            }

            StyleTraitIDs += $(this).data("id");
        });

        var url = ROOT + "Search/SwitchTraitOrder";
        var input = { ProductID: ProductID, StyleClassID: StyleClassID, StyleTraitIDs: StyleTraitIDs };
        
        var successFunction = function (data) {
            $("#traits").html(data);
        }

        getData(url, input, successFunction, errorFunction, null, null, null, null, null);
    });

    $(document).on("submit", "#add-traitvalue-form-position", function (e) {
        e.preventDefault();
        var $modal = $(this).closest(".modal");
        var AddTarget = $(this).data("add-target");
        var SelectedText = $(AddTarget + " option:selected").text();
        var url = ROOT + "Search/UpdateStyleTraitValueSortOrders";

        var StyleTraitValueSortOrders = [];
        $("input[name='UpdateStyleTraitValueSortOrder']").each(function () {
            var StyleTraitValueSortOrder = {};
            StyleTraitValueSortOrder["ID"] = $(this).data("id");
            StyleTraitValueSortOrder["SortOrder"] = $(this).val();
            StyleTraitValueSortOrders.push(StyleTraitValueSortOrder);
        });

        var model = {};
        model["StyleTraitID"] = $(this).data("styletraitid");
        model["StyleTraitValueSortOrders"] = StyleTraitValueSortOrders;

        var successFunction = function (data) {
            if (data.Status == "Successful") {
                $(AddTarget + " option[value!='']").remove();
                
                $.each(data.StyleTraitValues, function (i, StyleTraitValue) {
                    $(AddTarget).find("option:last").after($(AddTarget).find("option:first").clone().text(StyleTraitValue.Value).val(StyleTraitValue.ID));
                });
                
                $(AddTarget + " option").removeProp("selected");
                $(AddTarget + " option").filter(function () { return $(this).text().trim() == SelectedText; }).prop("selected", "selected");
                
                $modal.modal("hide");
            }
            else {
                alert(data.Message);
            }
        }

        postData(url, model, successFunction, errorFunction, null, null, null, null, null);
    });

    $("html").delegate(".RemoveProductFromVariant", "click", function (e) {
        e.preventDefault();

        var ProductId = $(this).data("id");

        var url = ROOT + "Search/RemoveProductFromVariant";
        var input = { ProductId: ProductId };

        postData(url, input, null, errorFunction, null, null, null, null, null);
        
        $("#VariantProduct-" + ProductId).hide();
    });

    $(document).on("submit", "#frmProduct", function (e) {
        e.preventDefault();
        var model = $(this).serializeObject(true);
 
        saveData(model, true, false);
        //origProductModel = $("#frmProduct").serializeObject(true);
    });

    $("html").delegate("#btnReset", "click", function (e) {
        e.preventDefault();
        //$("#frmProduct")[0].reset();
        location.reload();
    });

    $('[id*="imension"]').on("change", function () {

        displayDimValues();
    })

    displayDimValues();

});

function saveData(data, showWindow, keepLoaderOnComplete, callBackFunction) {
    if ($("#template").data("status") == "LOADING") {
        alert("Please wait for the templates to finish loading before saving.")
        return;
    }

    if ($("#traits").data("status") == "LOADING") {
        alert("Please wait for the variant section to finish loading before saving.")
        return;
    }
    
    var model = data;
    var url = ROOT + "Search/UpdateProduct";

    var successFunction = function (data) {
        if (data.Status == "Successful") {
            if (showWindow) {
                $("#msg").find(".modal-title").html(data.Status);
                var $modal = $("#msg").modal();
                setTimeout(function () { $("#msg").modal("hide"); }, 2000);
            }

            if (callBackFunction) {
                callBackFunction();
            }
        }
        else {
            alert(data.Message);
        }
    }
    
    postData(url, model, successFunction, errorFunction, null, null, null, keepLoaderOnComplete, null);


}