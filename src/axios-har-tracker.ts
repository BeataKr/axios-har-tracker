import { AxiosStatic, AxiosRequestConfig, AxiosPromise } from 'axios';
import * as cookie from 'cookie';

interface HarFile {
  log: {
    version: string,
    creator: {
      name: string,
      version: string
    },
    pages: [],
    entries: []
  }
}

interface NewEntry {
  request: {},
  response: {},
  startedDateTime: string,
  time: number,
  cache: {},
  timings: {
    blocked: number,
    dns: number,
    ssl: number,
    connect: number,
    send: number,
    wait: number,
    receive: number,
    _blocked_queueing: number
  }
};

export class AxiosHarTracker {

  private axios: AxiosStatic;
  // private generatedHar: HarFile;
  private generatedHar: any;
  // private newEntry: NewEntry;
  private newEntry: any;
  private date = new Date();
  private startDate = this.date.toISOString();

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
      startedDateTime: this.startDate,
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

    // let config: AxiosRequestConfig;

    this.axios.interceptors.request.use(
      async config => {
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
        if (resp) {
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
          return resp;
        }
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  public getGeneratedHar() {
    const enteriesContent = Object.assign({}, this.newEntry);
    return this.generatedHar.log.entries.push(enteriesContent);
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

// export function axiosHarTracker(requestModule) {
//   return new AxiosHarTracker(requestModule)
// }
