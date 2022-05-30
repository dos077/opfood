/* eslint-disable no-restricted-globals */
import Optimizer from './branchTester';

self.addEventListener('message', (e) => {
  const opti = Optimizer(e.data);
  const lists = opti.run();
  self.postMessage(lists);
});
