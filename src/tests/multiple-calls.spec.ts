import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 500', () => {

  let axiosTracker

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

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
    const generatedHar1 = axiosTracker.getGeneratedHar();
    const array = generatedHar1.log.entries;
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

    writeFileSync('example-multi.har', JSON.stringify(generatedHar1), 'utf-8');
  });

  it('should collect with 200 and 404 status', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/404:", error);
    }
    
    const newGeneratedHar = axiosTracker.getGeneratedHar();
    const array = newGeneratedHar.log.entries;
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

    writeFileSync('example-200400.har', JSON.stringify(newGeneratedHar), 'utf-8');
  });

  it('should collect call with status 302 - reject unauthorized', async () => {
    try {
      await axios.get('http://httpstat.us/302');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/302:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/302"
    });
    expect(array.length).toBe(1);

    writeFileSync('example-302.har', JSON.stringify(generatedHar), 'utf-8')
  });

});
