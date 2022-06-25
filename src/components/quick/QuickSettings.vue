<template>
  <q-card-section>
    <sex-panel />
    <age-panel />
    <meals-panel />
  </q-card-section>
</template>

<script>
import SexPanel from '../settings/sexPanel.vue';
import AgePanel from '../settings/agePanel.vue';
import MealsPanel from '../settings/mealsPanel.vue';

export default {
  name: 'QuickSettings',
  components: {
    SexPanel,
    AgePanel,
    MealsPanel,
  },
};
</script>
