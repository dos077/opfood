<template>
<div class="col-12">
  <q-toolbar :class="{ 'q-px-lg q-pt-md': !isPhone }">
    <q-btn v-if="tabState === 1" flat round
      icon="mdi-arrow-left"
      @click="$store.commit('load', null)" />
    <q-btn v-if="tabState === 0 && bestList" flat round
      icon="mdi-view-list"
      @click="$store.commit('load', bestList)" />
    <q-toolbar-title class="q-ml-sm">
      <span class="gt-xs text-h6 text-capitalize">
        {{ tabState === 0 ? 'recipes optimizer' : 'recipes list' }}
      </span>
      <span class="lt-sm text-weight-bold">
        {{ tabState === 0 ? 'Optimizer' : 'List' }}
      </span>
    </q-toolbar-title>
    <q-space />
    <q-btn label="bookmarks" color="deep-orange-4" flat
      @click="savesOpen = !savesOpen"
      :icon-right="savesOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
  </q-toolbar>
  <div style="height: 0; overflow: visible; position: relative;"
    :class="{ 'q-mx-lg': !isPhone }">
    <q-slide-transition>
      <q-card v-show="savesOpen" transition="scale" outline
        style="width: 100%; position: absolute; top: 0; left: 0; z-index: 100">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <save-card v-for="index in [0, 1, 2, 3, 4, 5]"
              :list="lists[index] || []" :key="index" :index="index" />
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex';
import SaveCard from './SaveCard.vue';

export default {
  name: 'ToolBar',
  components: {
    SaveCard,
  },
  props: ['tabState'],
  data: () => ({
    savesOpen: false,
  }),
  computed: {
    ...mapState(['bestList', 'currentList']),
    ...mapState('saves', ['lists']),
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  watch: {
    currentList() {
      this.savesOpen = false;
    },
  },
  methods: {
    saveList(index) {
      const list = this.currentList;
      this.$store.commit('saves/add', { list, index });
    },
    loadSearchRes() {
      const { bestList } = this;
      this.$store.commit('loadSearch', bestList);
    },
  },
};
</script>
