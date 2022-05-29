import recipeDb from './recipeDb';
import { settingKeys } from '../logics/branchTester';

const store = () => {
  const load = () => (localStorage && localStorage.recipeStore
    ? JSON.parse(localStorage.recipeStore)
      .map((list) => list.map((recipeUrl) => recipeDb.find((dp) => dp.recipeUrl === recipeUrl)))
    : []);

  const db = load();

  const save = () => {
    localStorage.recipeStore = JSON.stringify(
      db.map((list) => list.map(({ recipeUrl }) => recipeUrl)),
    );
  };

  const add = (list, index) => {
    db[index] = list;
    console.log(db);
    save();
  };

  const remove = (index) => {
    db.splice(index, 1);
    save();
  };

  const read = () => [...db];

  return {
    read, add, remove,
  };
};

export default store;

const SettingStore = () => {
  const load = () => (localStorage && localStorage.opfoodSettings
    ? JSON.parse(localStorage.opfoodSettings)
    : {});

  const settings = load();

  const save = () => {
    localStorage.opfoodSettings = JSON.stringify(settings);
  };

  const set = (newSettings) => {
    let changed = false;
    settingKeys.forEach((key) => {
      if (newSettings[key] !== undefined) {
        changed = true;
        settings[key] = newSettings[key];
      }
    });
    if (changed) save();
  };

  const read = () => ({ ...settings });

  return { set, read };
};

export { SettingStore };
