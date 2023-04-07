import Bananalyzer from 'bananalyzer';

(async () => {
  // const dl = await Bananalyzer.getDownloadLink('com.aswat.carrefouruae');
  // console.log('dl', dl);

  const result = await Bananalyzer.analyzeAPKs(
    [
      {
        //todo: set apk path
        filePath: '../tests/samples/sample.apk',
      },
    ],
    true
  );
  console.log('result', result);
})();
