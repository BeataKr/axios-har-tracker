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
      console.log("DEBUG getHar from afterAll",getHar)
      writeFileSync('example.har', JSON.stringify(getHar), 'utf-8')
    });

    it('should get har from call which returns 200', async () => {
      const res1 = await axios.get('http://httpstat.us/200');
      console.log("DEBU res1:", res1)
      getHar = axiosTracker.getGeneratedHar();
      console.log("DEBUG getHar with 200",getHar)
    });

    it('should get har from call which returns 300', async () => {
      const res2 = await axios.get('http://httpstat.us/300');
      console.log("DEBU res2:", res2)
      getHar = axiosTracker.getGeneratedHar();
      console.log("DEBUG getHar with 200 and 300",getHar)
      // TODO
    });

    it('should get har from call which returns 302', async () => {
      const res3 = await axios.get('http://httpstat.us/302');
      console.log("DEBU response:", res3)
      getHar = axiosTracker.getGeneratedHar();
      // TODO
    });

    it('should get har from call which returns 404', async () => {
      const res4 = await axios.get('http://httpstat.us/404');
      console.log("DEBU response:", res4)
      getHar = axiosTracker.getGeneratedHar();
      // TODO
    });

    it('should get har from call which returns 500', async () => {
      const res5 = await axios.get('http://httpstat.us/500');
      console.log("DEBU response:", res5)
      getHar = axiosTracker.getGeneratedHar();
      // TODO
    });

});
