import { transformToManifest } from './../src/utils/transformerManifest';
import { xml2json } from '../src/utils/xml2json';
import { analyzeTrackingSdks } from '../src/core/analyzer/AnalyzeTrackingSdks';
import { decompileApk } from '../src/core/apktool/decompile';
import path from 'path';
import fs from 'fs';

import debugModule from 'debug';

debugModule.enable('*');
const fileName = 'AndroidManifest2.xml';
const sampleManifestPath = path.join(__dirname, 'samples', fileName);
const sampleManifestFinalResultPath = path.join(__dirname, 'samples', fileName + '.final.json');

describe('Transform manifest', () => {
  it('should transform manifest json to developer friendly structure', async () => {
    const xmlContent = fs.readFileSync(sampleManifestPath, 'utf-8');
    const manifestAsJson = await xml2json(xmlContent);
    const finalManifest = transformToManifest(manifestAsJson);

    fs.writeFileSync(sampleManifestFinalResultPath, JSON.stringify(finalManifest));

    expect(finalManifest).toBeTruthy();
  }, 30_000);
});
