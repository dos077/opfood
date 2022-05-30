<template>
<div class="home">
  <div style="max-width: 72rem; margin: 0 auto">
    <div class="row">
      <tool-bar :tabState="panelSelected" />
      <q-tab-panels v-model="panelSelected"
        :swipeable="false" vertical
        transition-next="slide-up"
        transition-prev="slide-down">
        <q-tab-panel :name="0" style="padding-top: 0;">
          <setting-panel />
        </q-tab-panel>
        <q-tab-panel :name="1" style="padding-top: 0;">
          <recipes-list />
        </q-tab-panel>
        <q-tab-panel :name="2" style="padding-top: 0;">
          <saves-list />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import SettingPanel from '../components/SettingPanel.vue';
import RecipesList from '../components/RecipesList.vue';
import SavesList from '../components/SavesList.vue';
import ToolBar from '../components/ToolBar.vue';

export default {
  name: 'HomeView',
  components: {
    SettingPanel,
    RecipesList,
    SavesList,
    ToolBar,
  },
  data: () => ({
    panelSelected: 0,
  }),
  computed: {
    ...mapState(['currentList', 'page']),
    isDesktop() {
      return this.$q.screen.gt.sm;
    },
  },
  watch: {
    page(to) {
      if (to === 'search') this.panelSelected = 0;
      else if (to === 'list') this.panelSelected = 1;
      else this.panelSelected = 2;
    },
    isDesktop: {
      immediate: true,
      handler(to) {
        if (to) this.$store.commit('setThreads', 10);
        else this.$store.commit('setThreads', 4);
      },
    },
  },
};
</script>
