<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    search speed
  </div>
  <div class="col">
    <q-slider v-model="targetSelected" :min="0" :max="2" :step="1"
      markers :marker-labels="markerLabels"  color="deep-orange-3"
    />
    <q-tooltip :delay="700">
      <span class="text-caption">
        Thorough search can overwhelm slower devices!
      </span>
    </q-tooltip>
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
      { value: 0, label: 'fast' },
      { value: 2, label: 'thorough' },
    ],
  }),
  computed: {
    ...mapState('settings', ['batchLimit']),
    ...mapState(['threads']),
  },
  watch: {
    targetSelected(val) {
      if (val < 1) {
        this.$store.commit('settings/set', { batchLimit: 2000 });
        this.$store.commit('setThreads', 2);
      } else if (val > 1) {
        this.$store.commit('settings/set', { batchLimit: 10000 });
        this.$store.commit('setThreads', 12);
      } else {
        this.$store.commit('settings/set', { batchLimit: 5000 });
        this.$store.commit('setThreads', 4);
      }
    },
  },
  mounted() {
    const { batchLimit, threads } = this;
    if (batchLimit <= 2000 && threads <= 2) {
      this.targetSelected = 0;
    } else if (batchLimit >= 10000 && threads >= 12) {
      this.targetSelected = 2;
    }
  },
};
</script>
