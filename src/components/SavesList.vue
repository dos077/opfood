<template>
<q-carousel
  v-if="!currentList"
  v-model="slide"
  animated
  transition-prev="slide-right"
  transition-next="slide-left"
  height="100%"
  navigation
  navigation-position="top"
  swipeable
  control-color="deep-orange-4"
  :navigation-active-icon="`mdi-numeric-${slide + 1}-circle`"
>
  <q-carousel-slide v-for="(list, i) in lists" :key="i" :name="i"
    :class="{ 'q-px-none': isPhone }"
  >
    <div class="row q-col-gutter-md" :class="isPhone ? 'q-mt-lg' : 'q-mt-sm'">
      <recipe-card v-for="recipe in list" :key="recipe.title" :recipe="recipe"
        :expanded="tabSelected === 1" />
      <div class="col-12">
        <nutrition-list :nutrition="getMarcos(list)" title="Marco Requirement Met"
          :expanded="tabSelected === 0"/>
      </div>
      <div class="col-12">
        <nutrition-list :nutrition="getMicros(list)" title="Micro Requirement Met"
        :expanded="tabSelected === 2" />
      </div>
      <div class="col-12">
        <nutrition-list :nutrition="getOthers(list)" title="Other Nutrients"
        :expanded="tabSelected === 3" />
      </div>
    </div>
  </q-carousel-slide>
</q-carousel>
<div v-else
  class="row q-col-gutter-md"
  :class="isPhone ? 'q-mt-lg' : 'q-mt-sm'"
>
  <recipe-card v-for="recipe in currentList" :key="recipe.title" :recipe="recipe"
    :expanded="tabSelected === 1" />
  <div class="col-12">
    <nutrition-list :nutrition="getMarcos(currentList)" title="Marco Requirement Met"
      :expanded="tabSelected === 0"/>
  </div>
  <div class="col-12">
    <nutrition-list :nutrition="getMicros(currentList)" title="Micro Requirement Met"
    :expanded="tabSelected === 2" />
  </div>
  <div class="col-12">
    <nutrition-list :nutrition="getOthers(currentList)" title="Other Nutrients"
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
  name: 'SavesList',
  components: { RecipeCard, NutritionList },
  data: () => ({
    tabSelected: 1,
    slide: 0,
  }),
  computed: {
    ...mapState(['currentList']),
    ...mapState('saves', ['lists']),
    ...mapState('settings', ['age', 'sex']),
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  watch: {
    slide: {
      immediate: true,
      handler(to) {
        const selectedList = this.lists[to];
        this.$store.commit('saves/selectSave', selectedList);
      },
    },
  },
  methods: {
    getReqMet(list) {
      const { age, sex } = this;
      const nutritions = [];
      list.forEach(({ nutrition }) => nutritions.push(...nutrition));
      const requirements = findDailyRequirement({ age, sex });
      return checkRequirement({ nutrition: sumNutritions(nutritions), ...requirements });
    },
    getMicros(list) {
      const reqMet = this.getReqMet(list);
      return reqMet.micros;
    },
    getMarcos(list) {
      const reqMet = this.getReqMet(list);
      return reqMet.macros;
    },
    getOthers(list) {
      const reqMet = this.getReqMet(list);
      return reqMet.others;
    },
    shareUrl(list) {
      const titles = list.map(({ title }) => title);
      const url = new URL(window.location.href);
      url.searchParams.append('titles', titles.join('|'));
      navigator.clipboard.writeText(url.toString());
    },
  },
};
</script>
