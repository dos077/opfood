<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    dishes
  </div>
  <div class="col">
    <q-slider v-model="mealsSelected" :min="1" :max="5" @change="update"
      markers marker-labels
      color="deep-orange-3" />
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MealsPanel',
  data: () => ({
    mealsSelected: 3,
  }),
  computed: {
    ...mapState('settings', ['meals']),
  },
  watch: {
    mealsSelected(meals) {
      this.$store.commit('settings/set', { meals });
    },
  },
  methods: {
    update(val) {
      this.$store.commit('settings/set', { meals: val });
    },
  },
  mounted() {
    this.mealsSelected = this.meals;
  },
};
</script>
