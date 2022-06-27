<template>
<div class="q-pt-md">
  <q-dialog v-model="loadingOn" persistent>
    <span class="text-h5 text-white">{{ loadingMsg }}
      <q-spinner color="white" />
    </span>
  </q-dialog>
  <q-infinite-scroll v-if="bestLists && bestLists.length > 0"
    @load="loadMore" :offset="1"
  >
    <div v-for="({ list }, i) in bestLists" :key="i" :name="i"
      style="max-width: 60rem; margin: 0 auto 1.5rem;"
    >
      <div
        class="text-h4"
      >
        <span class="text-grey-4 text-bold"
          style="margin-right: -0.35rem;"
        >
          {{ Math.floor(i / 5) + 1 }}
        </span>
        <span class="text-deep-orange-4">
          {{ i % 5 + 1 }}
        </span>
      </div>
      <q-card
        flat :bordered="!isPhone"
      >
        <quick-list-item :list="list" :index="i" />
      </q-card>
    </div>
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="ornage-4" size="40px" />
      </div>
    </template>
  </q-infinite-scroll>
</div>
</template>

<script>
import { mapState } from 'vuex';
import intro from '@/helpers/intro';
import QuickListItem from '@/components/quick/QuickListItem.vue';

export default {
  name: 'QuickList',
  components: {
    QuickListItem,
  },
  data: () => ({
    loadingOn: false,
    intro,
  }),
  computed: {
    ...mapState(['bestLists', 'loadingMsg']),
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
  watch: {
    loadingMsg: {
      immediate: true,
      handler(to) {
        if (to) this.loadingOn = true;
        else this.loadingOn = false;
      },
    },
  },
  methods: {
    loadMore(index, done) {
      this.$store.dispatch('search', done);
    },
  },
  mounted() {
    this.$store.commit('settings/set', { batchLimit: 2000 });
    this.$store.commit('setThreads', 2);
    if (!this.bestLists || this.bestLists.length < 5) {
      this.$store.dispatch('search');
    }
  },
};
</script>
