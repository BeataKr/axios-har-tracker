import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';
import * as https from 'https';

describe('Check axios-har-tracker', () => {

  let axiosTracker

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
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

    writeFileSync('example302.har', JSON.stringify(generatedHar), 'utf-8')
  });

  xit('should collect call with status 302 - allow unauthorized', async () => {
    try {
      await axios.get('http://httpstat.us/302', { httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      }) });
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
  });

});
