import axios from 'axios';
import {AxiosHarTracker} from '../axios-har-tracker';

describe('axios-har-tracker e2e tests', () => {
  describe('multiple instances', () => {
    it('each instance collects events', async () => {
      const tracker1 = new AxiosHarTracker(axios);
      const tracker2 = new AxiosHarTracker(axios);
      await axios.get('http://httpstat.us/200');
      await axios.get('http://httpstat.us/200');

      const entries1 = tracker1.getGeneratedHar().log.entries;
      const entries2 = tracker2.getGeneratedHar().log.entries;
      expect(entries1).toHaveLength(2);
      expect(entries2).toHaveLength(2);
    });

    it('stopped instance does not interfere w/ other instances', async () => {
      const tracker1 = new AxiosHarTracker(axios);
      const tracker2 = new AxiosHarTracker(axios);
      await axios.get('http://httpstat.us/200/one');
      tracker2.stopTracking();
      await axios.get('http://httpstat.us/200/two');

      const entries1 = tracker1.getGeneratedHar().log.entries;
      const entries2 = tracker2.getGeneratedHar().log.entries;
      expect(entries1).toHaveLength(2);
      expect(entries2).toHaveLength(1);


      expect(entries1).toEqual(expect.arrayContaining([
        expect.objectContaining({
          request: expect.objectContaining({
            "method": "get",
            "url": "http://httpstat.us/200/one"
          })
        })]));
      expect(entries2).toEqual(expect.arrayContaining([
        expect.objectContaining({
          request: expect.objectContaining({
            "method": "get",
            "url": "http://httpstat.us/200/one"
          })
        })]));

      expect(entries1).toEqual(expect.arrayContaining([
        expect.objectContaining({
          request: expect.objectContaining({
            "method": "get",
            "url": "http://httpstat.us/200/two"
          })
        })]));
      // expect the ABSENCE of the second request
      expect(entries2).not.toEqual(expect.arrayContaining([
        expect.objectContaining({
          request: expect.objectContaining({
            "method": "get",
            "url": "http://httpstat.us/200/two"
          })
        })]));
    })
  });
});