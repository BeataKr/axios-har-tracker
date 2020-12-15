import axios from 'axios';
import { writeFileSync } from 'fs'
import { AxiosHarTracker } from './axios-har-tracker'
import { expect } from 'chai'

const axiosTracker = new AxiosHarTracker(axios); 

async function run() {
    const response1 = await axios.get('http://www.google.com/');
    console.log("1st response status", response1.status) //200
    console.log("1st response statusMessage", response1.statusText) //statusText: 'OK'
    const generatedHar1 = axiosTracker.getGeneratedHar();
    // console.log("DEBUG generatedHar1:",generatedHar1)
    // console.log("DEBUG generatedHar1.log.entries.response:",generatedHar1.log.entries.response)
    const contentArray = generatedHar1.log.entries;
    expect(generatedHar1.log.entries).to.be.an('array');
    expect(contentArray).to.have.deep.property('{status: 200}');

    const response2 = await axios.get('http://www.google.com/non-existing-page');
    console.log("2nd response", response2.status) //404
    console.log("2nd response statusMessage", response2.statusText) //statusMessage: 'Not Found'
    const generatedHar2 = axiosTracker.getGeneratedHar();
    // console.log("DEBUG generatedHar2:",generatedHar2)

    writeFileSync('./my-example1.har', JSON.stringify(generatedHar1), 'utf-8')
    writeFileSync('./my-example2.har', JSON.stringify(generatedHar2), 'utf-8')
}
run();