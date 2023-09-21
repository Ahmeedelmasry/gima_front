<template>
  <div class="delete_store">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">{{
          props.store.locked ? "فك حظر المخزن" : "حظر المخزن"
        }}</v-card-title>
        <div class="text-center">
          <v-icon
            style="
              font-size: 50px;
              color: #e89e47;
              padding: 10px;
              border-radius: 50%;
              border: 1px solid #e89e47;
              width: 70px;
              height: 70px;
            "
            >mdi-alert</v-icon
          >
        </div>
        <v-card-text>
          هل تريد
          {{ props.store.locked ? "فك حظر المخزن" : "تاكيد حظر المخزن" }}
          {{ props.store.storeName }} ؟
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              @click="deleteStore"
              :loading="loading"
            >
              تاكيد
            </v-btn>
            <v-btn color="red" variant="outlined" @click="dialog = false">
              الغاء
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, defineEmits } from "vue";
import { storesModule } from "@/stores/the_stores/theStores";

// Init Store
const store = storesModule();

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["store"]);

// Emits
const emits = defineEmits(["close_delete", "reGetStores"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_delete");
      }, 200);
    }
  }
);

// Methods
const doUpdateStore = store.doUpdateStore;

const deleteStore = async () => {
  loading.value = true;
  let isLocked = props.store.locked ? false : true;
  const store = props.store;
  store.locked = isLocked;
  const updateSt = await doUpdateStore(store);
  if (updateSt) {
    emits("reGetStores");
  }
  loading.value = false;
  dialog.value = false;
};
</script>
