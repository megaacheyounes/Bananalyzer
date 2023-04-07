'use strict';
import debugModule from 'debug';
import path from 'path';
import xlsx from 'xlsx';

import { AnalyzedApk, AnalyzedApp } from '../utils/models/analyzedApp';
import { ExcelRow } from '../utils/models/excelRow';
import { IS_PROD } from '../consts';

const debug = debugModule('excleHelper');

const HEADER_PACKAGE_NAME = 'Package name'; //
const HEADER_VERSION_NAME = 'Version name';
const HEADER_APK_CREATION_DATE = 'APK creation date';
const HEADER_GOOGLE_PLAY_UPDATE_DATE = 'Google Play update date';
const HEADER_GMS_KITS = 'GMS kits';
const HEADER_HMS_KITS = 'HMS kits';
const HEADER_HUAWEI_APP_ID = 'Huawei App Id';

const HEADER_HUAWEI_METADATAS = 'Huawei Metadatas';
const HEADER_GOOGLE_METADATAS = 'Google Metadatas';

const HEADER_GOOGLE_PERMISSIONS = 'Google Permissions';
const HEADER_HUAWEI_PERMISSIONS = 'Huawei Permissions';

const HEADER_GOOGLE_ACTIVITIES = 'Google activities';
const HEADER_HUAWEI_ACTIVITIES = 'Huawei activities';

const HEADER_GOOGLE_SERVICES = 'Google Servicies';
const HEADER_HUAWEI_SERVICES = 'Huawei Servicies';

const HEADER_GOOGLE_MESSAGING_SERVICES = 'Google Messaging Services';
const HEADER_HUAWEI_MESSAGING_SERVICES = 'Huawei Messaging Services';
const HEADER_OTHERS = 'Others';

// 3- write to excel file
export const HEADERS = [
  HEADER_PACKAGE_NAME,
  HEADER_VERSION_NAME,
  HEADER_GOOGLE_PLAY_UPDATE_DATE,
  HEADER_APK_CREATION_DATE,
  HEADER_HUAWEI_APP_ID,

  HEADER_GMS_KITS,
  HEADER_HMS_KITS,
  HEADER_GOOGLE_METADATAS,
  HEADER_HUAWEI_METADATAS,
  HEADER_GOOGLE_PERMISSIONS,
  HEADER_HUAWEI_PERMISSIONS,
  HEADER_GOOGLE_ACTIVITIES,
  HEADER_HUAWEI_ACTIVITIES,
  HEADER_GOOGLE_SERVICES,
  HEADER_HUAWEI_SERVICES,
  HEADER_GOOGLE_MESSAGING_SERVICES,
  HEADER_HUAWEI_MESSAGING_SERVICES,
  HEADER_OTHERS,
];

export const getRowFromApp = (app: AnalyzedApp): ExcelRow => {
  const appAsRow: ExcelRow = {};
  const asString = (arr: string[]) => (arr || []).join(',\n');
  appAsRow[HEADER_PACKAGE_NAME] = app.packageName;
  appAsRow[HEADER_VERSION_NAME] = app.versionName;
  appAsRow[HEADER_GOOGLE_PLAY_UPDATE_DATE] = app.uploadDate;
  appAsRow[HEADER_APK_CREATION_DATE] = app.apkCreationTime;
  appAsRow[HEADER_HUAWEI_APP_ID] = app.huaweiAppId;

  appAsRow[HEADER_GMS_KITS] = (app['GMS'] || []).join(' | ');
  appAsRow[HEADER_HMS_KITS] = (app['HMS'] || []).join(' | ');

  appAsRow[HEADER_GOOGLE_METADATAS] = asString(app.googleMetadata);
  appAsRow[HEADER_HUAWEI_METADATAS] = asString(app.huaweiMetadata);

  appAsRow[HEADER_GOOGLE_PERMISSIONS] = asString(app.googlePermissions);
  appAsRow[HEADER_HUAWEI_PERMISSIONS] = asString(app.huaweiPermissions);

  appAsRow[HEADER_GOOGLE_ACTIVITIES] = asString(app.googleActivities);
  appAsRow[HEADER_HUAWEI_ACTIVITIES] = asString(app.huaweiActivities);

  appAsRow[HEADER_GOOGLE_SERVICES] = asString(app.googleServices);
  appAsRow[HEADER_HUAWEI_SERVICES] = asString(app.huaweiServices);

  appAsRow[HEADER_GOOGLE_MESSAGING_SERVICES] = asString(app.googleMessagingServices);
  appAsRow[HEADER_HUAWEI_MESSAGING_SERVICES] = asString(app.huaweiMessagingServices);

  appAsRow[HEADER_OTHERS] = asString(app.others || []);

  return appAsRow;
};

export const saveResult = async (apps: AnalyzedApp[], resultPath: string) =>
  new Promise<boolean>(async (resolve, reject) => {
    // transform data
    const data: ExcelRow[] = [];
    apps.forEach(async (app) => {
      debug(app);
      const row = getRowFromApp(app);

      data.push(row);
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
 * @param {array} data array of data to write into excel, inner object keys must match the values of @param headers,
 *  example: data = [
 * { columnA: 1, columnB: 2, columnC: 3 },
 * { columnA: 4, columnB: 5, columnC: 6 },
 * { columnA: 7, columnB: 8, columnC: 9 }
 * ]
 * @param {array} resultPath excel path
 * @return {Promise}
 */
const writeExcel = async (data: ExcelRow[], resultPath: string) =>
  new Promise<boolean>(async (resolve, reject) => {
    const exportFileName = path.basename(resultPath);
    // read from a XLS file
    let sheetName = exportFileName.replace('.xlsx', '');
    if (sheetName.length > 30) sheetName = sheetName.substring(0, 30);
    // {readFile,utils,writeFile}
    // read from a XLS file
    let workbook;
    try {
      workbook = xlsx.readFile(resultPath);
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
      { wch: 25 }, // 'Google Play update date'
      { wch: 25 }, // 'APK creation dat
      { wch: 20 }, // hauwei app id

      { wch: 40 }, // gms kits
      { wch: 40 }, // hms kits

      { wch: 50 }, // google Metadatas
      { wch: 50 }, // huawei Metadatas

      { wch: 50 }, // google permissions
      { wch: 50 }, // hauwei permissions

      { wch: 50 }, // google activities
      { wch: 50 }, // hauwei activities

      { wch: 50 }, // google services
      { wch: 50 }, // hauwei services

      { wch: 50 }, // google messaging services
      { wch: 50 }, // hauwei messaging services
      { wch: 50 }, // other
    ];

    if (!IS_PROD && wscols.length != HEADERS.length) {
      throw Error(`Missing column width, headers=${HEADERS.length} wscols=${wscols.length}`);
    }
    worksheet['!cols'] = wscols;
    // worksheet = excel.utils.book(worksheet, data, { headers });

    try {
      xlsx.writeFileXLSX(workbook, resultPath);
    } catch (e) {
      reject(e);
    }
    resolve(true);
  });
