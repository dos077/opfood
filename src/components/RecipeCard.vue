<template>
<div class="col-12 col-sm-4">
  <q-card flat class="row">
    <q-card-section v-if="expanded" class="col-12" :class="{ 'q-pa-none': isPhone }">
      <q-separator class="q-mb-md" />
      <a :href="recipe.videoUrl" target="_blank" aria-label="youtube link">
        <q-img :src="recipe.thumbnail" :ratio="isPhone ? 2.6 : 2.2" aria-label="youtubeTn" />
      </a>
    </q-card-section>
    <q-card-section v-else class="col-5" :class="{ 'q-pa-none': isPhone }">
      <q-separator class="q-mb-md" />
      <a :href="recipe.videoUrl" target="_blank" aria-label="youtube link">
        <q-img :src="recipe.thumbnail" style="width: 100%;" aria-label="youtubeTn" />
      </a>
    </q-card-section>
    <q-card-section :class="{ 'col-12': expanded, 'col-7': !expanded, 'q-pa-none': isPhone }">
      <q-separator v-if="!expanded" class="q-mb-md" />
      <div v-if="expanded" class="text-h6">{{ recipe.title }}</div>
      <div v-if="!expanded" class="text-weight-bold ellipsis q-px-md">{{ recipe.title }}</div>
      <div v-if="expanded" class="text-subtitle1 q-mb-sm">{{ totalTime }}</div>
      <div v-else class="text-caption q-px-md ellipsis">{{ totalTime }}</div>
      <div v-if="expanded && !isPhone">
        <span v-for="label in labels" :key="label"
          class="text-overline q-mr-md">
          {{ label }}
        </span>
      </div>
      <q-separator v-if="expanded && !isPhone" class="q-mb-md" />
      <div>
        <q-btn v-if="expanded" outline :href="recipe.videoUrl"
          target="_blank" class="q-mr-md">video</q-btn>
        <q-btn :outline="expanded" :flat="!expanded" :href="recipe.recipeUrl"
          target="_blank" color="deep-orange-4">full recipe</q-btn>
      </div>
    </q-card-section>
  </q-card>
</div>
</template>

<script>
const min2txt = (min) => {
  if (min < 60) return `${min} minutes`;
  const hr = Math.floor(min / 60);
  return `${hr} hours ${min % 60} minutes`;
};

export default {
  name: 'RecipeCard',
  props: ['recipe', 'expanded'],
  data: () => ({
  }),
  computed: {
    totalTime() {
      return min2txt(this.recipe.total);
    },
    labels() {
      const { labels } = this.recipe;
      return labels.length < 6
        ? labels
        : labels.slice(0, 5);
    },
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
};
</script>
