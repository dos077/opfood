<template>
<q-toolbar>
  <q-toolbar-title shrink>
    <span v-if="currentList">Imports</span>
    <span v-else>Bookmarks</span>
  </q-toolbar-title>
  <q-separator class="gt-xs" vertical />
  <q-btn v-if="!currentList"
    flat round icon="mdi-delete-outline"
    @click="deleteDialog = true"
  />
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
  <q-btn v-if="!currentList"
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
  <q-btn v-if="!currentList"
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
  <q-btn v-if="canClose"
    class="lt-sm"
    flat round
    icon="mdi-bookmark"
    @click="$store.commit('load', null)"
  />
  <q-btn v-if="canClose"
    class="gt-xs"
    flat
    icon="mdi-bookmark" label="bookmarks"
    @click="$store.commit('load', null)"
  />
  <bar-save-button v-if="currentList && !canClose" />
</q-toolbar>
<q-dialog v-model="deleteDialog" persistent>
  <q-card outline>
    <q-card-section class="text-body">
      Delete bookmark?
    </q-card-section>
    <q-card-actions>
      <q-btn flat @click="remove" color="green">confirm</q-btn>
      <q-btn flat @click="deleteDialog = false" color="red">cancel</q-btn>
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
import { mapState } from 'vuex';
import recipeDb from '@/helpers/recipeDb';
import BarSaveButton from '@/components/BarSaveButton.vue';

export default {
  name: 'BookmarksBar',
  components: {
    BarSaveButton,
  },
  data: () => ({
    savesOpen: false,
    deleteDialog: false,
  }),
  computed: {
    ...mapState('saves', ['saveSelected']),
    ...mapState(['currentList']),
    ...mapState('saves', ['lists']),
    canClose() {
      const { lists, currentList } = this;
      if (!lists || !currentList) return null;
      return lists.some((list) => {
        const titles = list.map(({ title }) => title);
        return currentList.every((r) => titles.includes(r.title));
      });
    },
  },
  methods: {
    shareUrl() {
      const titles = this.saveSelected.map(({ title }) => title);
      const url = new URL(window.location.href);
      url.searchParams.append('titles', titles.join('|'));
      navigator.clipboard.writeText(url.toString());
      this.sharedMsg = true;
    },
    remove() {
      const { lists, saveSelected } = this;
      const index = lists.findIndex((l) => saveSelected === l);
      this.$store.commit('saves/remove', index);
      this.deleteDialog = false;
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
      this.$store.commit('load', recipes);
    } else {
      this.$store.commit('load', null);
    }
  },
};
</script>
