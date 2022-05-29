/* eslint-disable no-restricted-globals */
import Optimizer from './branchTester';

self.addEventListener('message', (e) => {
  const opti = Optimizer(e.data);
  const { list, prf } = opti.run();
  self.postMessage({
    list, prf,
  });
});
