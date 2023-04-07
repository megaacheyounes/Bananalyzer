import { analyzeTrackingSdks } from './../src/core/analyzer/AnalyzeTrackingSdks';
import { decompileApk } from '../src/core/apktool/decompile';
import path from 'path';
import fs from 'fs';

import { analyzeAPKs } from '../src/core/analyzer';
import { ANDROID_MANIFEST } from '../src/consts';

import debugModule from 'debug';

debugModule.enable('*');

//normal apk
const sampleDecompiledApk = path.join(__dirname, 'samples', 'decompile.sample.apk');

describe('Decompiler', () => {
  it('should decompile apk', async () => {
    const result = await analyzeTrackingSdks(sampleDecompiledApk);

    expect(result).toBeTruthy();
    expect(result.sdksNumber).toBeGreaterThanOrEqual(1);
  }, 30_000);
});
