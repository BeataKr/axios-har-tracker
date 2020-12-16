This library was designed for gathering HAR files from requests sent using `axios`

# Usage

In order to use this package import it by 
```
import { AxiosHarTracker } from './axios-har-tracker'
```
and then pass `axios` package into the constructor e.g.
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
writeFileSync('./my-example.har', JSON.stringify(generatedObject), 'utf-8')
```