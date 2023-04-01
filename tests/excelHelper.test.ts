import { saveResult, getRowFromApp, HEADERS } from '../src/core/ExcelHelper';

import path from 'path';
import { existsSync, mkdirSync, rmSync, stat, statSync } from 'fs';

import { ExcelRow } from '../src/models/excelRow';
import { exec } from 'child_process';
import { delay } from '../src/core/utils';
import { AnalyzedApp } from '../src/models/analyzedApp';

const uploadDate = 'Mar 31, 2022';
const packageName = 'com.twitter.android.lite';
const app: AnalyzedApp = {
  packageName,
  HMS: ['push', 'ads', 'map'],
  GMS: ['maps', 'location'],
  versionName: '1.0.0',
  uploadDate,
  apkCreationTime: '',
  huaweiAppId: '',
  huaweiMetadata: [],
  googleMetadata: [],
  huaweiPermissions: [],
  googlePermissions: [],
  huaweiActivities: [],
  googleActivities: [],
  googleMessagingServices: [],
  huaweiMessagingServices: [],
  huaweiServices: [],
  googleServices: [],
  others: [],
};
const testTempFolder = path.join(__dirname, 'temp');
const excelPath = path.join(testTempFolder, 'excel.xlsx');

describe('excel helper', () => {
  beforeAll(() => {
    if (!existsSync(testTempFolder)) mkdirSync(testTempFolder);
  });

  afterAll(() => {
    rmSync(testTempFolder, { recursive: true });
  });

  it('should transform data', async () => {
    const row: ExcelRow = await getRowFromApp(app);
    expect(row).toBeTruthy();
    expect(Object.keys(row)).toEqual(HEADERS);
    expect(row[HEADERS[0]]).toEqual(packageName);
    expect(row[HEADERS[2]]).toEqual(uploadDate);
    expect(row[HEADERS[5]]).toMatch(/maps.*location/);
  });

  it('should write excel file', async () => {
    const res = await saveResult([app], excelPath);
    expect(res).toBeTruthy();
    expect(existsSync(excelPath)).toBeTruthy();
  });

  it('should append to excel file', async () => {
    const res = await saveResult([app], excelPath);
    expect(res).toBeTruthy();
    expect(existsSync(excelPath)).toBeTruthy();
    const stat = statSync(excelPath);

    await delay(10);

    const res2 = await saveResult([app], excelPath);
    expect(res2).toBeTruthy();
    expect(existsSync(excelPath)).toBeTruthy();
    const statAfterAppending = statSync(excelPath);

    expect(statAfterAppending.birthtimeMs).toEqual(stat.birthtimeMs);
    expect(statAfterAppending.size > stat.size).toBeTruthy();

    expect(statAfterAppending.ctimeMs > stat.ctimeMs).toBeTruthy();
  });
});
