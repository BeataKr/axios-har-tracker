import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker', () => {

    let axiosTracker, getHar

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    beforeEach(async () => {
    });

    afterAll(() => {
      writeFileSync('example300.har', JSON.stringify(getHar), 'utf-8')
    });

    it('should get har which includes status 302 and previous request with a response', async () => {
      const respFrom302 = await axios.get('http://httpstat.us/302');
      console.log("DEBUG respFrom302:", respFrom302)
      getHar = axiosTracker.getGeneratedHar();
      const array = getHar.log.entries;
      expect(array[0].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/302"
      });
      expect(array[0].response).toMatchObject({
        "status": 302,
        "statusText": "Found"
      });
      expect(array[1]).toBeUndefined();
    });

});
