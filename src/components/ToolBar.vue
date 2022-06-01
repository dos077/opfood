<template>
<div class="col-12">
  <q-toolbar :class="{ 'q-px-lg q-mt-md': !isPhone }">
    <q-btn @click="$store.commit('setPage', 'search')"
      :label="page === 'search' ? undefined : 'search'"
      :icon="page === 'search' ? 'mdi-magnify' : undefined"
      :outline="page === 'search'"
      :flat="page !== 'search'"
      :color="page === 'search' ? 'deep-orange-4' : undefined"
    />
    <q-btn v-if="bestLists.length > 0"
      @click="$store.commit('setPage', 'list')"
      :label="page === 'list' ? undefined : 'results'"
      :icon="page === 'list' ? 'mdi-view-list' : undefined"
      :outline="page === 'list'"
      :flat="page !== 'list'"
      :color="page === 'list' ? 'deep-orange-4' : undefined"
    />
    <q-btn v-if="lists && lists.length > 0"
      @click="$store.commit('setPage', 'saves')"
      :label="page === 'saves' ? undefined : 'bookmarks'"
      :icon="page === 'saves' ? 'mdi-bookmark-multiple' : undefined"
      :color="page === 'saves' ? 'deep-orange-4' : undefined"
      :outline="page === 'saves'"
      :flat="page !== 'saves'"
    />
    <q-space />
    <q-btn v-if="page === 'list'" :label="savesOpen ? undefined : 'save'" color="deep-orange-4" flat
      @click="savesOpen = !savesOpen"
      :icon-right="savesOpen ? 'mdi-close' : undefined" />
    <q-btn v-if="page === 'saves'" label="share"
      color="deep-orange-4" flat
      @click="shareUrl">
      <q-popup-proxy>
        <q-banner>
          Link copied
        </q-banner>
      </q-popup-proxy>
    </q-btn>
  </q-toolbar>
  <div v-if="page === 'list'" style="height: 0; overflow: visible; position: relative;"
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
    sharedMsg: false,
  }),
  computed: {
    ...mapState(['bestLists', 'currentList', 'page']),
    ...mapState('saves', ['lists', 'saveSelected']),
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
    togglePage() {
      const newPage = this.page === 'search' ? 'list' : 'search';
      this.$store.commit('setPage', newPage);
    },
    shareUrl() {
      const titles = this.saveSelected.map(({ title }) => title);
      const url = new URL(window.location.href);
      url.searchParams.append('titles', titles.join('|'));
      navigator.clipboard.writeText(url.toString());
      this.sharedMsg = true;
    },
  },
};
</script>
