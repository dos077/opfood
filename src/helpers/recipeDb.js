const blogJson = require('../data/blog.json');
const recipeJson = require('../data/recipe.json');
const thaiJson = require('../data/hotThai.json');
const preppyJson = require('../data/preppy.json');
const whiskJson = require('../data/whisk.json');
const marionJson = require('../data/marion.json');

const db = [];

const parseNutrition = (nutrition, servings = 1) => {
  let parsed = [...nutrition];
  const folate = nutrition.find(({ name }) => name.match('b9'));
  if (folate) {
    parsed = parsed.filter(({ name }) => !name.match('b9'));
    parsed.push({ ...folate, name: 'folate b9' });
  }
  const carbs = nutrition.find(({ name }) => name.match('carbs'));
  if (carbs) {
    parsed = parsed.filter(({ name }) => !name.match('carbs'));
    parsed.push({ ...carbs, name: 'carbohydrates' });
  }
  return parsed.map((dp) => ({ ...dp, value: dp.value / servings }));
};

const getLabels = (entries = db) => {
  const arr = [];
  entries.forEach(({ labels }) => {
    labels.forEach((l) => {
      if (!arr.includes(l)) arr.push(l);
    });
  });
  return arr;
};

const parseLabels = (labels) => {
  const parsed = [];
  const oldLabels = getLabels();
  labels.forEach((l) => {
    let label = l.toLowerCase();
    if (label.match(', ')) [label] = label.split(', ');
    const oldMatched = oldLabels.find((old) => `${old}s` === label || `${label}s` === old);
    if (oldMatched) {
      parsed.push(oldMatched);
    } else {
      parsed.push(label);
    }
  });
  return parsed;
};

blogJson.forEach(({ title, labels, youtubeId }) => {
  const recipe = recipeJson.find((rp) => rp.youtubeId === youtubeId);
  const whisk = whiskJson.find(({ recipeUrl }) => recipeUrl === recipe.recipeUrl);
  if (whisk && whisk.nutrition) {
    const videoUrl = `https://youtube.com/watch?v=${recipe.youtubeId}`;
    const thumbnail = `https://img.youtube.com/vi/${recipe.youtubeId}/hqdefault.jpg`;
    db.push({
      ...recipe,
      nutrition: parseNutrition(
        whisk.nutrition,
        recipe.servings === whisk.servings ? 1 : (recipe.servings / whisk.servings),
      ),
      title,
      labels: parseLabels(labels),
      videoUrl,
      thumbnail,
    });
  }
});

const megaRecipes = [
  ...thaiJson,
  ...preppyJson,
  ...marionJson,
];

megaRecipes.forEach((recipe) => {
  if (recipe.labels.some((l) => l.match('Condiments'))) return;
  if (recipe.total && recipe.servings) {
    const whisk = whiskJson.find((w) => w.recipeUrl === recipe.recipeUrl);
    if (whisk && whisk.nutrition) {
      db.push({
        ...recipe,
        labels: parseLabels(recipe.labels),
        nutrition: parseNutrition(
          whisk.nutrition,
          recipe.servings === whisk.servings ? 1 : (recipe.servings / whisk.servings),
        ),
      });
    }
  }
});

console.log(db.length, '# of recipes');

export default db;

export { getLabels };
