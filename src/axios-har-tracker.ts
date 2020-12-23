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
    entries: NewEntry[];
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
  private date = new Date().toISOString();

  private requestObject(config) {

    config.headers['request-startTime'] = process.hrtime();
    let requestObject = {
      method: config.method,
      url: config.url,
      httpVersion: 'HTTP/1.1',
      cookies: this.getCookies(JSON.stringify(config.headers['Cookie'])),
      headers: this.getHeaders(config.headers['common']),
      queryString: this.getParams(config.params),
      headersSize: -1,
      bodySize: -1
    };
    return requestObject;
  }

  private responseObject(response) {
    if (response) {
      let responseObject = {
        status: response.status,
        statusText: response.statusText,
        headers: this.getHeaders(response.headers),
        startedDateTime: new Date(response.headers.date),
        time: response.headers['request-duration'] = Math.round(
          process.hrtime(response.headers['request-startTime'])[0] * 1000 +
          process.hrtime(response.headers['request-startTime'])[1] / 1000000
        ),
        httpVersion: 'HTTP/1.1',
        cookies: this.getCookies(JSON.stringify(response.config.headers['Cookie'])),
        bodySize: JSON.stringify(response.data).length,
        redirectURL: '',
        headersSize: -1,
        content: {
          size: JSON.stringify(response.data).length,
          mimeType: response.headers['content-type'] ? response.headers['content-type'] : 'text/plain',
          text: JSON.stringify(response.data)
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
      }
      return responseObject;
    } else {
      let responseObject = {
        status: [],
        statusText: [],
        headers: [],
        startedDateTime: [],
        time: [],
        httpVersion: [],
        cookies: [],
        bodySize: 0,
        redirectURL: '',
        headersSize: -1,
        content: {
          size: 0,
          mimeType: 'text/plain',
          text: ''
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
      }
      return responseObject;
    }
  }

  private pushNewEntryResponse(response) {
    this.newEntry.response = this.responseObject(response);
    this.generatedHar.log.entries.push(this.newEntry);
  }

  private pushNewEntryRequest(request) {
    this.newEntry.request = this.requestObject(request);
    this.generatedHar.log.entries.push(this.newEntry);
    console.log("DEBUG this.newEntry.request:", this.newEntry.request)
  }

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

    this.axios.interceptors.request.use(

      async config => {
        this.generateNewEntry();
        this.newEntry.request = this.requestObject(config);
        return config;
      },
      async error => {
        this.pushNewEntryRequest(error.request);
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      async resp => {
        this.newEntry.response = this.responseObject(resp);
        this.generatedHar.log.entries.push(this.newEntry);
        return resp;
      },
      async error => {
        this.pushNewEntryResponse(error.response);
        return Promise.reject(error);
      }
    );
  }

  private generateNewEntry() {
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
    return this.newEntry
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
