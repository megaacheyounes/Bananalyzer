'use strict';
import xlsx from 'xlsx';
import debugModule from 'debug';
const debug = debugModule('excleHelper');

// 3- write to excel file
const HEADERS = [
  'Package name', //
  'Version name',
  'APK creation date',
  'Google Play update date',
  'GMS kits',
  'HMS kits',
  'Hawei App Id',
  'AndroidMarket metadata',
  'Huawei Metadata',
  'Permissions (Google/Huawei)',
];
export const saveResult = async (analyzerRes, resultFileName) =>
  new Promise(async (resolve, reject) => {
    // transform data
    const data = [];
    Object.keys(analyzerRes).forEach((pn) => {
      const appAnalyzerRes = analyzerRes[pn];
      debug(appAnalyzerRes);
      // keys must equal headers
      // todo: use constants for keys
      data.push({
        'Package name': pn,
        'Version name': appAnalyzerRes.versionName,
        'APK creation date': appAnalyzerRes.apkCreationTime,
        'Google Play update date': appAnalyzerRes.uploadDate,
        'GMS kits': appAnalyzerRes['GMS'].join(' , '),
        'HMS kits': appAnalyzerRes['HMS'].join(' , '),
        'Hawei App Id': appAnalyzerRes.huaweiAppId,
        'AndroidMarket metadata': appAnalyzerRes.androidMarketMetaData,
        'Huawei Metadata': appAnalyzerRes.huaweiMetadata,
        'Permissions (Google/Huawei)': appAnalyzerRes.permissions,
      });
    });

    try {
      await writeExcel(data, resultFileName);
      resolve();
    } catch (e) {
      debug(e);
      reject(e);
    }
  });
/**
 * this script write data into an excel file
 * //@param {array} headers list of headers, or cell values for the first row, example ['columnA','columnB','columnC']
 * @param {array} data array of data to write into excel, inner object keys must match the values of @param headers,
 *  example: data = [
 * { columnA: 1, columnB: 2, columnC: 3 },
 * { columnA: 4, columnB: 5, columnC: 6 },
 * { columnA: 7, columnB: 8, columnC: 9 }
 * ]
 * @param {array} filename excel filename
 * @return {Promise}
 */
const writeExcel = async (data, filename) =>
  new Promise(async (resolve, reject) => {
    const exportFileName = `${filename}.xlsx`;

    // read from a XLS file

    let sheetName = filename;

    // {readFile,utils,writeFile}
    // read from a XLS file
    let workbook;
    try {
      workbook = xlsx.readFile(exportFileName);
    } catch (e) {
      debug(filename + ' not found, will be created');
      // file does not exist
      // create excel  missing
      const emptySheet = xlsx.utils.json_to_sheet([]);
      workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, emptySheet, sheetName);
      try {
        xlsx.writeFileXLSX(workbook, exportFileName);
      } catch (e) {
        reject(e);
      }
    }
    // append new content

    // save file

    // get the first sheet
    sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];

    const existingData = xlsx.utils.sheet_to_json(worksheet);

    data = [...existingData, ...data];

    worksheet = xlsx.utils.sheet_add_json(worksheet, data, { header: HEADERS });

    /*
    'package name', //
  'version',
  'APK creation date',
  'Google Play update date',
  'GMS kits',
  'HMS kits',
  'huawei App Id',
  'AndroidMarket metadata',
  'huawei Metadata',
  'permissions',*/
    // set cell width, unit is "number of characters"
    const wscols = [
      { wch: 30 }, // package name (30 characters wide)
      { wch: 20 }, // version
      { wch: 25 }, // 'APK creation dat
      { wch: 25 }, // 'Google Play update date'
      { wch: 40 }, // gms kits
      { wch: 40 }, // hms kits
      { wch: 20 }, // app id
      { wch: 40 }, // market metadata
      { wch: 50 }, // huawei Metadata
      { wch: 100 }, // permissions
    ];

    worksheet['!cols'] = wscols;
    // worksheet = excel.utils.book(worksheet, data, { headers });

    xlsx.writeFileXLSX(workbook, exportFileName);

    resolve();
  });
