<template>
<div class="col-12 col-sm-6">
  <q-card flat bordered>
    <q-card-section horizontal>
      <q-avatar v-if="index !== null" class="gt-xs">{{ index + 1 }}</q-avatar>
      <q-card-section v-if="list" class="lt-sm">
        {{ list.map((r) => r.title).join(' | ') }}
      </q-card-section>
      <q-separator vertical />
      <q-card-section class="gt-xs">
        <q-chip v-for="recipe in list" :key="recipe.title" outline square>
          {{ recipe.title }}
        </q-chip>
        <q-separator v-if="index !==null || saveList !== list" class="q-my-sm" />
        <q-card-actions style="margin-bottom: -0.8rem;">
          <q-btn v-if="saveList && saveList !== lists[index]" @click="save"
            flat color="green" class="q-mr-sm"
            dense
          >
            save
          </q-btn>
          <q-space />
          <q-btn v-if="index !== null && lists[index]"
            flat color="deep-orange-4" @click="deleteDialog = true"
            dense
          >
            delete
          </q-btn>
        </q-card-actions>
      </q-card-section>
      <q-card-actions class="lt-sm" vertical>
        <q-btn v-if="saveList && saveList !== lists[index]"
          @click="save"
          flat round color="green"
          icon="mdi-content-save"
          dense
        />
        <q-btn v-if="index !== null && lists[index]"
          flat round color="deep-orange-4"
          @click="deleteDialog = true"
          icon="mdi-delete"
          dense
        />
      </q-card-actions>
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
  props: ['sList', 'index'],
  data: () => ({
    confirmDialog: false,
    deleteDialog: false,
  }),
  computed: {
    ...mapState(['currentList']),
    ...mapState('saves', ['lists']),
    saveList() {
      return this.sList || this.currentList;
    },
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
      const {
        index, saveList, lists,
      } = this;
      if (!lists[index]) {
        this.$store.commit('saves/add', { list: saveList, index });
      } else this.confirmDialog = true;
    },
    confirmSave() {
      const { index, saveList } = this;
      this.$store.commit('saves/add', { list: saveList, index });
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
