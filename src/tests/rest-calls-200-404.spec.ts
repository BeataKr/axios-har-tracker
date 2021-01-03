import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker for status 200 and 404', () => {

    let axiosTracker, getHar

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    afterAll(() => {
      writeFileSync('example200404.har', JSON.stringify(getHar), 'utf-8')
    });

    it('should get har which includes status 200', async () => {
      await axios.get('http://httpstat.us/200');
      getHar = axiosTracker.getGeneratedHar();
      const array = getHar.log.entries;
      expect(array[0].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/200"
      });
      expect(array[0].response).toMatchObject({
        "status": 200,
        "statusText": "OK"
      });
      expect(array[1]).toBeUndefined();
    });

    it('should get har which includes status 404 and all previous requests with responses', async () => {
      await axios.get('http://httpstat.us/404');
      getHar = axiosTracker.getGeneratedHar();
      const array = getHar.log.entries;
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
      expect(array[2]).toBeUndefined();
    });

});
