<template>
  <div class="row q-col-gutter-md">
    <div v-if="currentList" class="col-12">
      <nutrition-list :nutrition="macroList" title="Marco Requirement Met"
        :expanded="tabSelected === 0"/>
    </div>
    <recipe-card v-for="recipe in currentList" :key="recipe.title" :recipe="recipe"
      :expanded="tabSelected === 1" />
    <div v-if="currentList" class="col-12">
      <nutrition-list :nutrition="microList" title="Micro Requirement Met"
      :expanded="tabSelected === 2" />
    </div>
    <div v-if="currentList" class="col-12">
      <nutrition-list :nutrition="otherList" title="Other Nutrients"
      :expanded="tabSelected === 3" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import RecipeCard from './RecipeCard.vue';
import NutritionList from './NutritionList.vue';
import findDailyRequirement, { sumNutritions, checkRequirement } from '../helpers/dailyRequire';

export default {
  name: 'RecipesList',
  components: { RecipeCard, NutritionList },
  data: () => ({
    tabSelected: 1,
  }),
  computed: {
    ...mapState(['bestList', 'currentList']),
    ...mapState('saves', ['lists']),
    ...mapState('settings', ['age', 'sex']),
    reqMet() {
      if (!this.currentList) return null;
      const { currentList, age, sex } = this;
      const nutritions = [];
      currentList.forEach(({ nutrition }) => nutritions.push(...nutrition));
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
};
</script>
