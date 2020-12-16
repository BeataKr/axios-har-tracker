import axios from 'axios';
import { writeFileSync } from 'fs'
import { AxiosHarTracker } from './axios-har-tracker'
import * as chai from 'chai';
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset);
const { expect } = chai;

const axiosTracker = new AxiosHarTracker(axios); 

async function run() {
    const response1 = await axios.get('http://www.google.com/');
    console.log("1st response status", response1.status) //200
    console.log("1st response statusMessage", response1.statusText) //statusText: 'OK'
    // const generatedHar1 = axiosTracker.getGeneratedHar();
    // const array1 = generatedHar1.log.entries;
    // expect(array1).to.be.an('array');
    // generatedHar1.should.containSubset('"status": 200"');
    // generatedHar1.should.not.containSubset('"status": 404"');

    const response2 = await axios.get('http://www.google.com/non-existing-page');
    console.log("2nd response", response2.status) //404
    console.log("2nd response statusMessage", response2.statusText) //statusMessage: 'Not Found'
    const generatedHar2 = axiosTracker.getGeneratedHar();
    const array2 = generatedHar2.log.entries;
    expect(array2).to.be.an('array');
    // generatedHar2.should.containSubset('"status": 200"');
    // generatedHar2.should.containSubset('"status": 404"');

    // writeFileSync('./my-example1.har', JSON.stringify(generatedHar1), 'utf-8')
    writeFileSync('./my-example2.har', JSON.stringify(generatedHar2), 'utf-8')
}
run();