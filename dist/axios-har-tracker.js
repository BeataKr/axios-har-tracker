"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosHarTracker = void 0;
const axios = require('axios').default;
const fs_1 = require("fs");
const cookie = require("cookie");
class AxiosHarTracker {
    constructor() {
        this.date = new Date();
        this.startDate = this.date.toISOString();
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
    }
    // public newEntry = {
    //   request: {},
    //   response: {},
    //   startedDateTime: this.startDate,
    //   time: -1,
    //   cache: {},
    //   timings: {
    //     blocked: -1,
    //     dns: -1,
    //     ssl: -1,
    //     connect: -1,
    //     send: 10,
    //     wait: 10,
    //     receive: 10,
    //     _blocked_queueing: -1
    //   }
    // };
    generateHar(call) {
        let newEntry = {
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
        axios.interceptors.request.use((config) => __awaiter(this, void 0, void 0, function* () {
            config.validateStatus = function () {
                return true;
            };
            config.headers['request-startTime'] = process.hrtime();
            const fullCookie = JSON.stringify(config.headers['Cookie']);
            const version = config.httpVersion === undefined ? 'HTTP/1.1' : 'HTTP/' + config.httpVersion;
            newEntry.request = {
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
        }), error => {
            return Promise.reject(error);
        });
        axios.interceptors.response.use((resp) => __awaiter(this, void 0, void 0, function* () {
            if (resp) {
                newEntry.response = {
                    status: resp.status,
                    statusText: resp.statusText,
                    headers: this.getHeaders(resp.headers),
                    startedDateTime: new Date(resp.headers.date),
                    time: resp.headers['request-duration'] = Math.round(process.hrtime(resp.headers['request-startTime'])[0] * 1000 +
                        process.hrtime(resp.headers['request-startTime'])[1] / 1000000),
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
                let enteriesContent = Object.assign({}, newEntry);
                this.generatedHar.log.entries.push(enteriesContent);
                return resp;
            }
        }), error => {
            return Promise.reject(error);
        });
        const response = axios(call);
        return response;
    }
    transformObjectToArray(obj) {
        const results = Object.keys(obj).map(key => {
            return {
                name: key,
                value: obj[key].toString()
            };
        });
        return obj ? results : [];
    }
    getHeaders(headersObject) {
        if (headersObject !== undefined) {
            return this.transformObjectToArray(headersObject);
        }
        else
            return [];
    }
    getCookies(fullCookie) {
        if (fullCookie) {
            const parsedCookie = cookie.parse(fullCookie);
            return this.transformObjectToArray(parsedCookie);
        }
        else
            return [];
    }
    getParams(params) {
        if (params !== undefined) {
            return this.transformObjectToArray(params);
        }
        else
            return [];
    }
    saveFile(filePath) {
        fs_1.writeFileSync(filePath, JSON.stringify(this.generatedHar), 'utf-8');
    }
}
exports.AxiosHarTracker = AxiosHarTracker;
//# sourceMappingURL=axios-har-tracker.js.map