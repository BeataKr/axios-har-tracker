import { AxiosStatic } from 'axios';
import * as cookie from 'cookie';

interface HarFile {
  log: {
    version: string,
    creator: {
      name: string,
      version: string
    },
    pages: [],
    entries: string[];
  }
};

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
  private generatedHar: HarFile;
  private newEntry: NewEntry;
  private entriesContent;
  private date = new Date().toISOString();

  constructor(requestModule: AxiosStatic) {
    this.axios = requestModule;

    this.generatedHar = {
      log: {
        version: '1.2',
        creator: {
          name: 'axios-har-tracker',
          version: '1.0.0'
        },
        pages: [],
        entries: [] 
      }
    };

    this.newEntry = {
      request: {},
      response: {},
      startedDateTime: this.date,
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

        config.headers['request-startTime'] = process.hrtime();
        const fullCookie = JSON.stringify(config.headers['Cookie']);

        this.newEntry.request = {
          method: config.method,
          url: config.url,
          httpVersion: 'HTTP/1.1',
          cookies: this.getCookies(fullCookie),
          headers: this.getHeaders(config.headers['common']),
          queryString: this.getParams(config.params),
          headersSize: -1,
          bodySize: -1
        };
        return config;
      },
      async error => {
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      async resp => {
        this.newEntry.response = {
          status: resp.status,
          statusText: resp.statusText,
          headers: this.getHeaders(resp.headers),
          startedDateTime : new Date(resp.headers.date),
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
        this.entriesContent = Object.assign({}, this.newEntry);
        this.generatedHar.log.entries.push(this.entriesContent);
        return resp;
      },
      async error => {
        this.errorHandler(error);
        let resp = error.response;
        this.newEntry.response = {
          status: resp.status,
          statusText: resp.statusText,
          headers: this.getHeaders(resp.headers),
          startedDateTime : new Date(resp.headers.date),
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
        this.entriesContent = Object.assign({}, this.newEntry);
        this.generatedHar.log.entries.push(this.entriesContent);
        return resp;
      }
    );
  }

  private errorHandler(error){
    return Promise.reject(error);
  }

  private resetNewEntry () {
    this.newEntry = {
      request: {},
      response: {},
      startedDateTime: this.date,
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
    }
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
