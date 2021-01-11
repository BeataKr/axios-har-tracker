import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 200 and 404', () => {

  let axiosTracker, generatedHar

  beforeAll(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

  afterAll(() => {
    writeFileSync('example-200-and-400.har', JSON.stringify(generatedHar), 'utf-8');
  });

  it('should collect call with status 200', async () => {
    await axios.get('http://httpstat.us/200');
    generatedHar = axiosTracker.getGeneratedHar();
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
      console.log("An error appears:", error);
    }
    generatedHar = axiosTracker.getGeneratedHar();
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

  it('should collect multiple calls', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears:", error);
    }
    generatedHar = axiosTracker.getGeneratedHar();
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
    expect(array.length).toBe(4);
  });


});
