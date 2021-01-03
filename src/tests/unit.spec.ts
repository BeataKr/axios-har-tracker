import axios from 'axios';
import { AxiosHarTracker } from '../axios-har-tracker'
import MockAdapter from 'axios-mock-adapter';

describe('Check axios-har-tracker', () => {

    let axiosTracker, axiosMock, trackerMock, getHar
    let fakeCallResponse = {
      "response": {
          "status": 200,
          "statusText": "OK",
          "headers": [
              {
                  "name": "content-type",
                  "value": "application/json; charset=utf-8"
              },
              {
                  "name": "cache-control",
                  "value": "private"
              },
              {
                  "name": "request-context",
                  "value": "appId=cid-v1:7585021b-2db7-4da6-abff-2cf23005f0a9"
              }
          ],
          "startedDateTime": null,
          "time": 517321533,
          "httpVersion": "HTTP/1.1",
          "cookies": [],
          "bodySize": 31,
          "redirectURL": "",
          "headersSize": -1,
          "content": {
              "size": 31,
              "mimeType": "application/json; charset=utf-8",
              "text": "{\"code\":200,\"description\":\"OK\"}"
          },
          "cache": {},
          "timings": {
              "blocked": -1,
              "dns": -1,
              "ssl": -1,
              "connect": -1,
              "send": 10,
              "wait": 10,
              "receive": 10,
              "_blocked_queueing": -1
          }
      },
      "startedDateTime": "2021-01-03T12:01:45.403Z",
      "time": -1,
      "cache": {},
      "timings": {
          "blocked": -1,
          "dns": -1,
          "ssl": -1,
          "connect": -1,
          "send": 10,
          "wait": 10,
          "receive": 10,
          "_blocked_queueing": -1
      }
    };

    beforeAll(async () => {
      axiosTracker = new AxiosHarTracker(axios);
      axiosMock = new MockAdapter(axios);
      axiosMock.onGet("http://fakeUrl").reply(200, fakeCallResponse);
    });

    afterAll(() => {
      jest.clearAllMocks();
      axiosMock.restore();
    });

    it('should check proper form for generated har', async () => {
      trackerMock = jest.spyOn(axiosTracker, 'getGeneratedHar');
      axios.get('http://fakeUrl');
      getHar = axiosTracker.getGeneratedHar();

      let fakeHarContent = {
        "log": {
          "creator": {
            "name": "axios-har-tracker",
            "version": "0.1.0"
              },
              "entries": [
                {
                  "request": {
                      "method": "get",
                      "url": "http://fakeUrl",
                      "httpVersion": "HTTP/1.1",
                      "cookies": [],
                      "headers": [
                          {
                              "name": "Accept",
                              "value": "application/json, text/plain, */*"
                          }
                      ],
                      "queryString": [],
                      "headersSize": -1,
                      "bodySize": -1
                  },
                  "response": {
                      "status": 200,
                      "statusText": "OK",
                      "headers": [
                          {
                              "name": "content-type",
                              "value": "application/json; charset=utf-8"
                          },
                          {
                              "name": "cache-control",
                              "value": "private"
                          },
                          {
                              "name": "request-context",
                              "value": "appId=cid-v1:7585021b-2db7-4da6-abff-2cf23005f0a9"
                          }
                      ],
                      "startedDateTime": null,
                      "time": 519705412,
                      "httpVersion": "HTTP/1.1",
                      "cookies": [],
                      "bodySize": 31,
                      "redirectURL": "",
                      "headersSize": -1,
                      "content": {
                          "size": 31,
                          "mimeType": "application/json; charset=utf-8",
                          "text": "{\"code\":200,\"description\":\"OK\"}"
                      },
                      "cache": {},
                      "timings": {
                          "blocked": -1,
                          "dns": -1,
                          "ssl": -1,
                          "connect": -1,
                          "send": 10,
                          "wait": 10,
                          "receive": 10,
                          "_blocked_queueing": -1
                      }
                  },
                  "startedDateTime": "2021-01-03T12:01:45.403Z",
                  "time": -1,
                  "cache": {},
                  "timings": {
                      "blocked": -1,
                      "dns": -1,
                      "ssl": -1,
                      "connect": -1,
                      "send": 10,
                      "wait": 10,
                      "receive": 10,
                      "_blocked_queueing": -1
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
