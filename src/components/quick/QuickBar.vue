<template>
<q-toolbar>
  <q-toolbar-title shrink>
    Quick Search
  </q-toolbar-title>
  <q-separator class="gt-xs" vertical />
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
    icon="mdi-tune"
    @click="settingsOn = true"
  />
</q-toolbar>
<q-dialog v-model="settingsOn">
  <q-card style="width: 90vw; max-width: 30rem;">
    <quick-settings />
    <q-card-actions>
      <q-btn
        label="done" color="deep-orange-4" flat
        @click="closeSettings"
      />
      <q-space />
      <q-btn label="advance mode" color="grey-7" flat
        to="/advance"
      />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
import { mapState } from 'vuex';
import QuickSettings from './QuickSettings.vue';

export default {
  name: 'QuickBar',
  components: {
    QuickSettings,
  },
  data: () => ({
    settingsOn: false,
    isChanged: false,
  }),
  computed: {
    ...mapState('settings', ['age', 'sex', 'meals']),
  },
  watch: {
    age() {
      this.isChanged = true;
    },
    sex() {
      this.isChanged = true;
    },
    meals() {
      this.isChanged = true;
    },
  },
  methods: {
    closeSettings() {
      if (this.isChanged) this.$store.dispatch('search');
      this.isChanged = false;
      this.settingsOn = false;
    },
  },
};
</script>
