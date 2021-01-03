import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';
import * as https from 'https';

describe('Check axios-har-tracker', () => {

    let axiosTracker, getHar, agent

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    afterAll(() => {
      writeFileSync('example302.har', JSON.stringify(getHar), 'utf-8')
    });

    it('should get har which includes status 302 and previous request with a response', async () => {
      await axios.get('http://httpstat.us/302');
      getHar = axiosTracker.getGeneratedHar();
      const array = getHar.log.entries;
      expect(array[0].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/302"
      });
      expect(array[1]).toBeUndefined();
    });

});
