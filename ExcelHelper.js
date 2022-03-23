"use strict";
const excel = require('xlsx');

const SHEET_NAME = "results"
/**
 * this script write data into an excel file
 * @param headers list of headers, or cell values for the first row, example ['columnA','columnB','columnC']
 * @param {arra} data array of data to write into excel, inner object keys must match the values of @param headers, example: data = [
 * { columnA: 1, columnB: 2, columnC: 3 },
 * { columnA: 4, columnB: 5, columnC: 6 },
 * { columnA: 7, columnB: 8, columnC: 9 } 
 * ]
 */
module.exports.writeExcel = async (headers, data, filename) => new Promise((resolve, reject) => {

    //TODO: wrap text
    //TODO: insert colorful table

    let exportFileName = `${filename}.xlsx`;

    // read from a XLS file
    let workbook

    try {
        workbook = excel.readFile(exportFileName)
    } catch (e) {
        //file does not exist
        //create excel  missing
        const emptySheet = excel.utils.json_to_sheet([])
        workbook = excel.utils.book_new();
        excel.utils.book_append_sheet(workbook, emptySheet, SHEET_NAME)
        excel.writeFileXLSX(workbook, exportFileName)
    }

    //append new content

    //save file

    // get first sheet
    let sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];

    var existingData = excel.utils.sheet_to_json(worksheet)

    data = [...existingData, ...data]


    worksheet = excel.utils.sheet_add_json(worksheet, data, { headers });

    //set cell width, unit is "number of characters"
    var wscols = [
        { wch: 30 }, //package name (30 characters wide)
        { wch: 20 }, //version
        { wch: 50 }, //gms kits
        { wch: 50 }, //hms kits
        { wch: 20 }, //app id
        { wch: 50 }, //market metadata
    ];

    worksheet['!cols'] = wscols;
    // worksheet = excel.utils.book(worksheet, data, { headers });

    excel.writeFileXLSX(workbook, exportFileName)

    resolve()
})

