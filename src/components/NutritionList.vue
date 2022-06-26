<template>
<q-card flat>
  <q-card-section :class="{ 'q-pa-none': isPhone }">
    <q-separator class="q-mb-md" />
    <div v-if="expanded" class="row justify-between q-mb-sm">
      <q-btn flat round dense icon="mdi-information-outline" @click="introOn = true" />
      <div class="text-h6">{{ title }}</div>
    </div>
    <div class="row q-col-gutter-md">
      <div v-if="!expanded" class="col-6 col-sm-4 text-overline ellipsis">
        <q-btn flat round dense icon="mdi-information-outline" @click="introOn = true" />
        {{ title }}
      </div>
      <div v-for="nutrient in nutrition" :key="nutrient.name"
        :class="expanded ? 'col-6 col-sm-4' : 'col-6 col-sm-2'" class="row">
        <span v-if="expanded" class="text-h6">{{ nutrient.name }}</span>
        <span v-else class="col-7 ellipsis">
          {{ nutrient.name }}
        </span>
        <span :class="expanded ? 'q-pt-sm q-ml-sm' : 'col-5 ellipsis text-caption'">
          {{ expanded || nutrient.fraction === undefined ? printN(nutrient) : '' }}
        </span>
        <q-linear-progress v-if="nutrient.fraction" :value="nutrient.fraction % 1"
          :color="getColor(nutrient)" :track-color="getTrackColor(nutrient)"/>
        <q-tooltip v-if="nutrient.fraction"
          class="text-overline"
          :hide-delay="isPhone ? 1500 : 0"
        >
          {{ nutrient.name }} {{ printN(nutrient) }}
        </q-tooltip>
      </div>
    </div>
  </q-card-section>
</q-card>
<q-dialog v-model="introOn">
  <q-card>
    <q-card-section>
      <p>
        Daily intake targets from
        <a href="https://ods.od.nih.gov/HealthInformation/Dietary_Reference_Intakes.aspx"
          target="_blank"
        >
           the Institute of Medicine
        </a>
      </p>
      <p>
        Nutrient content of recipes estimated with
        <a href="https://whisk.com/recipe-nutrition-calculator/"
          target="_blank"
        >
           Whisk recipe nutrition calculator
        </a>
      </p>
      <p>
        Nutrient estimates are not perfect. Minerals with 0% could be missing data.
        Insufficient dietary intakes do not necessarily result in deficiency syndromes.
      </p>
      <p>
        Refer to
        <a href="https://ods.od.nih.gov/factsheets/list-all/"
          target="_blank"
        >
           NIH’s fact sheet
        </a>
        for more details about micro nutrients
      </p>
    </q-card-section>
    <q-card-actions>
      <q-btn label="okay" flat color="deep-orange-4"
        @click="introOn = false" />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
const colors = ['purple', 'red', 'orange', 'yellow', 'light-green', 'green'];

export default {
  name: 'NutritionList',
  props: ['nutrition', 'title', 'expanded'],
  data: () => ({
    introOn: false,
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
