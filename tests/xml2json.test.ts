import { xml2json } from './../src/utils/xml2json';
import { analyzeTrackingSdks } from './../src/core/analyzer/AnalyzeTrackingSdks';
import { decompileApk } from '../src/core/apktool/decompile';
import path from 'path';
import fs from 'fs';

import debugModule from 'debug';

debugModule.enable('*');
const fileName = 'AndroidManifest2.xml';
const sampleManifestPath = path.join(__dirname, 'samples', fileName);
const sampleManifestResultPath = path.join(__dirname, 'samples', fileName + '.json');

describe('parse manifest', () => {
  it('should convert xml to json', async () => {
    const xmlContent = fs.readFileSync(sampleManifestPath, 'utf-8');
    const json = await xml2json(xmlContent);
    fs.writeFileSync(sampleManifestResultPath, JSON.stringify(json));

    console.log(json);
    expect(json).toBeTruthy();
  }, 30_000);
});
