import recipeDb from '../helpers/recipeDb';
// eslint-disable-next-line no-unused-vars
import findRequire, { sumNutritions, checkRequirement } from '../helpers/dailyRequire';

const calAvg = (arr) => arr.reduce((a, b) => a + b) / arr.length;

const fractToScore = ({ fraction }) => {
  // if (fraction <= 1.5) return fraction ** 0.5 * 2.45;
  if (fraction <= 1.5) return 2 * fraction;
  return 3 - (fraction - 1.5) * 1.2;
};

const scoreNutrients = ({ micros }) => {
  // const macrosAvg = calAvg(macros.map((m) => fractToScore(m)));
  const microAvg = calAvg(micros.map((m) => fractToScore(m)));
  return microAvg;
};

const scoreRecipeTime = ({ total }) => {
  if (total <= 15) return 3;
  if (total >= 195) return 0;
  return 3 - (total - 15) / 60;
};

const scoreTime = (recipes) => {
  const scores = recipes.map(scoreRecipeTime);
  return scores.reduce((a, b) => a + b) / scores.length;
};

const fractionTarget = ({ fraction }, target) => {
  // return 3 - 3 / (1 + (0.25 / (fraction - target)) ** 2);
  if (Math.abs(fraction - target) > 0.5) return 0;
  if (fraction < target) return 6 * (fraction - target + 0.5);
  return -6 * (fraction - target - 0.5);
};

const scoreCutTarget = ({ macros }, target) => calAvg(macros.map((m) => fractionTarget(m, target)));

export { scoreTime, scoreNutrients };

const batchLimit = 12000;

const batchBuilder = (depth, db = recipeDb) => {
  let batch = [];
  const levelLimt = batchLimit ** (1 / depth);
  for (let i = 0; i < depth; i += 1) {
    const level = [];
    if (levelLimt < db.length) {
      while (level.length < levelLimt) {
        const newIndex = Math.floor(Math.random() * db.length);
        if (!level.includes(newIndex)) {
          level.push(newIndex);
        }
      }
    } else {
      db.forEach((dp, index) => level.push(index));
    }
    if (i > 0) {
      const newBatch = [];
      batch.forEach((branch) => {
        level.forEach((newIndex) => {
          if (!branch.includes(newIndex)) newBatch.push([...branch, newIndex]);
        });
      });
      batch = newBatch;
    } else {
      batch = level.map((newIndex) => [newIndex]);
    }
  }
  console.log('batch built', batch.length);
  return batch.map((branch) => branch.map((index) => db[index]));
};

const defaultSettings = () => ({
  sex: 'male',
  age: 30,
  meals: 3,
  days: 1,
  macroTarget: 1,
  nutritionEm: 1,
  timeEm: 1,
  cutTargetEm: 1,
  onlyList: null,
  noList: null,
});

const settingKeys = 'sex age meals days macroTarget nutritionEm timeEm cutTargetEm onlyList noList'
  .split(' ');

const filterRecipes = ({ onlyList, noList }) => {
  let filtered = [...recipeDb];
  if (onlyList) {
    filtered = filtered.filter(({ labels }) => labels.some((l) => onlyList.split(', ').includes(l)));
    filtered = filtered.filter(({ title }) => onlyList.split(', ').some((l) => title.toLowerCase().match(l)));
  }
  if (noList) {
    filtered = filtered.filter(({ labels }) => !labels.some((l) => noList.split(', ').includes(l)));
    filtered = filtered.filter(({ title }) => !noList.split(', ').some((l) => title.toLowerCase().match(l)));
  }
  return filtered;
};

const optimizer = (setupSettings) => {
  const settings = defaultSettings();

  const changeSettings = (newSettings) => {
    settingKeys.forEach((key) => {
      if (newSettings[key] !== undefined) {
        // console.log('updaing key', key, newSettings[key]);
        settings[key] = newSettings[key];
      }
    });
  };

  if (setupSettings) changeSettings(setupSettings);

  const readSettings = () => ({ ...settings });

  const run = () => {
    const {
      sex, age, meals, days, macroTarget, nutritionEm, timeEm, cutTargetEm, onlyList, noList,
    } = settings;
    const filtered = filterRecipes({ onlyList, noList });
    const batch = batchBuilder(meals, filtered);
    const dailyReq = findRequire({ sex, age });
    // let bestBranch = null;
    // let bestScore = null;
    const bestLists = [];
    batch.forEach((branch) => {
      const nutritions = [];
      branch.forEach(({ nutrition }) => nutritions.push(...nutrition));
      const nuSum = sumNutritions(nutritions);
      const reqMet = checkRequirement({ nutrition: nuSum, ...dailyReq }, days);
      let score = 0;
      if (nutritionEm > 0) {
        const nuScore = scoreNutrients(reqMet);
        score += nuScore * nutritionEm * 1.5;
      }
      if (timeEm > 0) {
        const timeScore = scoreTime(branch);
        score += timeScore * timeEm;
      }
      if (macroTarget && cutTargetEm > 0) {
        const cutScore = scoreCutTarget(reqMet, macroTarget);
        score += cutScore * cutTargetEm;
      }
      /* if (!bestScore || score > bestScore) {
        bestBranch = branch;
        bestScore = score;
      } */
      const cutIndex = bestLists.findIndex(({ prf }) => score > prf);
      if (cutIndex > -1) {
        bestLists.splice(cutIndex, 0, { list: branch, prf: score });
      } else if (bestLists.length < 5) {
        bestLists.push({ list: branch, prf: score });
      }
      if (bestLists.length > 5) bestLists.pop();
    });
    return bestLists;
  };

  return { run, readSettings, changeSettings };
};

export default optimizer;
export { settingKeys, filterRecipes };
