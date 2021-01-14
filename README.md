![npm](https://img.shields.io/npm/v/axios-har-tracker?color=9cf&style=plastic)

This library was designed for gathering HAR files from requests sent using `axios`

# Credits

Inspiration and some pieces of the code comes from [maciejmaciejewski/request-har](https://github.com/maciejmaciejewski/request-har)

# Usage

In order to use this package install it 
```
npm install axios-har-tracker
```
and import it by 
```
import { AxiosHarTracker } from 'axios-har-tracker'
```
and `axios` package 
```
import axios from 'axios';
```
which will be passed into `AxiosHarTracker` constructor:
```
const axiosTracker = new AxiosHarTracker(axios); 
```

In order to perform an actual request use the axios.get/post/delete... call, examples:
```
await axios.get('http://httpstat.us/200');
```
or with catching an error
```
try {
    await axios.get('http://httpstat.us/404');
} catch (error) {
    console.log("An error appears after call to https:\\httpstat.us/404:", error);
}
```

Every single request is pushed into the object and user can get it by using
```
const generatedObject = axiosTracker.getGeneratedHar();
```
Object can be saved into a file in any time using e.g.
```
writeFileSync('example.har', JSON.stringify(generatedObject), 'utf-8')
```