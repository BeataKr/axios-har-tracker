// import axios from 'axios';
const axios = require('axios').default;
// import fse from 'fs-extra';
import { AxiosHarTracker } from './src/axios-har-tracker'

const axiosTracker = new AxiosHarTracker(axios);

async () => {
    const response = await axios('https://www.google.com/');
    // fse.writeFileSync('./example.har')
    axiosTracker.getGeneratedHar('example.har');
    // fse.writeFileSync('./example.har', JSON.stringify(generatedHar), 'utf-8')
}