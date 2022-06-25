<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    macros
  </div>
  <div class="col">
    <q-slider v-model="targetSelected" :min="0.5" :max="1.5" :step="0.25" @change="update"
      markers :marker-labels="markerLabels"
      color="deep-orange-3" />
    <q-tooltip :delay="700">
      <span class="text-caption">
        NIH recommended daily intakes
      </span>
    </q-tooltip>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MacroTargetPanel',
  data: () => ({
    targetSelected: 1,
    markerLabels: [
      '0.5', '0.75', '1', '1.25', '1.5',
    ],
  }),
  computed: {
    ...mapState('settings', ['macroTarget']),
  },
  watch: {
    targetSelected(macroTarget) {
      this.$store.commit('settings/set', { macroTarget });
    },
  },
  methods: {
    update(val) {
      this.$store.commit('settings/set', { macroTarget: val });
    },
  },
  mounted() {
    this.targetSelected = this.macroTarget;
  },
};
</script>
