<template>
<q-card flat>
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
    </div>
  </q-card-section>
  <q-card-actions>
    <q-space />
    <q-btn color="deep-orange-4" @click="$store.dispatch('search')">search</q-btn>
  </q-card-actions>
  <q-dialog v-model="loadingOn" persistent>
    <span class="text-h5 text-white">{{ loadingMsg }}
      <q-spinner color="white" />
    </span>
  </q-dialog>
</q-card>
</template>

<script>
import { mapState } from 'vuex';
import SexPanel from './settings/sexPanel.vue';
import AgePanel from './settings/agePanel.vue';
import MealsPanel from './settings/mealsPanel.vue';
import MacroTargetPanel from './settings/macroTargetPanel.vue';
import TargetEmPanel from './settings/targetEmPanel.vue';
import NutritionEmPanel from './settings/nutritionEmPanel.vue';
import TimeEmPanel from './settings/timeEmPanel.vue';
import OnlyPanel from './settings/onlyPanel.vue';
import NoPanel from './settings/noPanel.vue';

export default {
  name: 'SettingPanel',
  data: () => ({
    loadingOn: false,
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
};
</script>
