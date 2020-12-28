import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import MockAdapter from 'axios-mock-adapter';

describe('Check axios-har-tracker', () => {

    let axiosTracker, axiosMock, trackerMock, getHar
    let fakeCallResponse = {
      request: {
        method: 'get',
        url: 'http://fakeUrl',
        httpVersion: 'HTTP/1.1',
        cookies: [],
        headers: [],
        queryString: [],
        headersSize: -1,
        bodySize: -1
      },
      response: {
        status: 200,
        statusText: 'OK',
        headers: [Array],
        startedDateTime: '2020-12-16T10:53:02.000Z',
        time: 140737012,
        httpVersion: 'HTTP/1.1',
        cookies: [],
        bodySize: 13882,
        redirectURL: '',
        headersSize: -1,
        content: [Object],
        cache: {},
        timings: [Object]
      },
      startedDateTime: '2020-12-16T10:53:02.034Z',
      time: -1,
      cache: {},
      timings: {
        blocked: -1,
        dns: -1,
        ssl: -1,
        connect: -1,
        send: 10,
        wait: 10,
        receive: 10,
        _blocked_queueing: -1
      }
    };

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
      axiosMock = new MockAdapter(axios);
      axiosMock.onGet("http://fakeUrl").reply(200, fakeCallResponse);
    });

    beforeEach(async () => {
      axiosMock = new MockAdapter(axios);
      axiosMock.onGet("http://fakeUrl").reply(200, fakeCallResponse);
    });

    afterAll(() => {
      jest.clearAllMocks();
      axiosMock.restore();
    });

    it('should check proper form for generated har', async () => {
      trackerMock = jest.spyOn(axiosTracker, 'getGeneratedHar');
      axios.get("http://fakeUrl");
      getHar = axiosTracker.getGeneratedHar();

      let fakeHarContent = {
        "log": {
          "creator": {
            "name": "axios-har-tracker",
                  "version": "1.0.0"
              },
              "entries": [
                  {
                      "cache": {},
                      "request": {},
                      "response": {},
                      "startedDateTime": '',
                      "time": -1,
                      "timings": {
                          "_blocked_queueing": -1,
                          "blocked": -1,
                          "connect": -1,
                          "dns": -1,
                          "receive": 10,
                          "send": 10,
                          "ssl": -1,
                          "wait": 10
                      }
                  }
              ],
              "pages": [],
              "version": "1.2"
          }
      }

      expect(trackerMock).toHaveBeenCalled();
      expect(trackerMock).toHaveBeenCalledWith();
      expect(trackerMock).toReturnWith(fakeHarContent);
    });

});
