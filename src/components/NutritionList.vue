<template>
<q-card flat>
  <q-card-section :class="{ 'q-pa-none': isPhone }">
    <q-separator class="q-mb-md" />
    <div v-if="expanded" class="row justify-between q-mb-sm">
      <div class="text-h6">{{ title }}</div>
    </div>
    <div class="row q-col-gutter-md">
      <div v-if="!expanded" class="col-6 col-sm-4 text-overline ellipsis">
        {{ title }}
      </div>
      <div v-for="nutrient in nutrition" :key="nutrient.name"
        :class="expanded ? 'col-6 col-sm-4' : 'col-6 col-sm-2'" class="row">
        <span v-if="expanded" class="text-h6">{{ nutrient.name }}</span>
        <span v-else class="col-7 ellipsis">
          {{ nutrient.name }}
          <q-tooltip class="text-overline" :hide-delay="isPhone ? 1500 : 0">
            {{ printN(nutrient) }}
          </q-tooltip>
        </span>
        <span :class="expanded ? 'q-pt-sm q-ml-sm' : 'col-5 ellipsis text-caption'">
          {{ expanded || nutrient.fraction === undefined ? printN(nutrient) : '' }}
        </span>
        <q-linear-progress v-if="nutrient.fraction" :value="nutrient.fraction % 1"
          :color="getColor(nutrient)" :track-color="getTrackColor(nutrient)"/>
      </div>
    </div>
  </q-card-section>
</q-card>
</template>

<script>
const colors = ['purple', 'red', 'orange', 'yellow', 'light-green', 'green'];

export default {
  name: 'NutritionList',
  props: ['nutrition', 'title', 'expanded'],
  data: () => ({
  }),
  computed: {
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  methods: {
    printN({ fraction, unit, value }) {
      if (fraction !== undefined) {
        const percent = Math.round(fraction * 10000) / 100;
        return `${percent}%`;
      }
      return `${value}${unit}`;
    },
    getColor({ fraction }) {
      if (fraction >= 1 && fraction <= 1.5) return colors[5];
      if (fraction > 4) return colors[0];
      if (fraction < 1) return colors[Math.floor(fraction / 0.2)];
      return colors[Math.floor(5 - (fraction - 1.5) / 0.5)];
    },
    getTrackColor({ fraction }) {
      if (fraction < 1) return undefined;
      if (fraction >= 1 && fraction < 2) return colors[5];
      if (fraction > 4.5) return colors[0];
      return colors[Math.floor(5 - (fraction - 2) / 0.5)];
    },
  },
};
</script>
