import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 500', () => {

  let axiosTracker, axiosTracker1, axiosTracker2

  beforeAll(async () => {
    axiosTracker = new AxiosHarTracker(axios);
    axiosTracker1 = new AxiosHarTracker(axios);
    axiosTracker2 = new AxiosHarTracker(axios);
  });

  beforeEach(async () => {
    const generatedHar = {};
    // const array = [];
  })

  it('should collect multiple calls', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/404:", error);
    }
    try {
      await axios.get('http://httpstat.us/500');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/500:", error);
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
      "url": "http://httpstat.us/404"
    });
    expect(array[1].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array[2].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/500"
    });
    expect(array[2].response).toMatchObject({
      "status": 500,
      "statusText": "Internal Server Error"
    });
    expect(array.length).toBe(3);

    writeFileSync('example-multi.har', JSON.stringify(generatedHar), 'utf-8');
  });

  it('should collect call with status 200', async () => {
    await axios.get('http://httpstat.us/200');
    const generatedHar = axiosTracker1.getGeneratedHar();
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
  });

  it('should collect call with status 404', async () => {
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/404:", error);
    }
    const generatedHar = axiosTracker1.getGeneratedHar();
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

    writeFileSync('example-200and400.har', JSON.stringify(generatedHar), 'utf-8');
  });

  it('should collect with 200 and 404 status', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/404:", error);
    }
    const generatedHar = axiosTracker2.getGeneratedHar();
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
      "url": "http://httpstat.us/404"
    });
    expect(array[1].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array.length).toBe(2);
  });

});
