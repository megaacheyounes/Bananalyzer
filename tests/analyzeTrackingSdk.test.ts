import path from 'path';
import { analyzeTrackingSdks } from './../src/core/analyzer/AnalyzeTrackingSdks';

import debugModule from 'debug';

debugModule.enable('*');

//normal apk
const sampleDecompiledApk = path.join(__dirname, '..', 'decompile', 'sample.apk');

//todo: add tests
describe('TrackingSDK analyzer', () => {});
