import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 500', () => {

    let axiosTracker, getHar

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    afterAll(() => {
      writeFileSync('example500.har', JSON.stringify(getHar), 'utf-8');
    });

    it('should get har which includes status 500 and all previous requests with responses', async () => {
      await axios.get('http://httpstat.us/500');
      getHar = axiosTracker.getGeneratedHar();
      const array = getHar.log.entries;
      expect(array[0].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/500"
      });
      expect(array[0].response).toMatchObject({
        "status": 500,
        "statusText": "Internal Server Error"
      });
      expect(array[1]).toBeUndefined();
    });

});
