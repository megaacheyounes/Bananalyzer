'use strict';
import * as fXLSX from 'xlsx';
import debugModule from 'debug';
const debug = debugModule('excleHelper');

// 3- write to excel file
const finalHeaders = [
  'package name',
  'version',
  'APK creation date',
  'Google Play update date',
  'GMS kits',
  'HMS kits',
  'huawei App Id',
  'AndroidMarket metadata',
  'permissions',
];
export const saveResult = async (analyzerRes, resultFileName) =>
  new Promise(async (resolve, reject) => {
    // transform data
    const data = [];
    Object.keys(analyzerRes).forEach((pn) => {
      const appAnalyzerRes = analyzerRes[pn];
      debug(appAnalyzerRes);
      data.push({
        'package name': pn,
        version: appAnalyzerRes.version,
        'APK creation date': appAnalyzerRes['APK creation date'],
        'upload date': appAnalyzerRes.uploadDate,
        'GMS kits': appAnalyzerRes['GMS'].join(' , '),
        'HMS kits': appAnalyzerRes['HMS'].join(' , '),
        'huawei App Id': appAnalyzerRes['huawei App Id'],
        'androidMarket metadata': appAnalyzerRes['androidMarket metadata'],
        permissions: appAnalyzerRes.permissions,
      });
    });

    try {
      await writeExcel(finalHeaders, data, resultFileName);
      resolve();
    } catch (e) {
      debug(e);
      reject(e);
    }
  });
/**
 * this script write data into an excel file
 * @param {array} headers list of headers, or cell values for the first row, example ['columnA','columnB','columnC']
 * @param {array} data array of data to write into excel, inner object keys must match the values of @param headers,
 *  example: data = [
 * { columnA: 1, columnB: 2, columnC: 3 },
 * { columnA: 4, columnB: 5, columnC: 6 },
 * { columnA: 7, columnB: 8, columnC: 9 }
 * ]
 * @param {array} filename excel filename
 * @return {Promise}
 */
const writeExcel = async (headers, data, filename) =>
  new Promise(async (resolve, reject) => {
    const exportFileName = `${filename}.xlsx`;

    // read from a XLS file

    let sheetName = filename;

    // {readFile,utils,writeFile}
    // read from a XLS file
    let workbook;
    try {
      workbook = fXLSX.readFile(exportFileName);
    } catch (e) {
      // file does not exist
      // create excel  missing
      const emptySheet = fXLSX.utils.json_to_sheet([]);
      workbook = fXLSX.utils.book_new();
      fXLSX.utils.book_append_sheet(workbook, emptySheet, sheetName);
      fXLSX.writeFile(workbook, exportFileName);
    }
    // append new content

    // save file

    // get the first sheet
    sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];

    const existingData = fXLSX.utils.sheet_to_json(worksheet);

    data = [...existingData, ...data];

    worksheet = fXLSX.utils.sheet_add_json(worksheet, data, { headers });

    // set cell width, unit is "number of characters"
    const wscols = [
      { wch: 30 }, // package name (30 characters wide)
      { wch: 25 }, // file last modification date
      { wch: 25 }, // playstore update time
      { wch: 20 }, // version
      { wch: 50 }, // gms kits
      { wch: 50 }, // hms kits
      { wch: 20 }, // app id
      { wch: 50 }, // market metadata
    ];

    worksheet['!cols'] = wscols;
    // worksheet = excel.utils.book(worksheet, data, { headers });

    fXLSX.writeFile(workbook, exportFileName);

    resolve();
  });
