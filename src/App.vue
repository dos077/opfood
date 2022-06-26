<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal bordered class="bg-deep-orange-4">
      <quick-bar v-if="$route.name === 'quick'" />
      <bookmarks-bar v-if="$route.name === 'bookmarks'" />
      <advance-bar v-if="$route.name === 'advance'" />
    </q-header>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import QuickBar from '@/components/quick/QuickBar.vue';
import BookmarksBar from '@/components/bookmarks/BookmarksBar.vue';
import AdvanceBar from '@/components/advance/AdvanceBar.vue';

export default {
  name: 'LayoutDefault',

  components: {
    QuickBar,
    BookmarksBar,
    AdvanceBar,
  },

  created() {
    if (sessionStorage.redirect) {
      const { redirect } = sessionStorage;
      delete sessionStorage.redirect;
      this.$router.push(redirect);
    }
  },
};
</script>
