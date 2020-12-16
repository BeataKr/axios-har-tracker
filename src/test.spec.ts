import * as jest from 'jest';
import axios from 'axios';
import * as sinon from 'sinon';
import { AxiosHarTracker } from './axios-har-tracker'

describe('Check axios-har-tracker', () => {

    let axiosTracker, myMock

    beforeEach(async () => {
      axiosTracker = new AxiosHarTracker(axios);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should use sendRequestToApi', async () => {
      myMock = jest.spyOn(axiosTracker, 'getGeneratedHar');
      axiosTracker.getGeneratedHar();
      expect(myMock).toHaveBeenCalled();
      expect(myMock).toHaveBeenCalledWith({ status: 200 });
    });

    xit('should call rest with 200 code', async () => {
      sinon.stub(axiosTracker, 'axios').returns({
        status: 200
      });
  
      const response = await axios.get('http://www.google.com/');
      expect(response.status).to.eq(202);
    });

    xit('should call rest with 404 code', async () => {
      sinon.stub(axiosTracker, 'axios').returns({
        status: 404
      });
  
      const response = await axios.get('http://www.google.com/non-existing-page');
      expect(response.status).to.eq(404);
    });

    // afterAll(async () => {
    //   writeFileSync('./my-example3.har', JSON.stringify(generatedHar1), 'utf-8')
    // });

});
