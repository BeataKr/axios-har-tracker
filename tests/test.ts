import axios from 'axios';
import { writeFileSync } from 'fs'
import { AxiosHarTracker } from '../src/axios-har-tracker'

const axiosTracker = new AxiosHarTracker(axios); 

async () => {
    const response1 = await axios.get('https://www.google.com/');
    console.log("1st response", response1)
    const response2 = await axios.get('https://www.google.com/non-existing-page');
    console.log("2nd response", response2)
    const generatedHarForGood = axiosTracker.getGeneratedHar();
    writeFileSync('./my-example.har', JSON.stringify(generatedHarForGood), 'utf-8')
}
