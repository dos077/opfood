<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    age({{ age }})
  </div>
  <div class="col">
    <q-slider v-model="ageSelected" :min="20" :max="70"
      label color="deep-orange-3" />
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AgePanel',
  data: () => ({
    ageSelected: 30,
  }),
  computed: {
    ...mapState('settings', ['age']),
  },
  watch: {
    ageSelected(age) {
      this.$store.commit('settings/set', { age });
    },
  },
  methods: {
    updateAge(val) {
      this.$store.commit('settings/set', { age: val });
    },
  },
  mounted() {
    this.ageSelected = this.age;
  },
};
</script>
