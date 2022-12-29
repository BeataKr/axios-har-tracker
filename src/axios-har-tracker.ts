import { AxiosStatic } from 'axios';
import * as cookie from 'cookie';

export interface HarFile {
  log: Log;
};

export interface Log {
  version: string;
  creator: Creator;
  pages?: null[] | null;
  entries?: Entry[] | null;
  comment: string;
}
export interface Creator {
  name: string;
  version: string;
}
export interface Entry {
  request: Request;
  response: Response | null;
  startedDateTime: string;
  time: number;
  cache: Cache;
  timings: Timings;
}
export interface Request {
  method: string;
  url: string;
  httpVersion: string;
  cookies?: KeyValue[] | null;
  headers?: KeyValue[] | null;
  queryString?: KeyValue[] | null;
  headersSize: number;
  bodySize: number;
}
export interface KeyValue {
  name: string;
  value: string;
}
export interface Response {
  status: number;
  statusText: string;
  headers?: KeyValue[] | null;
  startedDateTime: string;
  time: number;
  httpVersion: string;
  cookies?: KeyValue[] | null;
  bodySize: number;
  redirectURL: string;
  headersSize: number;
  content: Content;
  cache: Cache;
  timings: Timings;
}
export interface Content {
  size: number;
  mimeType: string;
  text: string;
}
export type Cache = Record<string, unknown>;
export interface Timings {
  blocked: number;
  dns: number;
  ssl: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  _blocked_queueing: number;
}

export class AxiosHarTracker {

  private axios: AxiosStatic;
  private readonly generatedHar: HarFile;
  private newEntry: Entry;
  private requestInterceptor: number;
  private responseInterceptor: number;

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
        entries: [],
        comment: ""
      }
    };

    this.requestInterceptor = this.axios.interceptors.request.use(
      async config => {
        this.newEntry = this.generateNewEntry(this.returnRequestObject(config));
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

    this.responseInterceptor = this.axios.interceptors.response.use(
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

  public stopTracking() {
    if(this.requestInterceptor) {
      this.axios.interceptors.request.eject(this.requestInterceptor);
      this.requestInterceptor = null;
    }
    if(this.responseInterceptor){
      this.axios.interceptors.response.eject(this.responseInterceptor);
      this.responseInterceptor = null;
    }
  }

  private returnRequestObject(config): Request {
    const requestObject = {
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

  private returnResponseObject(response): Response {
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

  private generateNewEntry(request: Request) {
    const newEntry: Entry = {
      request,
      response: null,
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

  private transformObjectToArray(obj): KeyValue[] {
    const results = Object.keys(obj).map(key => {
      return {
        name: key,
        value: obj[key].toString()
      };
    });
    return obj ? results : [];
  }

  private getCookies(fullCookie: string) {
    return fullCookie ? this.transformObjectToArray(cookie.parse(fullCookie)) : [];
  }

  private getParams(params) {
    return params ? this.transformObjectToArray(params) : [];
  }

  private getHeaders(headersObject) {
    return headersObject ? this.transformObjectToArray(headersObject) : [];
  }

}
