import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import * as qs from "qs";
import * as cookieParser from "set-cookie-parser";

interface HarFile {
  log: {
    version: string;
    creator: {
      name: string;
      version: string;
    };
    pages: [];
    entries: NewEntry[];
  };
}

interface NewEntry {
  request: {};
  response: {};
  startedDateTime: string;
  time: number;
  cache: {};
  timings: {
    blocked: number;
    dns: number;
    ssl: number;
    connect: number;
    send: number;
    wait: number;
    receive: number;
    _blocked_queueing: number;
  };
}

type AxiosHarTrackerCreatorConfig = {
  name: string;
  version: string;
};

export class AxiosHarTracker {
  private axios: AxiosInstance;
  private generatedHar: HarFile;
  private newEntry: NewEntry;
  private creatorConfig: AxiosHarTrackerCreatorConfig;

  constructor(
    axiosModule: AxiosInstance,
    creatorConfig: AxiosHarTrackerCreatorConfig = {
      name: "axios-har-tracker",
      version: "0.1.0",
    }
  ) {
    this.axios = axiosModule;
    this.creatorConfig = creatorConfig;
    this.resetHar();

    this.axios.interceptors.request.use(
      async (config) => {
        this.newEntry = this.generateNewEntry();
        this.newEntry.request = this.returnRequestObject(config);
        return config;
      },
      async (error) => {
        if (error.request) {
          this.newEntry.request = this.returnRequestObject(error.request);
          this.generatedHar.log.entries.push(this.newEntry);
        }
        return Promise.reject(error);
      }
    );

    this.axios.interceptors.response.use(
      async (resp) => {
        this.pushNewEntryResponse(resp);
        return resp;
      },
      async (error) => {
        if (error.response) {
          this.pushNewEntryResponse(error.response);
        } else if (error.isAxiosError) {
          this.pushNewEntryResponse(error);
        }
        return Promise.reject(error);
      }
    );
  }

  private returnRequestObject(config: AxiosRequestConfig) {
    const cookies = [];
    const cookieHeaders = [];

    if (config.headers["Cookie"]) {
      if (Array.isArray(config.headers["Cookie"])) {
        cookieHeaders.push(...config.headers["Cookie"]);
      } else {
        cookieHeaders.push(config.headers["Cookie"]);
      }
    }

    if (config.headers["cookie"]) {
      if (Array.isArray(config.headers["cookie"])) {
        cookieHeaders.push(...config.headers["cookie"]);
      } else {
        cookieHeaders.push(config.headers["cookie"]);
      }
    }

    cookieHeaders
      .forEach((cookieString) => cookieString
        .split(";")
        .forEach((chunk: string) => {
          const parts = chunk.trim().split("=");
          cookies.push({
            name: parts[0].trim(),
            value: parts[1].trim(),
          });
        }));

    const headers = config.headers ? this.getHeaders(config.headers) : [];
    headers
      .filter((header) => header.name === "Cookie" || header.name === "cookie")
      .forEach((header) => header.value = cookies.map((cookieObj) => `${cookieObj.name}=${cookieObj.value}`).join("; "));

    const requestObject: any = {
      method: config.method,
      url: this.getURL(config),
      httpVersion: "HTTP/1.1",
      cookies,
      headers,
      queryString: this.getParams(config.params),
      headersSize: -1,
      bodySize: config.data ? JSON.stringify(config.data).length : 0,
      content: {
        size: config.data ? JSON.stringify(config.data).length : 0,
        mimeType: this.getMimeType(config),
        text: config.data ? JSON.stringify(config.data) : "",
      },
    };
    if (config.data) {
      requestObject.postData = {
        mimeType: config.headers["Content-Type"],
        text: JSON.stringify(config.data),
      };
    }
    return requestObject;
  }

  private returnResponseObject(response: AxiosResponse) {
    const rawHeaders = response.headers ? this.getHeaders(response.headers) : [];
    const headers = [];

    rawHeaders.forEach((rawHeader) => {
      if (Array.isArray(rawHeader.value)) {
        headers.push(...rawHeader.value.map((value) => ({
          name: rawHeader.name,
          value,
        })));
      } else {
        headers.push(rawHeader);
      }
    });

    const cookies = cookieParser(
      headers
      .filter((header) => /set-cookie/i.test(header.name))
      .map((header) => header.value))
      .map((cookie) => ({
        ...cookie,
        expires: cookie.expires ? cookie.expires.toISOString() : undefined,
      }));

    return {
      status: response.status ? response.status : "",
      statusText: response.statusText ? response.statusText : "",
      headers,
      startedDateTime: new Date().toISOString(),
      time: response.headers
        ? Math.round(
          process.hrtime(response.headers["request-startTime"])[0] * 1000 +
          process.hrtime(response.headers["request-startTime"])[1] / 1000000
        )
        : 0,
      httpVersion: "HTTP/1.1",
      cookies,
      bodySize: response.data ? JSON.stringify(response.data).length : 0,
      redirectURL: "",
      headersSize: -1,
      content: {
        size: response.data ? JSON.stringify(response.data).length : 0,
        mimeType: this.getMimeType(response),
        text: response.data ? JSON.stringify(response.data) : "",
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
        _blocked_queueing: -1,
      },
    };
  }

  private getMimeType(resp) {
    if (resp.headers && resp.headers["content-type"]) {
      return resp.headers["content-type"];
    } else if (resp.headers && !resp.headers["content-type"]) {
      return "text/html";
    } else return "text/html";
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
        _blocked_queueing: -1,
      },
    };
    return newEntry;
  }

  public getGeneratedHar() {
    return this.generatedHar;
  }

  private checkObj(value: any) {
    let results;
    if (typeof value === "object" && value !== null) {
      results = Array.isArray(value) ? value : JSON.stringify(value);
    } else results = value;
    return results;
  }

  private transformObjectToArray(obj, encode: boolean) {
    const results = Object.keys(obj).map((key) => {
      let value = obj[key];
      return {
        name: key,
        value: encode ? qs.stringify(value) || value : this.checkObj(value),
      };
    });
    return obj ? results : [];
  }

  private getParams(params) {
    return params ? this.transformObjectToArray(params, true) : [];
  }

  private getHeaders(headersObject) {
    return headersObject
      ? this.transformObjectToArray(headersObject, false)
      : [];
  }

  private getURL(config): string {
    /**
     * A regex to check if a URL is absolute:
     * ^ - beginning of the string
     * (?: - beginning of a non-captured group
     *   [a-z+]+ - any character of 'a' to 'z' or "+" 1 or more times
     *   : - string (colon character)
     * )? - end of the non-captured group. Group appearing 0 or 1 times
     * // - string (two forward slash characters)
     * 'i' - non case-sensitive flag
     */
    const absoluteURLRegex = /^(?:[a-z+]+:)?\/\//i;

    let url = config.url;

    if (config.baseURL && !absoluteURLRegex.test(config.url)) {
      url = config.baseURL + url;
    }
    if (config.params) {
      url += "?" + qs.stringify(config.params);
    }
    return url;
  }

  public resetHar() {
    this.generatedHar = {
      log: {
        version: "1.2",
        creator: this.creatorConfig,
        pages: [],
        entries: [],
      },
    };
  }
}
