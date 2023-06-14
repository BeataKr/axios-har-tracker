import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker';
import * as fse from 'fs-extra';

describe('axios-har-tracker e2e tests', () => {

  let axiosTracker

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

  beforeAll(async () => {
    fse.ensureDir('./harfiles');
  });

  it('Should collect call with status 200', async () => {
    try {
      await axios.get('http://httpstat.us/200');
    } catch (error) {
      console.log("An expected error appears after call to https:\/\/httpstat.us\/200");
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/200"
    });
    expect(array[0].response).toMatchObject({
      "status": 200,
      "statusText": "OK"
    });
    expect(array.length).toBe(1);

    await fse.writeJson('./harfiles/example-200.har', generatedHar);
  });

  it('Should collect call to 302 - reject unauthorized', async () => {
    try{
      const response302 = await axios.get('http://httpstat.us/302');
      console.log("DEBUG response302",response302)
    } catch (error){
      console.log("An expected error appears after call to https:\/\/httpstat.us\/302");
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/302"
    });
    expect(array.length).toBe(1);

    await fse.writeJson('./harfiles/example-302.har', generatedHar);
  });

  it('Should collect call with status 404', async () => {
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An expected error appears after call to https:\/\/httpstat.us\/404");
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/404"
    });
    expect(array[0].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array.length).toBe(1);

    await fse.writeJson('./harfiles/example-404.har', generatedHar);
  });

  it('Should collect call with status 500', async () => {
    try {
      await axios.get('http://httpstat.us/500');
    } catch (error) {
      console.log("An expected error appears after call to https:\/\/httpstat.us\/500");
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/500"
    });
    expect(array[0].response).toMatchObject({
      "status": 500,
      "statusText": "Internal Server Error"
    });
    expect(array.length).toBe(1);

    await fse.writeJson('./harfiles/example-500.har', generatedHar);
  });

  it('Should collect concurrent calls', async () => {
    function fetch (url) {
      function wrap (resolve, reject) {
        axios.get(url)
          .then(resolve)
          .catch((error) => {
            console.log('error while fetching', url, error);
            resolve();
          });
      }
      return new Promise(wrap);
    }

    return Promise.all([
      fetch('http://httpstat.us/200?msg=A'),
      fetch('http://httpstat.us/200?msg=hello'),
      fetch('http://httpstat.us/200?msg=C'),
      fetch('http://httpstat.us/200?msg=D')
    ]).then(async (results) => {
      console.log("OUT RESULTS", results);
      const generatedHar = axiosTracker.getGeneratedHar();
      const array = generatedHar.log.entries;
      console.log("OUT ENTRIES", array);
      expect(array.length).toBe(4);
      await fse.writeJson('./harfiles/example-multiple-concurrent-test.har', generatedHar);
    });
  });

  it('Should collect multiple calls', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/302');
    } catch (error) {
      console.log("An expected error appears after call to https:\/\/httpstat.us\/302");
    }
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An expected error appears after call to http:\/\/httpstat.us\/404");
    }
    try {
      await axios.get('http://httpstat.us/500');
    } catch (error) {
      console.log("An expected error appears after call to http:\/\/httpstat.us\/500");
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/200"
    });
    expect(array[0].response).toMatchObject({
      "status": 200,
      "statusText": "OK"
    });
    expect(array[1].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/302"
    });
    expect(array[2].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/404"
    });
    expect(array[2].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array[3].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/500"
    });
    expect(array[3].response).toMatchObject({
      "status": 500,
      "statusText": "Internal Server Error"
    });
    expect(array.length).toBe(4);

    await fse.writeJson('./harfiles/example-multi.har', generatedHar);
  });

});
