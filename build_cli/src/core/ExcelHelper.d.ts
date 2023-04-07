import { AnalyzedApp } from '../utils/models/analyzedApp';
import { ExcelRow } from '../utils/models/excelRow';
export declare const HEADERS: string[];
export declare const getRowFromApp: (app: AnalyzedApp) => ExcelRow;
export declare const saveResult: (apps: AnalyzedApp[], resultPath: string) => Promise<boolean>;
