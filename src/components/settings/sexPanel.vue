<template>
  <span class="text-overline text-uppercase q-mr-md">sex</span>
  <q-btn-toggle v-model="sexSelected"
    :options="sexOptions" @update:model-value="handleUpdate"
    unelevated toggle-color="deep-orange-4">
  </q-btn-toggle>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SexPanel',
  data: () => ({
    sexOptions: [
      { label: 'male', value: 'male' },
      { label: 'female', value: 'female' },
    ],
    sexSelected: 'male',
  }),
  computed: {
    ...mapState('settings', ['sex']),
  },
  watch: {
    sexSelected(sex) {
      this.$store.commit('settings/set', { sex });
    },
  },
  methods: {
    handleUpdate(val) {
      this.$store.commit('settings/set', { sex: val });
    },
  },
  mounted() {
    this.sexSelected = this.sex;
  },
};
</script>
