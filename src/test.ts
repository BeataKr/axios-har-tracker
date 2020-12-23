import axios from 'axios';
import { writeFileSync } from 'fs'
import { AxiosHarTracker } from './axios-har-tracker'
import * as chai from 'chai';
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset);
const { expect } = chai;

const axiosTracker = new AxiosHarTracker(axios); 

async function run() {
    await axios.get('http://httpstat.us/200');
    await axios.get('http://httpstat.us/201');
    await axios.get('http://httpstat.us/202');

    const generatedHar1 = axiosTracker.getGeneratedHar();
    const array1 = generatedHar1.log.entries;
    expect(array1).to.be.an('array');
    // generatedHar1.should.containSubset('"status": 200"');
    // generatedHar1.should.not.containSubset('"status": 404"');
    writeFileSync('./my-example1.har', JSON.stringify(generatedHar1), 'utf-8')

    await axios.get('http://httpstat.us/300');
    await axios.get('http://httpstat.us/404');
    const generatedHar2 = axiosTracker.getGeneratedHar();
    const array2 = generatedHar2.log.entries;
    expect(array2).to.be.an('array');
    // generatedHar2.should.containSubset('"status": 404"');
    // generatedHar2.should.containSubset('"status": 300"');

    // writeFileSync('./my-example2.har', JSON.stringify(generatedHar2), 'utf-8')
}
run();