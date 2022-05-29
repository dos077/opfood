<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    quickness emphasis
  </div>
  <div class="col">
    <q-slider v-model="targetSelected" :min="0" :max="2" :step="0.5" @change="update"
      markers :marker-labels="markerLabels"  color="deep-orange-3" />
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TimeEmPanel',
  data: () => ({
    targetSelected: 1,
    markerLabels: [
      { value: 0, label: '0X' },
      { value: 2, label: '2X' },
    ],
  }),
  computed: {
    ...mapState('settings', ['timeEm']),
  },
  watch: {
    targetSelected(timeEm) {
      this.$store.commit('settings/set', { timeEm });
    },
  },
  methods: {
    update(val) {
      this.$store.commit('settings/set', { timeEm: val });
    },
  },
  mounted() {
    this.targetSelected = this.timeEm;
  },
};
</script>
