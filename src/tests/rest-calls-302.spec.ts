import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import { writeFileSync } from 'fs';

describe('Check axios-har-tracker', () => {

    let axiosTracker, generatedHar

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    afterAll(() => {
      writeFileSync('example302.har', JSON.stringify(generatedHar), 'utf-8')
    });

    it('should get har which includes status 302 and previous request with a response', async () => {
      try{
        await axios.get('http://httpstat.us/302');
      } catch(error){
        console.log("An error appears:",error);
      }
      generatedHar = axiosTracker.getGeneratedHar();
      const array = generatedHar.log.entries;
      expect(array[0].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/302"
      });
      expect(array.length).toBe(1);
    });

});
