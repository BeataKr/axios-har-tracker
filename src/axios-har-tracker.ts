import { AxiosStatic } from 'axios';
import * as cookie from 'cookie';

export class AxiosHarTracker {

  private axios: AxiosStatic;
  private generatedHar;
  private newEntry;
  private enteriesContent

  constructor(requestModule: AxiosStatic) {
    this.axios = requestModule;

    this.generatedHar = {
      log: {
        version: '1.2',
        creator: {
          name: 'axios-tracker',
          version: '1.0.0'
        },
        pages: [],
        entries: []
      }
    };

    this.newEntry = {
      request: {},
      response: {},
      startedDateTime: new Date().toISOString(),
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

    this.axios.interceptors.request.use(

      async config => {
        this.resetNewEntry();
        config.validateStatus = function () {
          return true;
        };
        config.headers['request-startTime'] = process.hrtime();
        const fullCookie = JSON.stringify(config.headers['Cookie']);
        // const version = config.httpVersion === undefined ? 'HTTP/1.1' : 'HTTP/' + config.httpVersion;
        const version = 'HTTP/1.1';

        this.newEntry.request = {
          method: config.method,
          url: config.url,
          httpVersion: version,
          cookies: this.getCookies(fullCookie),
          headers: [],
          queryString: this.getParams(config.params),
          headersSize: -1,
          bodySize: -1
        };
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      async resp => {
        this.newEntry.response = {
          status: resp.status,
          statusText: resp.statusText,
          headers: this.getHeaders(resp.headers),
          startedDateTime: new Date(resp.headers.date),
          time: resp.headers['request-duration'] = Math.round(
            process.hrtime(resp.headers['request-startTime'])[0] * 1000 +
              process.hrtime(resp.headers['request-startTime'])[1] / 1000000
          ),
          httpVersion: `HTTP/${resp.request.res.httpVersion}`,
          cookies: this.getCookies(JSON.stringify(resp.config.headers['Cookie'])),
          bodySize: JSON.stringify(resp.data).length,
          redirectURL: '',
          headersSize: -1,
          content: {
            size: JSON.stringify(resp.data).length,
            mimeType: resp.headers['content-type'] ? resp.headers['content-type'] : 'text/plain',
            text: JSON.stringify(resp.data)
          },
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
        this.enteriesContent = Object.assign({}, this.newEntry);
        this.generatedHar.log.entries.push(this.enteriesContent);
        return resp;
      },
      error => {
        this.generatedHar.log.entries.push(this.enteriesContent);
        return Promise.reject(error);
      }
    );
  }

  private resetNewEntry () {
    this.newEntry = {}
  }

  public getGeneratedHar() {
    return this.generatedHar;
  }

  private transformObjectToArray(obj) {
    const results = Object.keys(obj).map(key => {
      return {
        name: key,
        value: obj[key].toString()
      };
    });
    return obj ? results : [];
  }

  private getCookies(fullCookie: string) {
    if (fullCookie) {
      const parsedCookie = cookie.parse(fullCookie);
      return this.transformObjectToArray(parsedCookie);
    } else return [];
  }

  private getParams(params) {
    if (params !== undefined) {
      return this.transformObjectToArray(params);
    } else return [];
  }

  private getHeaders(headersObject) {
    if (headersObject !== undefined) {
      return this.transformObjectToArray(headersObject);
    } else return [];
  }

}
