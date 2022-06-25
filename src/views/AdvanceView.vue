<template>
  <div style="max-width: 72rem; margin: 0 auto">
    <div class="q-mx-md">
      <setting-panel v-if="page === 'search'" />
      <recipes-list
        v-if="page === 'results'"
      />
    </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import SettingPanel from '../components/SettingPanel.vue';
import RecipesList from '../components/RecipesList.vue';
import recipeDb from '../helpers/recipeDb';

export default {
  name: 'HomeView',
  components: {
    SettingPanel,
    RecipesList,
  },
  data: () => ({
    currentTab: 'search',
  }),
  computed: {
    ...mapState(['bestLists', 'page']),
    isDesktop() {
      return this.$q.screen.gt.sm;
    },
  },
  watch: {
    page(to) {
      if (this.currentTab !== to) this.currentTab = to;
    },
    currentTab(to) {
      if (this.page !== to) this.$store.commit('setPage', to);
    },
  },
  mounted() {
    const query = window.location.search;
    const urlParams = new URLSearchParams(query);
    const titles = urlParams.get('titles');
    if (titles) {
      const recipes = titles
        .split('|')
        .map((title) => recipeDb.find((dp) => dp.title === title));
      this.$store.commit('loadSearch', [{ list: recipes }]);
      this.$store.commit('setPage', 'list');
      const url = new URL(window.location);
      url.searchParams.delete('titles');
      window.history.replaceState({}, '', url);
    } else {
      this.$store.commit('setPage', 'search');
    }
  },
};
</script>
