import axios from 'axios';
import { AxiosHarTracker } from '../src/axios-har-tracker'
import * as fse from 'fs-extra';

describe('axios-har-tracker e2e tests', () => {

  let axiosTracker

  beforeEach(async () => {
    axiosTracker = new AxiosHarTracker(axios);
  });

  it('Should collect call with status 200', async () => {
    try {
      await axios.get('http://httpstat.us/200');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/200:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/200"
    });
    expect(array[0].response).toMatchObject({
      "status": 200,
      "statusText": "OK"
    });
    expect(array.length).toBe(1);

    fse.outputFile('./harfiles/example-200.har');
  });

  it('Should collect call to 302 - reject unauthorized', async () => {
    try {
      await axios.get('http://httpstat.us/302');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/302:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/302"
    });
    expect(array.length).toBe(1);

    fse.outputFile('./harfiles/example-302.har');
  });

  it('Should collect call with status 404', async () => {
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/404:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/404"
    });
    expect(array[0].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array.length).toBe(1);

    fse.outputFile('./harfiles/example-404.har');
  });

  it('Should collect call with status 500', async () => {
    try {
      await axios.get('http://httpstat.us/500');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/500:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/500"
    });
    expect(array[0].response).toMatchObject({
      "status": 500,
      "statusText": "Internal Server Error"
    });
    expect(array.length).toBe(1);

    fse.outputFile('./harfiles/example-500.har');
  });

  it('Should collect multiple calls', async () => {
    await axios.get('http://httpstat.us/200');
    try {
      await axios.get('http://httpstat.us/302');
    } catch (error) {
      console.log("An error appears after call to https:\/\/httpstat.us\/302:", error);
    }
    try {
      await axios.get('http://httpstat.us/404');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/404:", error);
    }
    try {
      await axios.get('http://httpstat.us/500');
    } catch (error) {
      console.log("An error appears after call to http:\/\/httpstat.us\/500:", error);
    }
    const generatedHar = axiosTracker.getGeneratedHar();
    const array = generatedHar.log.entries;
    expect(array[0].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/200"
    });
    expect(array[0].response).toMatchObject({
      "status": 200,
      "statusText": "OK"
    });
    expect(array[1].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/302"
    });
    expect(array[2].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/404"
    });
    expect(array[2].response).toMatchObject({
      "status": 404,
      "statusText": "Not Found"
    });
    expect(array[3].request).toMatchObject({
      "method": "get",
      "url": "http://httpstat.us/500"
    });
    expect(array[3].response).toMatchObject({
      "status": 500,
      "statusText": "Internal Server Error"
    });
    expect(array.length).toBe(4);

    fse.outputFile('./harfiles/example-multi.har');
  });

  

});
