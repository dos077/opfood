<template>
<q-toolbar>
  <q-toolbar-title shrink>
    Bookmarks
  </q-toolbar-title>
  <q-separator class="gt-xs" vertical />
  <q-space />
  <q-btn
    class="lt-sm"
    icon="mdi-flash"
    flat round
    to="quick"
  />
  <q-btn
    class="gt-xs"
    icon="mdi-flash" label="quick search"
    flat
    to="quick"
  />
  <q-btn
    class="lt-sm"
    round flat
    @click="shareUrl"
    icon="mdi-share"
  >
    <q-popup-proxy>
      <q-banner>
        Link copied
      </q-banner>
    </q-popup-proxy>
  </q-btn>
  <q-btn
    class="gt-xs"
    flat
    icon="mdi-share" label="share"
    @click="shareUrl"
  >
    <q-popup-proxy>
      <q-banner>
        Link copied
      </q-banner>
    </q-popup-proxy>
  </q-btn>
</q-toolbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BookmarksBar',
  computed: {
    ...mapState('saves', ['saveSelected']),
  },
  methods: {
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
