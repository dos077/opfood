<template>
<div>
  <q-toolbar
    class="q-px-none"
    :class="'bg-' + barColor + '-1'"
  >
    <q-tabs v-model="tab" align="left">
      <q-tab :class="'text-' + recipesColor + '-9'" name="recipes">
        <span class="text-overline">
          {{ recipesLabel }}
        </span>
      </q-tab>
      <q-tab :class="'text-' + nutritionColor + '-9'" name="nutrition">
        <span class="text-overline">
          {{ nutritionLabel }}
        </span>
      </q-tab>
    </q-tabs>
    <q-space />
    <q-btn v-if="!savesOpen"
      label="save" flat color="deep-orange-4"
      @click="savesOpen = true"
    />
    <q-btn v-else
      icon="mdi-close" flat color="deep-orange-4"
      @click="savesOpen = false"
    />
  </q-toolbar>
  <div style="height: 0; overflow: visible; position: relative;">
    <q-slide-transition>
      <q-card v-show="savesOpen" transition="scale" outline
        style="width: 100%; position: absolute; top: 0; left: 0; z-index: 100">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <save-card v-for="index in [0, 1, 2, 3, 4, 5]"
              :sList="list" :key="index" :index="index" />
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>
  </div>
  <q-tab-panels
    v-model="tab"
  >
    <q-tab-panel name="recipes">
      <div
        class="row q-col-gutter-sm"
      >
        <recipe-card v-for="recipe in list" :key="recipe.title" :recipe="recipe"
          :expanded="!isPhone"
        />
      </div>
    </q-tab-panel>
    <q-tab-panel name="nutrition">
      <nutrition-list :nutrition="getMarcos(list)" title="Marco Requirement Met"
        :expanded="false"/>
      <nutrition-list :nutrition="getMicros(list)" title="Micro Requirement Met"
        :expanded="false" />
      <nutrition-list :nutrition="getOthers(list)" title="Other Nutrients"
        :expanded="false" />
    </q-tab-panel>
  </q-tab-panels>
  <q-separator
    class="lt-sm q-mx-md"
    :color="barColor + '-3'"
    size="0.1rem"
  />
</div>
</template>

<script>
import { mapState } from 'vuex';
import RecipeCard from '@/components/RecipeCard.vue';
import NutritionList from '@/components/NutritionList.vue';
import SaveCard from '../SaveCard.vue';
import findDailyRequirement, { sumNutritions, checkRequirement } from '../../helpers/dailyRequire';

const min2txt = (min) => {
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  return `${hr} hr ${min % 60} min`;
};

export default {
  name: 'QuickListItem',
  props: ['list', 'index'],
  components: {
    RecipeCard,
    NutritionList,
    SaveCard,
  },
  data: () => ({
    tab: 'recipes',
    savesOpen: false,
  }),
  computed: {
    ...mapState('settings', ['age', 'sex']),
    avgTime() {
      if (!this.list || !this.list.length) return null;
      let totalMin = 0;
      this.list.forEach(({ total }) => { totalMin += total; });
      return Math.round(totalMin / this.list.length);
    },
    recipesLabel() {
      if (this.isPhone) return `${min2txt(this.avgTime)} AVG`;
      return `recipes - ${min2txt(this.avgTime)} average`;
    },
    recipesColor() {
      if (this.avgTime < 20) return 'green';
      if (this.avgTime < 30) return 'light-green';
      if (this.avgTime < 45) return 'lime';
      if (this.avgTime < 70) return 'yellow';
      if (this.avgTime < 100) return 'orange';
      return 'red';
    },
    reqMet() {
      const { age, sex, list } = this;
      const nutritions = [];
      list.forEach(({ nutrition }) => nutritions.push(...nutrition));
      const requirements = findDailyRequirement({ age, sex });
      return checkRequirement({ nutrition: sumNutritions(nutritions), ...requirements });
    },
    avgMicros() {
      if (!this.reqMet) return null;
      let total = 0;
      let n = 0;
      this.reqMet.micros.forEach((m) => {
        if (m.fraction) {
          total += m.fraction < 1 ? m.fraction : 1;
          n += 1;
        }
      });
      return total / n;
    },
    avgMacros() {
      if (!this.reqMet) return null;
      let total = 0;
      let n = 0;
      this.reqMet.macros.forEach((m) => {
        if (m.fraction) {
          total += m.fraction < 1 ? m.fraction : 1;
          n += 1;
        }
      });
      return total / n;
    },
    nutritionLabel() {
      const micro = Math.round(this.avgMicros * 100);
      const macro = Math.round(this.avgMacros * 100);
      if (this.isPhone) return `ma${macro}%, mi${micro}%`;
      return `Nutrition - Macros ${macro}%, Micros ${micro}%`;
    },
    nutritionColor() {
      const { avgMicros, avgMacros } = this;
      if (avgMicros > 0.95 && avgMacros > 0.95) return 'green';
      if (avgMicros > 0.9 && avgMacros > 0.9) return 'light-green';
      if (avgMicros > 0.85 && avgMacros > 0.85) return 'lime';
      if (avgMicros > 0.8 && avgMacros > 0.8) return 'yellow';
      if (avgMicros > 0.75 && avgMacros > 0.75) return 'amber';
      if (avgMicros > 0.7 && avgMacros > 0.7) return 'orange';
      return 'red';
    },
    barColor() {
      if (this.tab === 'recipes') return this.recipesColor;
      return this.nutritionColor;
    },
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  methods: {
    getMicros() {
      return this.reqMet.micros;
    },
    getMarcos() {
      return this.reqMet.macros;
    },
    getOthers() {
      return this.reqMet.others;
    },
  },
};
</script>
