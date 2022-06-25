<template>
<q-toolbar>
  <q-toolbar-title shrink>
    Advnace
  </q-toolbar-title>
  <q-separator class="gt-xs" vertical />
  <div class="gt-xs">
    <q-btn flat
      label="search"
      :disable="page === 'search'"
      @click="$store.commit('setPage', 'search')"
    />
    <q-btn flat
      v-if="bestLists && bestLists.length > 0"
      label="results"
      :disable="page === 'results'"
      @click="$store.commit('setPage', 'results')"
    />
  </div>
  <q-space />
  <q-btn
    class="lt-sm"
    icon="mdi-bookmark"
    flat round
    to="bookmarks"
  />
  <q-btn
    class="gt-xs"
    icon="mdi-bookmark" label="bookmarks"
    flat
    to="bookmarks"
  />
  <q-btn round flat
    class="lt-sm"
    icon="mdi-flash"
    to="quick"
  />
  <q-btn flat
    class="gt-xs"
    icon="mdi-flash"
    label="quick search"
    to="quick"
  />
</q-toolbar>
<q-toolbar class="lt-sm">
  <q-btn flat
    label="search"
    :disable="page === 'search'"
    @click="$store.commit('setPage', 'search')"
  />
  <q-btn flat
    v-if="bestLists && bestLists.length > 0"
    label="results"
    :disable="page === 'results'"
    @click="$store.commit('setPage', 'results')"
  />
</q-toolbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AdvanceBar',
  components: {
  },
  data: () => ({
    currentTab: 'search',
  }),
  computed: {
    ...mapState(['page', 'bestLists']),
  },
  watch: {
    page(to) {
      if (this.currentTab !== to) this.currentTab = to;
    },
    currentTab(to) {
      if (this.page !== to) this.$store.commit('setPage', to);
    },
    bestLists(to) {
      if (to && to.length > 0) this.$store.commit('setPage', 'results');
      else this.$store.commit('setPage', 'search');
    },
  },
  methods: {
  },
};
</script>
