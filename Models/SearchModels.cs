using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Linq;
using System.Web;

namespace DataEntry.Models
{
    public class SearchResultsModel
    {
        public List<GetProductsResult> Products { get; set; }
        public string Message { get; set; } = "";
    }

    public class ProductModel
    {
        public string ItemNumber { get; set; } = "";
        public GetProductResult ProductInfo { get; set; }
        public List<GetProductAttributesResult> ProductAttributes { get; set; }
        public string Message { get; set; } = "";
        public List<GetCategoriesResult> Categories { get; set; }
        public List<string> CategoryList
        {
            get
            {
                if (ProductInfo.CategoryPath != null)
                {
                    if (ProductInfo.CategoryPath.Contains('/'))
                        return ProductInfo.CategoryPath.Split('/').ToList();
                    else
                        return new List<string>() { ProductInfo.CategoryPath };
                }
                else
                    return new List<string>();
            }
        }
        public List<GetInfoTemplatesResult> InfoTemplates { get; set; }
        //public List<Attribute> Attributes { get; set; }
        public List<GetAllVariantsResult> AllVariants { get; set; }
        public List<GetProductAndCategoryAttributesAndValuesResult> Attributes { get; set; }
        public List<GetAttributeTypeSettingsResult> AttributeSettings { get; set; }
        public int SearchResultIndex { get; set; }
        public int SearchResultCount { get; set; }
        public string PreviousItemNumber { get; set; }
        public string NextItemNumber { get; set; }
        public List<GetAllChemicalsResult> AllChemicals { get; set; }
        public List<GetProductChemicalsResult> ProductChemicals { get; set; }
    }

    public class ProductAttributesModel
    {
        public List<GetProductAttributesResult> ProductAttributes { get; set; }
        public List<Attribute> Attributes { get; set; }
    }

        public class Attribute
    {
        public Guid? ID { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Setting { get; set; }
        public List<AttributeValue> Values { get; set; }
        public bool IsDefaultAttributeType { get; set; }
    }

    public class AttributeValue
    {
        public Guid? ID { get; set; }
        public string Value { get; set; }
        public bool Selected { get; set; } = false;
    }

    public class VariantModel
    {
        public Guid? ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<VariantValueModel> Values { get; set; }
    }

    public class VariantValueModel
    {
        public Guid? ID { get; set; }
        public string Value { get; set; }
        public bool Selected { get; set; } = false;
        public int SortOrder { get; set; }
    }

    public class InsertVariantParentModel
    {
        public string ItemNumber { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
    }

    public class InsertTraitModel
    {
        public Guid? StyleClass { get; set; }
        public string NewTraitName { get; set; }
        public int NewTraitPosition { get; set; }
    }

    public class InsertTraitValueModel
    {
        public Guid? StyleTrait { get; set; }
        public string NewTraitValue { get; set; }
        public int NewTraitValuePosition { get; set; }
    }

    public class UpdateProductModel
    {
        public Guid? ProductID { get; set; }
        public string ShortDescription { get; set; }
        public string ItemNumber { get; set; }
        //public string ProductManager { get; set; }
        //public string SupplyManager { get; set; }
        public string AvailableInKitSetAsst { get; set; }
        public List<Guid?> Categories { get; set; }
        public string MetaDescription { get; set; }
        public string AdditionalSpecs { get; set; }
        public string PleaseNote { get; set; }
        public string MetaKeyword { get; set; }
        public string KitSetincludes { get; set; }
        public Guid? InfoTemplate { get; set; }
        public List<Guid?> Attributes { get; set; }
        //public string CatalogPage { get; set; }
        public string NewItemMeetingDate { get; set; }
        public string PrintGridDesc { get; set; }
        public string ProdCatSection { get; set; }
        public string ProdPageNmbr { get; set; }
        public string ProductnamePrint { get; set; }
        public string ProductPrintDesc { get; set; }
        //public string SaleUOMName { get; set; }
        //public string Weight { get; set; }
        //public string ShipWeight { get; set; }
        //public string CustomService { get; set; }
        //public string IsExclusive { get; set; }
        public Guid? StyleClass { get; set; }
        public List<Guid?> StyleTraitValues { get; set; }
        public List<Guid?> Chemicals { get; set; }
    }

    public class VariantProductModel
    {
        public Guid? ProductID { get; set; }
        public string ItemNumber { get; set; }
        public List<VariantInfo> Variants { get; set; }

        public class VariantInfo
        {
            public Guid? StyleTraitId { get; set; }
            public string StyleTraitName { get; set; }
            public string StyleTraitDescription { get; set; }
            public Guid? StyleTraitValueId { get; set; }
            public string StyleTraitValue { get; set; }
        }
    }
}