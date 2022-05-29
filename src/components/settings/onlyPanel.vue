<template>
<div class="row">
  <div class="text-overline text-uppercase q-mr-md col-auto">
    only
  </div>
  <div class="col">
    <q-select v-model="onlySelected" multiple dense outlined
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
  name: 'OnlyPanel',
  data: () => ({
    onlySelected: [],
    labelOptions: getLabels().sort(),
    recipesCount: null,
  }),
  computed: {
    ...mapState('settings', ['onlyList', 'noList']),
  },
  watch: {
    onlySelected(to) {
      const list = [];
      if (to) {
        Object.keys(to).forEach((k) => {
          if (this.labelOptions.includes(to[k])) list.push(to[k]);
        });
      }
      const onlyList = list.length > 0 ? list.join(', ') : null;
      this.$store.commit('settings/set', { onlyList });
      this.recipesCount = onlyList ? filterRecipes(this).length : null;
    },
  },
  methods: {
    update(val) {
      this.$store.commit('settings/set', { onlyList: val });
    },
  },
  mounted() {
    const { onlyList } = this;
    if (onlyList) this.onlySelected = onlyList.split(', ');
    else this.onlySelected = [];
  },
};
</script>
