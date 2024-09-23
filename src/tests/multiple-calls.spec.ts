import axios, {AxiosResponse} from "axios";
import { AxiosHarTracker } from "../axios-har-tracker";
import * as fse from "fs-extra";
import {startServer, stopServer} from "./express";
import * as fs from "fs";
import * as path from "path";

const exampleHtml = fs.readFileSync(path.resolve(__dirname, "example.html")).toString("utf-8");

describe("axios-har-tracker e2e tests", () => {
  let axiosTracker: AxiosHarTracker;
  let serverUrl: string;

  beforeAll(async () => {
    const port = await startServer();
    serverUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await stopServer();
  });

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

  beforeAll(async () => {
    await fse.ensureDir("./harfiles");
  });

  function assembleTestHeaders(response: AxiosResponse) {
    const headers = [];

    Object.keys(response.headers).forEach((key) => {
      if(Array.isArray(response.headers[key])) {
        response.headers[key].forEach((headerValue: string) => headers.push({
          name: key,
          value: headerValue,
        }));
      } else {
        headers.push({
          name: key,
          value: response.headers[key],
        })
      }
    });

    return headers;
  }

  it("Should collect call with status 200", async () => {
    const response = await axios.get(`${serverUrl}/200`, {
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200`,
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200.har", generatedHar);
  });

  it("Should collect call to 302 - reject unauthorized", async () => {
    const response = await axios.get(`${serverUrl}/302`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/302`,
    });
    expect(array[0].response).toMatchObject({
      status: 302,
      statusText: "Found",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-302.har", generatedHar);
  });

  it("Should collect call with status 404", async () => {
    const response = await axios.get(`${serverUrl}/404`, {
      validateStatus: (status) => status === 404
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/404`,
    });
    expect(array[0].response).toMatchObject({
      status: 404,
      statusText: "Not Found",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-404.har", generatedHar);
  });

  it("Should collect call with status 500", async () => {
    const response = await axios.get(`${serverUrl}/500`, {
      validateStatus: (status) => status === 500
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/500`,
    });
    expect(array[0].response).toMatchObject({
      status: 500,
      statusText: "Internal Server Error",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-500.har", generatedHar);
  });

  it("Should collect multiple calls", async () => {
    const responses = [];
    responses.push(await axios.get(`${serverUrl}/200`, {
      validateStatus: (status) => status === 200
    }));
    responses.push(await axios.get(`${serverUrl}/302`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    }));
    responses.push(await axios.get(`${serverUrl}/404`, {
      validateStatus: (status) => status === 404
    }));
    responses.push(await axios.get(`${serverUrl}/500`, {
      validateStatus: (status) => status === 500
    }));

    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;

    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200`,
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      headers: assembleTestHeaders(responses[0]),
    });
    expect(array[1].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/302`,
    });
    expect(array[1].response).toMatchObject({
      status: 302,
      statusText: "Found",
      headers: assembleTestHeaders(responses[1]),
    });
    expect(array[2].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/404`,
    });
    expect(array[2].response).toMatchObject({
      status: 404,
      statusText: "Not Found",
      headers: assembleTestHeaders(responses[2]),
    });
    expect(array[3].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/500`,
    });
    expect(array[3].response).toMatchObject({
      status: 500,
      statusText: "Internal Server Error",
      headers: assembleTestHeaders(responses[3]),
    });
    expect(array.length).toBe(4);

    await fse.writeJson("./harfiles/example-multi.har", generatedHar);
  }, 20000);

  it("Should collect call with query parameters", async () => {
    const response = await axios.get(`${serverUrl}/200`, {
      params: {
        test: 1,
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200?test=1`,
      queryString: [
        {
          name: "test",
          value: 1,
        },
      ],
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200-withParams.har", generatedHar);
  });

  it("Should collect call with baseURL", async () => {
    let axiosInstance = axios.create({
      baseURL: serverUrl,
    });

    axiosTracker = new AxiosHarTracker(axiosInstance);

    const response = await axiosInstance.get("/200", {
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200`,
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200-withBaseURL.har", generatedHar);
  });

  it("Should collect call with baseURL and parameters", async () => {
    let axiosInstance = axios.create({
      baseURL: serverUrl,
    });

    axiosTracker = new AxiosHarTracker(axiosInstance);

    const response = await axiosInstance.get("/200", {
      params: {
        test: 1,
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200?test=1`,
      queryString: [
        {
          name: "test",
          value: 1,
        },
      ],
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      headers: assembleTestHeaders(response),
    });
    // expect(array[0].response.content.text).toBe(exampleHtml);
    expect(array[0].response.content.mimeType).toBe("text/plain; charset=utf-8");
    // expect(array[0].response.content.size).toBe(119);
    expect(array.length).toBe(1);

    await fse.writeJson(
      "./harfiles/example-200-withParamsAndBaseURL.har",
      generatedHar
    );
  });

  it("should handle request cookies (as array) correctly", async () => {
    const response = await axios.get(`${serverUrl}/200`, {
      headers: {
        Cookie: ["testCookie=value", "testCookie2=value2"],
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200`,
      cookies: [
        { name: "testCookie", value: "value" },
        { name: "testCookie2", value: "value2" },
      ],
      headers: [
        { name: "Accept", value: "application/json, text/plain, */*"},
        { name: "Content-Type", value: undefined },
        { name: "Cookie", value: "testCookie=value; testCookie2=value2"},
        { name: "User-Agent", value: "axios/1.7.7" },
        { name: "Accept-Encoding", value: "gzip, compress, deflate, br"}
      ],
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      cookies: [
        {
          name: "test1",
          domain: "foo.example.com",
          expires: "2024-04-03T14:04:00.000Z",
          httpOnly: true,
          path: "/",
          sameSite: "Strict",
          secure: true
        },
        {
          name: "test2",
          domain: "foo.example.com",
          expires: "2024-04-03T14:04:00.000Z",
          path: "/docs",
          sameSite: "Lax",
        }
      ],
      headers: assembleTestHeaders(response),
    });
    expect(array.length).toBe(1);
  });

  it("should handle request cookies (as string) correctly", async () => {
    const response = await axios.get(`${serverUrl}/200`, {
      headers: {
        Cookie: "testCookie=value; testCookie2=value2",
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: `${serverUrl}/200`,
      cookies: [
        { name: "testCookie", value: "value" },
        { name: "testCookie2", value: "value2" },
      ],
      headers: [
        { name: "Accept", value: "application/json, text/plain, */*"},
        { name: "Content-Type", value: undefined },
        { name: "Cookie", value: "testCookie=value; testCookie2=value2"},
        { name: "User-Agent", value: "axios/1.7.7" },
        { name: "Accept-Encoding", value: "gzip, compress, deflate, br"},
      ],
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
      cookies: [
        {
          name: "test1",
          domain: "foo.example.com",
          expires: "2024-04-03T14:04:00.000Z",
          httpOnly: true,
          path: "/",
          sameSite: "Strict",
          secure: true
        },
        {
          name: "test2",
          domain: "foo.example.com",
          expires: "2024-04-03T14:04:00.000Z",
          path: "/docs",
          sameSite: "Lax",
        }
      ],
      headers: assembleTestHeaders(response),
    });
    expect(array.length).toBe(1);
  });

  it('Should collect concurrent calls', async () => {
    function fetch (url) {
      function wrap (resolve, reject) {
        axios.get(url)
          .then(resolve)
          .catch((error) => {
            console.log('error while fetching', url, error);
            resolve();
          });
      }
      return new Promise(wrap);
    }

    return Promise.all([
      fetch('http://httpstat.us/200?msg=A'),
      fetch('http://httpstat.us/200?msg=hello'),
      fetch('http://httpstat.us/200?msg=C'),
      fetch('http://httpstat.us/200?msg=D')
    ]).then(async (results) => {
      console.log("OUT RESULTS", results);
      const generatedHar = axiosTracker.getGeneratedHar();
      const array = generatedHar.log.entries;
      console.log("OUT ENTRIES", array);
      expect(array.length).toBe(4);
      await fse.writeJson('./harfiles/example-multiple-concurrent-test.har', generatedHar);
    });
  });
});