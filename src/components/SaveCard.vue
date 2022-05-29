<template>
<div class="col-12 col-sm-6">
  <q-card flat bordered>
    <q-card-section horizontal>
      <q-avatar v-if="index !== null" class="gt-xs">{{ index + 1 }}</q-avatar>
      <q-separator class="gt-xs" vertical />
      <q-card-section>
        <q-chip v-for="recipe in list" :key="recipe.title" outline square>
          {{ recipe.title }}
        </q-chip>
        <q-separator v-if="index !==null || currentList !== list" class="q-my-sm" />
        <q-card-actions style="margin-bottom: -0.8rem;">
          <q-btn v-if="currentList && currentList !== lists[index]" @click="save"
            flat color="green" class="q-mr-sm">
            save
          </q-btn>
          <q-btn v-if="(index === null || lists[index]) && currentList !== list"
            flat @click="load">
            load
          </q-btn>
          <q-space />
          <q-btn v-if="index !== null && lists[index]"
            flat color="deep-orange-4" @click="deleteDialog = true">
            delete
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card-section>
  </q-card>
  <q-dialog v-model="confirmDialog" persistent>
    <q-card outline>
      <q-card-section>
        overwrite the saved recipes in slot {{ index + 1 }}
      </q-card-section>
      <q-card-actions>
        <q-btn flat @click="confirmSave" color="green">confirm</q-btn>
        <q-btn flat @click="confirmDialog = false" color="red">cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="deleteDialog" persistent>
    <q-card outline>
      <q-card-section>
        delete saved recipes in slot {{ index + 1 }}?
      </q-card-section>
      <q-card-actions>
        <q-btn flat @click="remove" color="green">confirm</q-btn>
        <q-btn flat @click="deleteDialog = false" color="red">cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SaveCard',
  props: ['index'],
  data: () => ({
    confirmDialog: false,
    deleteDialog: false,
  }),
  computed: {
    ...mapState(['bestList', 'currentList']),
    ...mapState('saves', ['lists']),
    list() {
      if (this.index === null) return this.bestList;
      return this.lists[this.index] || [];
    },
    titles() {
      return this.list.map(({ title }) => title).join(' || ');
    },
  },
  methods: {
    save() {
      const { index, bestList, lists } = this;
      if (!lists[index]) {
        this.$store.commit('saves/add', { list: bestList, index });
      } else this.confirmDialog = true;
    },
    confirmSave() {
      const { index, bestList } = this;
      this.$store.commit('saves/add', { list: bestList, index });
      this.confirmDialog = false;
    },
    load() {
      const { list } = this;
      this.$store.commit('load', list);
    },
    remove() {
      const { index } = this;
      this.$store.commit('saves/remove', index);
      this.deleteDialog = false;
    },
  },
};
</script>
