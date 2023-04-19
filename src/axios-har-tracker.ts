import { AxiosStatic } from 'axios';
import * as cookie from 'cookie';
import * as qs from 'qs';

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

  constructor(axiosModule: AxiosStatic) {
    this.axios = axiosModule;
    this.generatedHar = {
      log: {
        version: '1.2',
        creator: {
          name: 'axios-har-tracker',
          version: '0.1.0'
        },
        pages: [],
        entries: []
      }
    };

    this.axios.interceptors.request.use(
      async config => {
        this.newEntry = this.generateNewEntry();
        this.newEntry.request = this.returnRequestObject(config);
        return config;
      },
      async error => {
        if (error.request) {
          this.newEntry.request = this.returnRequestObject(error.request);
          this.generatedHar.log.entries.push(this.newEntry);
        }
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      async resp => {
        this.pushNewEntryResponse(resp);
        return resp;
      },
      async error => {
        if (error.response) {
          this.pushNewEntryResponse(error.response);
        } else if (error.isAxiosError) {
          this.pushNewEntryResponse(error);
        }
        return Promise.reject(error);
      }
    );
  }

  private returnRequestObject(config) {
    let tmp: [];
    const requestObject: any = {
      method: config.method,
      url: config.url,
      httpVersion: 'HTTP/1.1',
      cookies: config.headers['Cookie'] ? this.getCookies(JSON.stringify(config.headers['Cookie'])) : [],
      headers: config.headers ? this.getHeaders(config.headers): [],
      queryString: this.getParams(config.params),
      headersSize: -1,
      bodySize: config.data ? JSON.stringify(config.data).length : 0,
      content: {
        size: config.data ? JSON.stringify(config.data).length : 0,
        mimeType: this.getMimeType(config),
        text: config.data ? JSON.stringify(config.data) : ''
      }
    };
    if (config.data) {
      requestObject.postData = {
        mimeType: config.headers['Content-Type'],
        text: JSON.stringify(config.data)
      };
    }
    return requestObject;
  }

  private returnResponseObject(response) {
    const responseObject = {
      status: response.status ? response.status : '',
      statusText: response.statusText ? response.statusText : '',
      headers: response.headers ? this.getHeaders(response.headers) : [],
      startedDateTime: new Date().toISOString(),
      time: response.headers ? response.headers['request-duration'] = Math.round(
        process.hrtime(response.headers['request-startTime'])[0] * 1000 +
        process.hrtime(response.headers['request-startTime'])[1] / 1000000
      ) : 0,
      httpVersion: 'HTTP/1.1',
      cookies: response.config.headers['Cookie'] ? this.getCookies(JSON.stringify(response.config.headers['Cookie'])) : [],
      bodySize: response.data ? JSON.stringify(response.data).length : 0,
      redirectURL: '',
      headersSize: -1,
      content: {
        size: response.data ? JSON.stringify(response.data).length : 0,
        mimeType: this.getMimeType(response),
        text: response.data ? JSON.stringify(response.data) : ''
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

  private getMimeType(resp) {
    if (resp.headers && resp.headers['content-type']) {
      return resp.headers['content-type'];
    } else if (resp.headers && !resp.headers['content-type']) {
      return 'text/html'
    } else return 'text/html'
  }

  private pushNewEntryResponse(response) {
    this.newEntry.response = this.returnResponseObject(response);
    this.generatedHar.log.entries.push(this.newEntry);
  }

  private generateNewEntry() {
    const newEntry: NewEntry = {
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
    return newEntry;
  }

  public getGeneratedHar() {
    return this.generatedHar;
  }

  private checkObj(value: any){
    let results
    if(typeof value === 'object' && value !== null){
      results = JSON.stringify(value);
    } else results = value;
    return results;
  }

  private transformObjectToArray(obj, encode: boolean) {
    const results = Object.keys(obj).map(key => {
      let value = obj[key];
      return {
        name: key,
        value: encode ? (qs.stringify(value) || value) : this.checkObj(value)
      };
    });
    return obj ? results : [];
  }

  private getCookies(fullCookie: string) {
    return fullCookie ? this.transformObjectToArray(cookie.parse(fullCookie), false) : [];
  }

  private getParams(params) {
    return params ? this.transformObjectToArray(params, true) : [];
  }

  private getHeaders(headersObject) {
    return headersObject ? this.transformObjectToArray(headersObject, false) : [];
  }

}
