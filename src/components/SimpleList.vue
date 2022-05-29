<template>
<div class="q-pa-md" style="max-width: 60rem; margin: 0 auto">
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12"><setting-panel /></div>
  </div>
  <div v-if="bestList" class="row" :class="{ 'q-col-gutter-md' : !isPhone }">
    <div v-for="recipe in bestList" :key="recipe.title" class="col-12">
      <recipe-card :recipe="recipe" />
    </div>
    <div class="col-12">
      <q-card bordered flat>
        <q-card-section>
          <div class="row justify-between">
            <div class="col text-h6">Marco Requirement Met</div>
            <div class="col text-right">
              <q-btn round flat icon="mdi-information-outline"></q-btn>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <nutrition-list v-if="macroList" :nutrition="macroList" />
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12">
      <q-card bordered flat>
        <q-card-section>
          <div class="row justify-between">
            <div class="col text-h6">Marco Requirement Met</div>
            <div class="col text-right">
              <q-btn round flat icon="mdi-information-outline"></q-btn>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <nutrition-list v-if="microList" :nutrition="microList" />
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12">
      <q-card bordered flat>
        <q-card-section>
          <div class="row justify-between">
            <div class="col text-h6">Other Nutrients</div>
            <div class="col text-right">
              <q-btn round flat icon="mdi-information-outline"></q-btn>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <nutrition-list v-if="otherList" :nutrition="otherList" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import { getLabels } from '../helpers/recipeDb';
import findDailyRequirement, { sumNutritions, checkRequirement } from '../helpers/dailyRequire';
import Optimizer from '../logics/branchTester';
import NutritionList from './NutritionList.vue';
import RecipeCard from './RecipeCard.vue';
import SettingPanel from './SettingPanel.vue';

/* const recipeCols = [
  { name: 'title', label: 'title', field: 'title' },
  { name: 'prep', label: 'prep', field: 'prep' },
  { name: 'cook', label: 'cook', field: 'cook' },
  { name: 'servings', label: 'servings', field: 'servings' },
]; */

const opti = Optimizer();

export default {
  name: 'SimpleList',
  components: {
    NutritionList, RecipeCard, SettingPanel,
  },
  data: () => ({
    nuCols: [
      { name: 'name', field: 'name' },
      { name: 'value', field: 'value' },
      { name: 'unit', field: 'unit' },
    ],
    reqCols: [
      { name: 'name', field: 'name' },
      { name: 'fraction', field: 'fraction' },
    ],
    recipeLabels: getLabels(),
    recipeCols: [
      { name: 'title', field: 'title' },
      { name: 'prep', field: 'prep' },
      { name: 'cook', field: 'cook' },
      { name: 'labels', field: 'labels' },
    ],
    age: 35,
    sex: 'male',
  }),
  computed: {
    ...mapState(['bestList']),
    reqMet() {
      if (!this.bestList) return null;
      const { bestList, age, sex } = this;
      const nutritions = [];
      bestList.forEach(({ nutrition }) => nutritions.push(...nutrition));
      const requirements = findDailyRequirement({ age, sex });
      return checkRequirement({ nutrition: sumNutritions(nutritions), ...requirements });
    },
    microList() {
      if (!this.reqMet) return null;
      return this.reqMet.micros;
    },
    macroList() {
      if (!this.reqMet) return null;
      return this.reqMet.macros;
    },
    otherList() {
      if (!this.reqMet) return null;
      return this.reqMet.others;
    },
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  methods: {
    getBest() {
      this.bestList = opti.run();
    },
  },
};
</script>
