const httpStatus = require("http-status"),
    { TableColumns } = require("@models"),
    ApiError = require("@utils/ApiError"),
    customLabels = require("@utils/customLabels"),
    defaultSort = require("@utils/defaultSort");
/**
 * Get TableColumns
 * @returns {Promise<TableColumns[]>}
 */
const getTableColumns = async () => {
    const tableColumns = await TableColumns.find();
    return tableColumns;
}
/**
 * Get TableColumns by id
 * @param {ObjectId} ObjectId
 * @returns {Promise<TableColumns>}
 * @throws {ApiError}
 */
const getTableColumnsById = async (id) => {
    const tableColumn = await TableColumns.findById(id);
    if (!tableColumn) {
        throw new ApiError(httpStatus.NOT_FOUND, "TableColumn not found");
    }
    return tableColumn;
};
/**
 * Update TableColumns 
 */
const updateTableColumn = async (updateBody) => {

}

const createTableColumn = async (tablecolumnbody) => {
    const column = await getTableColumns();
    console.log("model", column);
    if (!column.length) {
        await TableColumns.create(tablecolumnbody);
        return tablecolumnbody;
    }
    else
    {
        console.log("find")
        const el = column[0];
        Object.assign(el, tablecolumnbody)
        await el.save();
        return el;
    }

}

module.exports = {
    getTableColumns,
    createTableColumn
}
