/* eslint-disable no-await-in-loop */
import { createStore } from 'vuex';
import Optimizer, { settingKeys } from '@/logics/branchTester';
import LocalStore, { SettingStore } from '../helpers/localStore';

const opti = Optimizer();

const localStore = LocalStore();
const savedSettings = SettingStore();

opti.changeSettings(savedSettings.read());

// eslint-disable-next-line no-promise-executor-return
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const saves = {
  namespaced: true,
  state: () => ({
    lists: localStore.read(),
    saveSelected: null,
  }),
  mutations: {
    add(state, { list, index }) {
      console.log('saving list', list, index);
      localStore.add(list, index);
      state.lists = localStore.read();
    },
    remove(state, index) {
      localStore.remove(index);
      state.lists = localStore.read();
    },
    selectSave(state, val) {
      state.saveSelected = val;
    },
  },
};

const settings = {
  namespaced: true,
  state: () => opti.readSettings(),
  mutations: {
    set(state, obj) {
      opti.changeSettings(obj);
      savedSettings.set(obj);
      const updatedSettings = opti.readSettings();
      settingKeys.forEach((key) => {
        state[key] = updatedSettings[key];
      });
    },
  },
};

export default createStore({
  state: () => ({
    bestLists: [],
    currentList: null,
    threads: 4,
    loadingMsg: null,
    page: 'search',
  }),
  getters: {
  },
  mutations: {
    search(state) {
      state.bestLists = opti.run();
      state.page = 'list';
      // state.currentList = state.bestList;
    },
    loadSearch(state, best) {
      state.bestLists = best;
      state.page = 'list';
    },
    load(state, list) {
      state.currentList = list;
    },
    setThreads(state, val) {
      state.threads = val;
    },
    setLoading(state, val) {
      state.loadingMsg = val;
    },
    setPage(state, val) {
      state.page = val;
    },
  },
  actions: {
    async search({ state, commit, rootState }) {
      const { threads } = state;
      const searchSettings = {};
      settingKeys.forEach((key) => {
        searchSettings[key] = rootState.settings[key];
      });
      commit('setLoading', 'searching for recipes');
      const start = Date.now();
      const workers = [];
      const threadsDone = [];
      for (let i = 0; i < threads; i += 1) {
        const worker = new Worker(new URL('../logics/optThread.js', import.meta.url));
        workers.push(worker);
        worker.onmessage = ((ev) => {
          threadsDone.push(ev.data);
        });
        worker.onerror = (err) => console.log(err);
        worker.postMessage(searchSettings);
      }
      while (threadsDone.length < threads) {
        await wait(2000);
      }
      const bestLists = [];
      threadsDone.forEach((lists) => {
        lists.forEach(({ list, prf }) => {
          const cutIndex = bestLists.findIndex((dp) => prf > dp.prf);
          if (cutIndex > -1) {
            bestLists.splice(cutIndex, 0, { list, prf });
          } else if (bestLists.length < 5) {
            bestLists.push({ list, prf });
          }
          if (bestLists.length > 5) bestLists.pop();
        });
      });
      workers.forEach((worker) => worker.terminate());
      console.log('search speed score', (Date.now() - start) / 60000);
      if (bestLists.length > 0) {
        commit('loadSearch', bestLists);
      }
      commit('setLoading', null);
    },
  },
  modules: {
    settings,
    saves,
  },
});
