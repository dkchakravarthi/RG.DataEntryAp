using DataEntry.Controllers.Base;
using DataEntry.Helpers;
using DataEntry.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace DataEntry.Controllers
{
    public class SearchController : BaseController
    {
        DataEntryDataContext _db = new DataEntryDataContext();
        string _UserName = " - DataEntryApp";

        public SearchController()
        {
            //string ConnectionString = ConfigurationManager.ConnectionStrings["DataEntryConnectionString"].ConnectionString;
            //_db = new DataEntryDataContext(ConnectionString);
            //_db.CommandTimeout = 99999;
            _UserName = System.Web.HttpContext.Current.User.Identity.Name + _UserName;
        }

        public ActionResult Index(string q)
        {
            SearchResultsModel Model = new SearchResultsModel();
            Model.Products = _db.GetProducts(q).ToList();
            Session["SearchResults"] = Model.Products;

            if (Model.Products.Count() == 1)
            {
                return RedirectToAction("Product", new
                {
                    ItemNumber = Model.Products[0].ERPNumber
                });
            }
            else
            {
                return View(Model);
            }
        }

        public ActionResult Product(string ItemNumber)
        {
            ProductModel Model = new ProductModel();
            Model.ItemNumber = ItemNumber?.Trim();

            if (Session["SearchResults"] != null)
            {
                var SearchResults = (List<GetProductsResult>)Session["SearchResults"];
                Model.SearchResultIndex = SearchResults.FindIndex(s => s.ERPNumber == Model.ItemNumber);
                Model.SearchResultCount = SearchResults.Count();

                if (Model.SearchResultIndex > 0)
                    Model.PreviousItemNumber = SearchResults[Model.SearchResultIndex - 1].ERPNumber;

                if (Model.SearchResultIndex < Model.SearchResultCount - 1)
                    Model.NextItemNumber = SearchResults[Model.SearchResultIndex + 1].ERPNumber;
            }

            //Model.ProductInfo = _db.GetProduct(Model.ItemNumber).FirstOrDefault();

            //if (Model.ProductInfo != null)
            //{
            //    //Model.ProductAttributes = _db.GetProductAttributes(Model.ItemNumber).ToList();
            //    //Model.Categories = _db.GetCategories(null).ToList();
            //    //Model.InfoTemplates = _db.GetInfoTemplates().ToList();
            //    //Model.AllVariants = _db.GetAllVariants().ToList();
            //    //Model.Attributes = _db.GetProductAndCategoryAttributesAndValues(ItemNumber, Model.ProductInfo.InfoTemplateID).ToList();
            //    //Model.AttributeSettings = _db.GetAttributeTypeSettings().ToList();

            //    Parallel.Invoke(/*() =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.ProductAttributes = db.GetProductAttributes(Model.ItemNumber).ToList();
            //    },*/

            //    () =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.Categories = db.GetCategories(null).ToList();
            //    },

            //    () =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.InfoTemplates = db.GetInfoTemplates().ToList();
            //    },

            //    () =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.AllVariants = db.GetAllVariants().ToList();
            //    }/*,

            //    () =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.Attributes = db.GetProductAndCategoryAttributesAndValues(ItemNumber, Model.ProductInfo.InfoTemplateID).ToList();
            //    },

            //    () =>
            //    {
            //        var db = new DataEntryDataContext();
            //        Model.AttributeSettings = db.GetAttributeTypeSettings().ToList();
            //    }*/);
            //}

            Parallel.Invoke(() =>
            {
                var db = new DataEntryDataContext();
                Model.ProductInfo = db.GetProduct(Model.ItemNumber).FirstOrDefault();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                Model.Categories = db.GetCategories(null).ToList();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                Model.InfoTemplates = db.GetInfoTemplates().ToList();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                Model.AllVariants = db.GetAllVariants().ToList();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                Model.AllChemicals = db.GetAllChemicals().ToList();
            });

            Model.ProductChemicals = _db.GetProductChemicals(Model.ProductInfo.Id).ToList();

            return View(Model);
        }

        public ActionResult GetCategories(Guid? ParentID)
        {
            return Json(new
            {
                Categories = SearchHelper.GetCategories(ParentID).ToList()
            });
        }

        [HttpPost]
        public ActionResult GetAttributes(string ItemNumber, Guid? InfoTemplateID)
        {
            //var ProductAttributes = _db.GetProductAttributes(ItemNumber.Trim()).ToList();
            //var Attributes = _db.GetProductAndCategoryAttributesAndValues(ItemNumber, InfoTemplateID).ToList();
            //var AttributeSettings = _db.GetAttributeTypeSettings().ToList();

            List<GetProductAttributesResult> ProductAttributes = null;
            List<GetProductAndCategoryAttributesAndValuesResult> Attributes = null;
            List<GetAttributeTypeSettingsResult> AttributeSettings = null;

            Parallel.Invoke(() =>
            {
                var db = new DataEntryDataContext();
                ProductAttributes = db.GetProductAttributes(ItemNumber.Trim()).ToList();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                Attributes = db.GetProductAndCategoryAttributesAndValues(ItemNumber, InfoTemplateID).ToList();
            },

            () =>
            {
                var db = new DataEntryDataContext();
                AttributeSettings = db.GetAttributeTypeSettings().ToList();
            });

            return GetAttributes(ProductAttributes, Attributes, AttributeSettings);
        }

        public ActionResult GetAttributes(List<GetProductAttributesResult> ProductAttributes,
            List<GetProductAndCategoryAttributesAndValuesResult> Attributes,
            List<GetAttributeTypeSettingsResult> AttributeSettings)
        {
            ProductAttributesModel Model = new ProductAttributesModel();
            Model.ProductAttributes = ProductAttributes;
            //Model.ProductAttributes = _db.GetProductAttributes(ItemNumber.Trim()).ToList();
            //var Attributes = _db.GetProductAndCategoryAttributesAndValues(ItemNumber, InfoTemplateID).ToList();
            //var AttributeSettings = _db.GetAttributeTypeSettings().ToList();


            Model.Attributes = (from a in Attributes.GroupBy(a => a.AttributeTypeId).Select(grp => grp.First())
                                select new Models.Attribute()
                                {
                                    ID = a.AttributeTypeId,
                                    Name = a.Name,
                                    Label = a.Label,
                                    Setting = (from s in AttributeSettings
                                               where s.AttributeTypeID == a.AttributeTypeId
                                               select s.Setting).FirstOrDefault(),
                                    Values = (from av in Attributes
                                              where av.AttributeTypeId == a.AttributeTypeId
                                              select new Models.AttributeValue()
                                              {
                                                  ID = av.AttributeValueId,
                                                  Value = av.Value,
                                                  Selected = Model.ProductAttributes.Where(pa => pa.AttributeTypeId == a.AttributeTypeId).FirstOrDefault()?.AttributeValueId == av.AttributeValueId
                                              }).ToList(),
                                    IsDefaultAttributeType = a.IsDefaultAttributeType
                                }).ToList();

            //if (Request.HttpMethod.ToUpper() == "POST")
            //    return Json(new
            //    {
            //        Html = RenderPartialViewToString("_ProductAttributes", Model)
            //    });
            //else
                return PartialView("_ProductAttributes", Model);
        }

        public ActionResult AddAttributeValue(Guid? AttributeID, string AttributeValue)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(AttributeValue))
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "Please enter a value."
                    });
                }

                var AttributeValueID = _db.InsertAttributeValue(AttributeID, AttributeValue.Trim(), _UserName).FirstOrDefault()?.AttributeValueId;

                return Json(new
                {
                    Status = "Successful",
                    Message = "",
                    AttributeValueID = AttributeValueID
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }

        public ActionResult GetVariants(Guid? ProductID, Guid? StyleClassID)
        {
            var Model = new List<VariantModel>();
            var ProductVariants = _db.GetProductVariants(ProductID).ToList();
            var Variants = _db.GetAllStyleTraitValues(StyleClassID).ToList();

            Model = (from a in Variants.GroupBy(a => a.StyleTraitID).Select(grp => grp.First())
                              select new Models.VariantModel()
                              {
                                  ID = a.StyleTraitID,
                                  Name = a.StyleTraitName,
                                  Description = a.StyleTraitDescription,
                                  Values = (from av in Variants
                                            where av.StyleTraitID == a.StyleTraitID
                                            select new Models.VariantValueModel()
                                            {
                                                ID = av.StyleTraitValueID,
                                                Value = av.StyleTraitValue,
                                                Selected = ProductVariants.Where(pa => pa.StyleTraitID == a.StyleTraitID).FirstOrDefault()?.StyleTraitValueID == av.StyleTraitValueID,
                                                SortOrder = av.StyleTraitValueSortOrder ?? 0
                                            }).ToList()
                              }).ToList();

            if (Request.HttpMethod.ToUpper() == "POST")
                return Json(new
                {
                    Html = RenderPartialViewToString("_ProductVariants", Model)
                });
            else
                return PartialView("_ProductVariants", Model);
        }

        public ActionResult GetProductsByStyleParentID(Guid? StyleClassID)
        {
            var Products = _db.GetProductsInStyleClass(StyleClassID).ToList();

            List<VariantProductModel> Model = (from p in Products.GroupBy(p => p.ProductID).Select(grp => grp.First())
                     select new Models.VariantProductModel()
                     {
                         ProductID = p.ProductID,
                         ItemNumber = p.ItemNumber,
                         Variants = (from pv in Products
                                     where pv.ProductID == p.ProductID
                                     select new Models.VariantProductModel.VariantInfo()
                                   {
                                       StyleTraitId = pv.StyleTraitId,
                                       StyleTraitName = pv.StyleTraitName,
                                       StyleTraitDescription = pv.StyleTraitDescription,
                                       StyleTraitValueId = pv.StyleTraitValueId,
                                       StyleTraitValue = pv.StyleTraitValue
                                     }).ToList()
                     }).ToList();


            if (Request.HttpMethod.ToUpper() == "POST")
                return Json(new
                {
                    Html = RenderPartialViewToString("_VariantProducts", Model)
                });
            else
                return PartialView("_VariantProducts", Model);
        }

        public ActionResult InsertVariantParent(InsertVariantParentModel Model)
        {
            try
            {
                SearchHelper.DecodeModel(Model);

                if (string.IsNullOrWhiteSpace(Model.ItemNumber)
                    || string.IsNullOrWhiteSpace(Model.Name)
                    || string.IsNullOrWhiteSpace(Model.Description))
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "Please fill in the parent, name, and description fields."
                    });
                }
                
                var StyleClassID = _db.InsertVariantParent(Model.ItemNumber, Model.Name, Model.Description, Model.Note, _UserName).FirstOrDefault()?.StyleClassID;

                return Json(new
                {
                    Status = "Successful",
                    Message = "",
                    StyleClassID = StyleClassID
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }

        public ActionResult InsertTrait(InsertTraitModel Model)
        {
            try
            {
                SearchHelper.DecodeModel(Model);

                if (string.IsNullOrWhiteSpace(Model.NewTraitName))
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "Please fill in all fields."
                    });
                }

                if (Model.StyleClass == null)
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "Please select a variant parent."
                    });
                }
                
                var StyleTraitID = _db.InsertStyleTrait(Model.StyleClass, Model.NewTraitName, Model.NewTraitPosition, _UserName).FirstOrDefault()?.StyleTraitID;
                var variant = new VariantModel()
                {
                    ID = StyleTraitID,
                    Name = Model.NewTraitName,
                    Description = Model.NewTraitName,
                    Values = new List<VariantValueModel>()
                };

                return Json(new
                {
                    Status = "Successful",
                    Html = RenderPartialViewToString("_ProductVariant", variant)
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }

        public ActionResult InsertTraitValue(InsertTraitValueModel Model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(Model.NewTraitValue))
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "Please fill in all fields."
                    });
                }

                if (Model.StyleTrait == null)
                {
                    return Json(new
                    {
                        Status = "Error",
                        Message = "No style trait selected."
                    });
                }

                var StyleTraitValueID = _db.InsertStyleTraitValue(Model.StyleTrait, Model.NewTraitValue, Model.NewTraitValuePosition, _UserName).FirstOrDefault()?.StyleTraitValueID;

                return Json(new
                {
                    Status = "Successful",
                    Message = "",
                    StyleTraitValueID = StyleTraitValueID
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }

        public ActionResult SwitchTraitOrder(Guid? ProductID, Guid? StyleClassID, string StyleTraitIDs)
        {
            _db.SwitchStyleTraitPositions(StyleTraitIDs, _UserName);
            return GetVariants(ProductID, StyleClassID);
        }

        public ActionResult GetUpdateStyleTraitValues(Guid? StyleTraitID)
        {
            var Model = new List<VariantValueModel>();
            var StyleTraitValues = _db.GetUpdateStyleTraitValues(StyleTraitID).ToList();
            
            Model = (from av in StyleTraitValues
                     select new Models.VariantValueModel()
                     {
                         ID = av.ID,
                         Value = av.Value,
                         Selected = false,
                         SortOrder = av.SortOrder
                     }).ToList();

            return Json(new
            {
                Count = Model.Count(),
                Html = RenderPartialViewToString("_UpdateStyleTraitValues", Model),
                StyleTraitValues = Model
            });
        }

        public ActionResult UpdateStyleTraitValueSortOrders(Guid StyleTraitID, List<VariantValueModel> StyleTraitValueSortOrders)
        {
            try
            {
                foreach (var StyleTraitValueSortOrder in StyleTraitValueSortOrders)
                {
                    _db.UpdateStyleTraitValueSortOrder(StyleTraitValueSortOrder.ID, StyleTraitValueSortOrder.SortOrder, _UserName);
                }

                var Model = new List<VariantValueModel>();
                var StyleTraitValues = _db.GetStyleTraitValues(StyleTraitID);

                Model = (from av in StyleTraitValues
                         select new Models.VariantValueModel()
                         {
                             ID = av.StyleTraitValueID,
                             Value = av.StyleTraitValue,
                             Selected = false,
                             SortOrder = av.StyleTraitValueSortOrder ?? 0
                         }).ToList();


                return Json(new
                {
                    Status = "Successful",
                    Count = Model.Count(),
                    StyleTraitValues = Model
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }

        public  void RemoveProductFromVariant(Guid? ProductID)
        {
            _db.RemoveProductFromVariant(ProductID, _UserName);
        }

        //[ValidateInput(false)]
        public ActionResult UpdateProduct(UpdateProductModel Model)
        {
            try
            {
                _UserName = System.Web.HttpContext.Current.User.Identity.Name + " - DataEntryApp";
                SearchHelper.DecodeModel(Model);
                
                _db.UpdateProduct(Model.ProductID, 
                    Model.ItemNumber, 
                    Model.ShortDescription ?? "", 
                    Model.Categories.Where(c => c != null).DefaultIfEmpty().Last(), 
                    Model.InfoTemplate,
                    Model.AvailableInKitSetAsst, 
                    Model.MetaDescription ?? "", 
                    Model.AdditionalSpecs,
                    Model.PleaseNote,
                    Model.MetaKeyword ?? "",
                    Model.KitSetincludes,
                    Model.NewItemMeetingDate,
                    Model.PrintGridDesc,
                    Model.ProdCatSection,
                    Model.ProdPageNmbr,
                    Model.ProductnamePrint,
                    Model.ProductPrintDesc,
                    (!Model.ItemNumber.ToUpper().Contains("GP") ? Model.StyleClass : null), //don't add variant parents to GP items
                    _UserName);

                _db.UpdateProductAttributes(Model.ProductID, string.Join(",", Model.Attributes?.Where(c => c != null)));
                _db.UpdateProductChemicals(Model.ProductID, string.Join(",", Model.Chemicals?.Where(c => c != null )));

                // don't add variants to GP items
                if (!Model.ItemNumber.ToUpper().Contains("GP"))
                    _db.UpdateStyleTraitValueProducts(Model.ProductID, (Model.StyleTraitValues != null ? string.Join(",", Model.StyleTraitValues?.Where(c => c != null)) : ""));

                return Json(new
                {
                    Status = "Successful"
                });
            }
            catch (Exception ex)
            {
                LoggingHelper.LogError(ex);

                return Json(new
                {
                    Status = "Error",
                    Message = ex.Message
                });
            }
        }
    }
}