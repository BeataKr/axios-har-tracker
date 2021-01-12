import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 200 and 404', () => {

  let axiosTracker1, axiosTracker2

  beforeEach(async () => {
    axiosTracker1 = new AxiosHarTracker(axios);
    axiosTracker2 = new AxiosHarTracker(axios);
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
  });

  it('should collect multiple calls', async () => {
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
