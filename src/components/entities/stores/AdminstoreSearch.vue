<template>
  <div class="search_requests mt-5">
    <v-dialog max-width="400" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">بحث عن مخزن</h2>
                <v-row>
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="selectedStore"
                      :items="popupStores.content"
                      no-data-text="لاتوجد بيانات"
                      item-title="storeName"
                      item-value="id"
                      variant="outlined"
                      label="اسم المخزن"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-btn
                      @click="getSearchedLists"
                      class="px-8 py-2 font-weight-bold"
                      color="rgb(114, 49, 116)"
                      :loading="btnLoading"
                      variant="outlined"
                      :disabled="
                        selectLoading ||
                        !popupStores.content ||
                        !popupStores.content.length
                      "
                      >بحث</v-btn
                    >
                    <v-btn
                      @click="dialog = false"
                      class="px-8 py-2 font-weight-bold mr-3"
                      color="red"
                      variant="outlined"
                      >الغاء</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from "vue";
import { storeToRefs } from "pinia";
import { storesModule } from "@/stores/the_stores/theStores";
import router from "@/router";

// Init Store
const storesSt = storesModule();

// Data
const { popupStores } = storeToRefs(storesSt);
const selectedStore = ref("");
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);

// Emits
const emits = defineEmits(["doGetSearchedLists", "closePopup"]);

// Props
const props = defineProps(["openSearch"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("closePopup");
      }, 200);
    }
  }
);

// Methods
const getStores = async () => {
  const doGetPopupStores = storesSt.doGetPopupStores;
  await doGetPopupStores();
};

const getSearchedLists = () => {
  router.push({
    name: "adminStores",
    query: { storeId: selectedStore.value },
  });
  dialog.value = false;
};

// Hooks
onMounted(async () => {
  dialog.value = props.openSearch;
  selectLoading.value = true;
  await getStores();
  popupStores.value.content && popupStores.value.content.length
    ? (selectedStore.value = popupStores.value.content[0].id)
    : "";
  selectLoading.value = false;
});
</script>
