import path from 'path';
import fs from 'fs';

import debugModule from 'debug';
import { parseManifest } from '../src/utils/manifestParser';
import { getAndroidManifestData, transformToManifest } from '../src/utils/manifestReader';

debugModule.enable('*');
const fileName = 'manifest.twitter.xml';
const sampleManifestPath = path.join(__dirname, 'samples', fileName);
const sampleManifestFinalResultPath = path.join(__dirname, 'samples', fileName + '.final.json');

describe('Transform manifest', () => {
  it('should transform manifest json to developer friendly structure', async () => {
    const finalManifest = await getAndroidManifestData(sampleManifestPath);

    fs.writeFileSync(sampleManifestFinalResultPath, JSON.stringify(finalManifest));

    expect(finalManifest).toBeTruthy();
  }, 30_000);
});
