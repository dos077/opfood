<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    exclusions
  </div>
  <div class="col">
    <q-select v-model="noSelected" multiple dense outlined
      clearable :options="labelOptions"
      :hint="recipesCount ? `${recipesCount} recipes` : undefined"
      color="deep-orange-3" />
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import { filterRecipes } from '@/logics/branchTester';
import { getLabels } from '../../helpers/recipeDb';

export default {
  name: 'NoPanel',
  data: () => ({
    noSelected: [],
    labelOptions: getLabels().sort(),
    recipesCount: null,
  }),
  computed: {
    ...mapState('settings', ['noList', 'onlyList']),
  },
  watch: {
    noSelected(to) {
      const list = [];
      if (to) {
        Object.keys(to).forEach((k) => {
          if (this.labelOptions.includes(to[k])) list.push(to[k]);
        });
      }
      const noList = list.length > 0 ? list.join(', ') : null;
      this.$store.commit('settings/set', { noList });
      this.recipesCount = noList ? filterRecipes(this).length : null;
    },
  },
  mounted() {
    const { noList } = this;
    if (noList) this.noSelected = noList.split(', ');
    else this.noSelected = [];
  },
};
</script>
