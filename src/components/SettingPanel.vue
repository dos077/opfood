<template>
<q-card flat
  style="max-width: 100vw; overflow: hidden;"
  class="q-pb-md"
>
  <q-card-section :class="{ 'q-pa-none': isPhone }">
    <q-separator class="q-mb-md" />
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 q-mb-sm">
        <sex-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm">
        <age-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm q-pr-sm">
        <meals-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm q-pr-sm">
        <macro-target-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm q-pr-sm">
        <target-em-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm q-pr-sm">
        <nutrition-em-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm q-pr-sm">
        <time-em-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm">
        <only-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm">
        <no-panel />
      </div>
      <div class="col-12 col-sm-6 q-mb-sm">
        <depth-panel />
      </div>
    </div>
  </q-card-section>
  <q-card-actions :class="{ 'q-pa-none': isPhone }">
    <q-btn color="deep-orange-4"
      to="quick"
      icon="mdi-arrow-left"
    >back</q-btn>
    <q-space />
    <q-btn
      outline color="deep-orange-4"
      @click="$store.dispatch('search')"
    >search</q-btn>
    <q-separator vertical class="q-mx-md" />
    <q-btn flat round dense icon="mdi-information-outline" @click="introOn = true" />
  </q-card-actions>
  <q-dialog v-model="loadingOn" persistent>
    <span class="text-h5 text-white">{{ loadingMsg }}
      <q-spinner color="white" />
    </span>
  </q-dialog>
  <q-dialog v-model="introOn">
    <q-card>
      <q-card-section>
        <p v-for="(p, i) in intro" :key="i">
          {{ p }}
        </p>
      </q-card-section>
      <q-card-actions>
        <q-btn label="find recipes" flat color="deep-orange-4"
          @click="introOn = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-card>
</template>

<script>
import { mapState } from 'vuex';
import intro from '@/helpers/intro';
import SexPanel from './settings/sexPanel.vue';
import AgePanel from './settings/agePanel.vue';
import MealsPanel from './settings/mealsPanel.vue';
import MacroTargetPanel from './settings/macroTargetPanel.vue';
import TargetEmPanel from './settings/targetEmPanel.vue';
import NutritionEmPanel from './settings/nutritionEmPanel.vue';
import TimeEmPanel from './settings/timeEmPanel.vue';
import OnlyPanel from './settings/onlyPanel.vue';
import NoPanel from './settings/noPanel.vue';
import depthPanel from './settings/depthPanel.vue';

export default {
  name: 'SettingPanel',
  data: () => ({
    loadingOn: false,
    introOn: false,
    intro,
  }),
  components: {
    SexPanel,
    AgePanel,
    MealsPanel,
    MacroTargetPanel,
    TargetEmPanel,
    NutritionEmPanel,
    TimeEmPanel,
    OnlyPanel,
    NoPanel,
    depthPanel,
  },
  computed: {
    ...mapState(['loadingMsg']),
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  watch: {
    loadingMsg(to) {
      if (to === null) this.loadingOn = false;
      else this.loadingOn = true;
    },
  },
  mounted() {
    if (localStorage && localStorage.opfoodSettings) {
      this.introOn = false;
    }
  },
};
</script>
