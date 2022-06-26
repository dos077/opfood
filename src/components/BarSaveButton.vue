<template>
<q-btn class="gt-xs"
  :label="savesOpen ? 'close' : 'save'"
  flat
  @click="savesOpen = !savesOpen"
  :icon="savesOpen ? 'mdi-close' : 'mdi-content-save'" />
<q-btn class="lt-sm"
  round flat
  @click="savesOpen = !savesOpen"
  :icon="savesOpen ? 'mdi-close' : 'mdi-content-save'" />
<div style="width: 100%; height: 0; overflow: visible; position: absolute; bottom: 0; right: 0;">
  <q-slide-transition>
    <q-card v-show="savesOpen" transition="scale" outline
      style="width: 100%; position: z-index: 100; float: right; max-width: 72rem;"
    >
      <q-card-section>
        <div class="row q-col-gutter-md">
          <save-card v-for="index in [0, 1, 2, 3, 4, 5]"
            :list="lists[index] || []" :key="index" :index="index" />
        </div>
      </q-card-section>
    </q-card>
  </q-slide-transition>
</div>
</template>

<script>
import { mapState } from 'vuex';
import SaveCard from './SaveCard.vue';

export default {
  name: 'BarSaveButton',
  components: {
    SaveCard,
  },
  data: () => ({
    savesOpen: false,
  }),
  computed: {
    ...mapState(['bestLists', 'currentList']),
    ...mapState('saves', ['lists']),
    isPhone() {
      return this.$q.screen.lt.sm;
    },
  },
};
</script>
