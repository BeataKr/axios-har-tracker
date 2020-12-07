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
exports.axiosTracker = exports.saveFile = void 0;
const axios = require('axios').default;
const fs_1 = require("fs");
const cookie = require("cookie");
const date = new Date();
const startDate = date.toISOString();
let generatedHar = {
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
let newEntry = {
    request: {},
    response: {},
    startedDateTime: startDate,
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
function axiosTracker(call) {
    return __awaiter(this, void 0, void 0, function* () {
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
                cookies: getCookies(fullCookie),
                headers: [],
                queryString: getParams(config.params),
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
                    headers: getHeaders(resp.headers),
                    startedDateTime: new Date(resp.headers.date),
                    time: resp.headers['request-duration'] = Math.round(process.hrtime(resp.headers['request-startTime'])[0] * 1000 +
                        process.hrtime(resp.headers['request-startTime'])[1] / 1000000),
                    httpVersion: `HTTP/${resp.request.res.httpVersion}`,
                    cookies: getCookies(JSON.stringify(resp.config.headers['Cookie'])),
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
                const enteriesContent = Object.assign({}, newEntry);
                generatedHar.log.entries.push(enteriesContent);
                return resp;
            }
        }), error => {
            return Promise.reject(error);
        });
        function transformObjectToArray(obj) {
            const results = Object.keys(obj).map(key => {
                return {
                    name: key,
                    value: obj[key].toString()
                };
            });
            return obj ? results : [];
        }
        function getCookies(fullCookie) {
            if (fullCookie) {
                const parsedCookie = cookie.parse(fullCookie);
                return transformObjectToArray(parsedCookie);
            }
            else
                return [];
        }
        function getParams(params) {
            if (params !== undefined) {
                return transformObjectToArray(params);
            }
            else
                return [];
        }
        function getHeaders(headersObject) {
            if (headersObject !== undefined) {
                return transformObjectToArray(headersObject);
            }
            else
                return [];
        }
        const response = yield axios(call);
        return response;
    });
}
exports.axiosTracker = axiosTracker;
function saveFile(filePath) {
    fs_1.writeFileSync(filePath, JSON.stringify(generatedHar), 'utf-8');
}
exports.saveFile = saveFile;
//# sourceMappingURL=axios-har-tracker.js.map