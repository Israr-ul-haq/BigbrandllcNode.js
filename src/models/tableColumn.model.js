const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
    const TableColumns = new Schema(
        {
            thumbnail: {
                type: Boolean,
                required: true,
            },
            sku: {
                type: Boolean,
                required: true,
            },
            productname: {
                type: Boolean,
                required: true,
            },
            brand: {
                type: Boolean,
                required: true,
            },
            vendor: {
                type: Boolean,
                required: true,
            },
            pricingcategory: {
                type: Boolean,
                required: true,
            },
            price: {
                type: Boolean,
                required: true
            },
            freeshipping: {
                type: Boolean,
                required: true
            },
            listprice: {
                type: Boolean,
                required: true,
            },
            netcost: {
                type: Boolean,
                required: true
            },
            mappolicy: {
                type: Boolean,
                required: true
            },
            mapprice: {
                type: Boolean,
                required: true
            },
            quarterlyrebate: {
                type: Boolean,
                required: true
            },
            annualrebate: {
                type: Boolean,
                required: true
            },
            profitmargin: {
                type: Boolean,
                required: true,
            },
            feename: {
                type: Boolean,
                required: true,
            },
            feeamount: {
                type: Boolean,
                required: true,
            },
            shippingmethod: {
                type: Boolean,
                required: true,
            },
            shippingweight: {
                type: Boolean,
                required: true,
            },
            shippingwidth: {
                type: Boolean,
                required: true,
            },
            shippingdepth: {
                type: Boolean,
                required: true,
            },
            shippingheight: {
                type: Boolean,
                required: true,
            },
            freightclass: {
                type: Boolean,
                required: true,
            },
        },
        {
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
        }
    );
    TableColumns.plugin(softDelete, {
        deletedBy: true,
        deletedAt: true,
        overrideMethods: "all"
    })
    TableColumns.plugin(toJSON);
    TableColumns.plugin(mongoosePaginate);

    /**
     * @typedef TableColumns
     */
    return model("TableColumns", TableColumns);
};
