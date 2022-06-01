<template>
<q-carousel
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
  <q-carousel-slide v-for="({ list }, i) in bestLists" :key="i" :name="i"
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
    slide: 0,
    savesOpen: false,
  }),
  computed: {
    ...mapState(['bestLists', 'currentList']),
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
        this.$store.commit('load', this.bestLists[to].list);
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
