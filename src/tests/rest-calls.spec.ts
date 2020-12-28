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
      writeFileSync('example.har', JSON.stringify(getHar), 'utf-8')
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

    it('should get har which includes status 302 and previous request with a response', async () => {
      await axios.get('http://httpstat.us/302');
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
        "url": "http://httpstat.us/302"
      });
      expect(array[1].response).toMatchObject({
        "status": 302,
        "statusText": "Found"
      });
      expect(array[2]).toBeUndefined();
    });

    it('should get har which includes status 404 and all previous requests with responses', async () => {
      await axios.get('http://httpstat.us/302');
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
        "url": "http://httpstat.us/302"
      });
      expect(array[1].response).toMatchObject({
        "status": 302,
        "statusText": "Found"
      });
      expect(array[2].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/404"
      });
      expect(array[2].response).toMatchObject({
        "status": 404,
        "statusText": "Not Found"
      });
      expect(array[3]).toBeUndefined();
    });

    it('should get har which includes status 500 and all previous requests with responses', async () => {
      await axios.get('http://httpstat.us/500');
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
        "url": "http://httpstat.us/302"
      });
      expect(array[1].response).toMatchObject({
        "status": 302,
        "statusText": "Found"
      });
      expect(array[2].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/404"
      });
      expect(array[2].response).toMatchObject({
        "status": 404,
        "statusText": "Not Found"
      });
      expect(array[3].request).toMatchObject({
        "method": "get",
        "url": "http://httpstat.us/500"
      });
      expect(array[3].response).toMatchObject({
        "status": 500,
        "statusText": "Not Implemented"
      });
      expect(array[4]).toBeUndefined();
    });

});
