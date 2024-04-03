import axios from "axios";
import { AxiosHarTracker } from "../axios-har-tracker";
import * as fse from "fs-extra";

describe("axios-har-tracker e2e tests", () => {
  let axiosTracker;

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

  beforeAll(async () => {
    fse.ensureDir("./harfiles");
  });

  it("Should collect call with status 200", async () => {
    await axios.get("http://httpstat.us/200", {
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/200",
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200.har", generatedHar);
  });

  it("Should collect call to 302 - reject unauthorized", async () => {
    await axios.get("http://httpstat.us/302", {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/302",
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-302.har", generatedHar);
  });

  it("Should collect call with status 404", async () => {
    await axios.get("http://httpstat.us/404", {
      validateStatus: (status) => status === 404
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/404",
    });
    expect(array[0].response).toMatchObject({
      status: 404,
      statusText: "Not Found",
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-404.har", generatedHar);
  });

  it("Should collect call with status 500", async () => {
    await axios.get("http://httpstat.us/500", {
      validateStatus: (status) => status === 500
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/500",
    });
    expect(array[0].response).toMatchObject({
      status: 500,
      statusText: "Internal Server Error",
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-500.har", generatedHar);
  });

  it("Should collect multiple calls", async () => {
    await axios.get("http://httpstat.us/200", {
      validateStatus: (status) => status === 200
    });
    await axios.get("http://httpstat.us/302", {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    await axios.get("http://httpstat.us/404", {
      validateStatus: (status) => status === 404
    });
    await axios.get("http://httpstat.us/500", {
      validateStatus: (status) => status === 500
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/200",
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
    });
    expect(array[1].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/302",
    });
    expect(array[2].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/404",
    });
    expect(array[2].response).toMatchObject({
      status: 404,
      statusText: "Not Found",
    });
    expect(array[3].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/500",
    });
    expect(array[3].response).toMatchObject({
      status: 500,
      statusText: "Internal Server Error",
    });
    expect(array.length).toBe(4);

    await fse.writeJson("./harfiles/example-multi.har", generatedHar);
  }, 20000);

  it("Should collect call with query parameters", async () => {
    await axios.get("http://httpstat.us/200", {
      params: {
        test: 1,
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/200?test=1",
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
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200-withParams.har", generatedHar);
  });

  it("Should collect call with baseURL", async () => {
    let axiosInstance = axios.create({
      baseURL: "http://httpstat.us",
    });

    axiosTracker = new AxiosHarTracker(axiosInstance);

    await axiosInstance.get("/200", {
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/200",
    });
    expect(array[0].response).toMatchObject({
      status: 200,
      statusText: "OK",
    });
    expect(array.length).toBe(1);

    await fse.writeJson("./harfiles/example-200-withBaseURL.har", generatedHar);
  });

  it("Should collect call with baseURL and parameters", async () => {
    let axiosInstance = axios.create({
      baseURL: "http://httpstat.us",
    });

    axiosTracker = new AxiosHarTracker(axiosInstance);

    await axiosInstance.get("/200", {
      params: {
        test: 1,
      },
      validateStatus: (status) => status === 200
    });
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      method: "get",
      url: "http://httpstat.us/200?test=1",
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
    });
    expect(array.length).toBe(1);

    await fse.writeJson(
      "./harfiles/example-200-withParamsAndBaseURL.har",
      generatedHar
    );
  });
});
