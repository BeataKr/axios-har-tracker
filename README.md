This library was designed for gathering HAR files from requests sent using `axios`

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

In order to perform an actual request use the axios.get/post/delete... call.

Every single request is pushed into the object and user can get this object by using
```
const generatedObject = axiosTracker.getGeneratedHar();
```
Object can be saved into a file in any time using e.g.
```
writeFileSync('my-example.har', JSON.stringify(generatedObject), 'utf-8')
```