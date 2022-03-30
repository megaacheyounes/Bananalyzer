'use strict';
import debugModule from 'debug';
import path from 'path';
import xlsx from 'xlsx';

import { AnalyzedApk } from './models/analyzedApk';
import { ExcelRow } from './models/excelRow';

const debug = debugModule('excleHelper');

const HEADER_PACKAGE_NAME = 'Package name'; //
const HEADER_VERSION_NAME = 'Version name';
const HEADER_APK_CREATION_DATE = 'APK creation date';
const HEADER_PLAY_STORE_UPDATE_DATE = 'Google Play update date';
const HEADER_GMS_KITS = 'GMS kits';
const HEADER_HMS_KITS = 'HMS kits';
const HEADER_HUAWEI_APP_ID = 'Hawei App Id';
const HEADER_ANDROID_MARKET_METADATA = 'AndroidMarket metadata';
const HEADER_HUAWEI_METADATAS = 'Huawei Metadatas';
const HEADER_GOOGLE_METADATAS = 'Google Metadatas';
const HEADER_PERMISSIONS = 'Permissions (Google/Huawei)';

// 3- write to excel file
const HEADERS = [
  HEADER_PACKAGE_NAME,
  HEADER_VERSION_NAME,
  HEADER_APK_CREATION_DATE,
  HEADER_PLAY_STORE_UPDATE_DATE,
  HEADER_GMS_KITS,
  HEADER_HMS_KITS,
  HEADER_HUAWEI_APP_ID,
  HEADER_ANDROID_MARKET_METADATA,
  HEADER_HUAWEI_METADATAS,
  HEADER_GOOGLE_METADATAS,
  HEADER_PERMISSIONS,
];

export const saveResult = async (apps: AnalyzedApk[], resultPath: string) =>
  new Promise(async (resolve, reject) => {
    // transform data
    const data: ExcelRow[] = [];
    apps.forEach((app) => {
      debug(app);
      // keys must equal headers
      // todo: use constants for keys
      const appAsRow: ExcelRow = {};

      appAsRow[HEADER_PACKAGE_NAME] = app.packageName;
      appAsRow[HEADER_VERSION_NAME] = app.versionName;
      appAsRow[HEADER_APK_CREATION_DATE] = app.apkCreationTime;
      appAsRow[HEADER_GOOGLE_METADATAS] = app.uploadDate;
      appAsRow[HEADER_GMS_KITS] = app['GMS'].join(' | ');
      appAsRow[HEADER_HMS_KITS] = app['HMS'].join(' | ');
      appAsRow[HEADER_HUAWEI_APP_ID] = app.huaweiAppId;
      appAsRow[HEADER_ANDROID_MARKET_METADATA] = app.androidMarketMetaData;
      appAsRow[HEADER_HUAWEI_METADATAS] = app.huaweiMetadatas.join(',\n');
      appAsRow[HEADER_GOOGLE_METADATAS] = app.googleMetadatas.join(',\n');
      appAsRow[HEADER_PERMISSIONS] = app.permissions.join(',\n');

      data.push(appAsRow);
    });

    try {
      await writeExcel(data, resultPath);
      resolve(true);
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
const writeExcel = async (data: ExcelRow[], resultPath: string) =>
  new Promise(async (resolve, reject) => {
    const exportFileName = path.basename(resultPath);

    // read from a XLS file

    let sheetName = exportFileName.replace('.xlsx', '');

    // {readFile,utils,writeFile}
    // read from a XLS file
    let workbook;
    try {
      workbook = xlsx.readFile(exportFileName);
    } catch (e) {
      debug(exportFileName + ' not found, will be created');
      // file does not exist
      // create excel  missing
      const emptySheet = xlsx.utils.json_to_sheet([]);
      workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, emptySheet, sheetName);
      try {
        xlsx.writeFileXLSX(workbook, resultPath);
      } catch (e) {
        reject(e);
      }
    }
    // append new content

    // save file

    // get the first sheet
    sheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[sheetName];

    const existingData: ExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

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
      { wch: 50 }, // huawei Metadatas
      { wch: 60 }, // google Metadatas
      { wch: 100 }, // permissions
    ];

    if (wscols.length != HEADERS.length) {
      throw Error('Missing column width');
    }
    worksheet['!cols'] = wscols;
    // worksheet = excel.utils.book(worksheet, data, { headers });

    xlsx.writeFileXLSX(workbook, exportFileName);

    resolve(true);
  });
