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

export default {
  name: 'AdvanceView',
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
    this.$store.commit('setPage', 'search');
  },
};
</script>
