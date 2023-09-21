<template>
  <div class="search_requests mt-5">
    <v-dialog :max-width="selectedStore ? 700 : 400" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">تصفية النتائج</h2>
                <v-row>
                  <v-col :cols="selectedStore ? 6 : 12">
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
                  <v-col cols="6">
                    <v-text-field
                      v-model="FromDate"
                      variant="outlined"
                      label="من"
                      type="date"
                      v-if="selectedStore"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="ToDate"
                      variant="outlined"
                      label="الي"
                      type="date"
                      v-if="selectedStore"
                    ></v-text-field>
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
const FromDate = ref("");
const ToDate = ref("");
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
    name: "adminStoreSettlement",
    query: {
      storeId: selectedStore.value,
      FromDate: FromDate.value,
      ToDate: ToDate.value,
    },
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
