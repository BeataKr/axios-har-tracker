import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'

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
  });

});
