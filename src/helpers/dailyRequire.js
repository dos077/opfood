const macroDb = require('../data/marcoRequirement.json');
const microDb = require('../data/microRequirement.json');

const parsedMacros = [];
macroDb.forEach((ev) => {
  if (ev.name.match('carbohydrate')) parsedMacros.push({ ...ev, name: 'carbohydrates' });
  else if (ev.name.match('protein')) parsedMacros.push({ ...ev, name: 'protein' });
  else if (ev.name.match('fiber')) parsedMacros.push({ ...ev, name: 'dietary fiber' });
});

const findRequire = ({ sex, age }) => {
  const micros = microDb
    .filter(({ name }) => name !== 'vitamin d')
    .filter((ev) => ev.sex === sex && age >= ev.min && age <= ev.max);
  const macros = parsedMacros.filter((ev) => ev.sex === sex && age >= ev.min && age <= ev.max);
  return { micros, macros };
};

export default findRequire;

const sumNutritions = (nutritions) => {
  const sums = [];
  nutritions.forEach(({ name, value, unit }) => {
    const entry = sums.find((ev) => ev.name === name);
    if (!entry) {
      sums.push({ name, value, unit });
    } else {
      entry.value += value;
    }
  });
  return sums;
};

const matchNames = (a, b) => {
  const nameA = a.name.toLowerCase().trim();
  const nameB = b.name.toLowerCase().trim();
  return nameA.match(nameB) || nameB.match(nameA);
};

const checkRequirement = ({ nutrition, micros, macros }, days = 1) => {
  const res = {
    micros: [],
    macros: [],
  };
  micros.forEach((micro) => {
    const { name, value } = micro;
    const matched = nutrition.find((dp) => matchNames(dp, micro));
    if (matched) {
      res.micros.push({ name, fraction: matched.value / (value * days) });
    } else res.micros.push({ name, fraction: 0 });
  });
  macros.forEach((macro) => {
    const { name, value } = macro;
    const matched = nutrition.find((dp) => matchNames(dp, macro));
    if (matched) {
      res.macros.push({ name, fraction: matched.value / (value * days) });
    } else res.macros.push({ name, fraction: 0 });
  });
  res.others = nutrition
    .filter((dp) => {
      const microMatched = micros.some((m) => matchNames(dp, m));
      const marcoMatched = macros.some((m) => matchNames(dp, m));
      return !microMatched && !marcoMatched;
    }).map((dp) => ({
      ...dp,
      value: Math.round((dp.value * 100) / days) / 100,
    }));
  return res;
};

export { checkRequirement, sumNutritions };
