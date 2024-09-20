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

interface RequestObject {
  method: string;
  url: string;
  httpVersion: string;
  cookies: {name: string; value: string}[];
  headers: { name: string; value: string }[];
  queryString: { name: string; value: any }[];
  headersSize: number;
  bodySize: number;
  content: { size: number; mimeType: string; text: string };
  postData?: { mimeType: string; text: string; }
}

interface ResponseObject {
  status: number | string;
  statusText: string;
  headers: {name: string; value: string}[];
  startedDateTime: string;
  time: number;
  httpVersion: string;
  cookies: {
    path?: string;
    expires?: string;
    maxAge?: number;
    domain?: string;
    sameSite?: string;
    name: string;
    httpOnly?: boolean;
    secure?: boolean;
    value: string
  }[];
  bodySize: number;
  redirectURL: string;
  headersSize: number;
  content: { size: number; mimeType: string; text: string };
  cache: {};
  timings: {
    receive: number;
    wait: number;
    blocked: number;
    dns: number;
    ssl: number;
    send: number;
    _blocked_queueing: number;
    connect: number
  };
}


interface NewEntry {
  request?: RequestObject;
  response?: ResponseObject;
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

  private returnRequestObject(config: AxiosRequestConfig): RequestObject {

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

    let contentText = "";
    if(config.data) {
      contentText = typeof config.data === "string" ? config.data : JSON.stringify(config.data);
    }

    const requestObject: RequestObject = {
      method: config.method,
      url: this.getURL(config),
      httpVersion: "HTTP/1.1",
      cookies,
      headers,
      queryString: this.getParams(config.params),
      headersSize: -1,
      bodySize: config.data ? JSON.stringify(config.data).length : 0,
      content: {
        size: contentText.length,
        mimeType: this.getMimeType(config),
        text: contentText,
      },
    };
    if (config.data) {
      requestObject.postData = {
        mimeType: config.headers["Content-Type"],
        text: contentText,
      };
    }
    return requestObject;
  }

  private returnResponseObject(response: AxiosResponse): ResponseObject {

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

      let contentText = "";
      if(response.data) {
        contentText = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      }

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
          size: contentText.length,
          mimeType: this.getMimeType(response),
          text: contentText,
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
    const newEntry = this.generateNewEntry();
    newEntry.request = this.returnRequestObject(response.config);
    newEntry.response = this.returnResponseObject(response);
    this.generatedHar.log.entries.push(this.newEntry);
  }

  private generateNewEntry() {
    const newEntry: NewEntry = {
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
