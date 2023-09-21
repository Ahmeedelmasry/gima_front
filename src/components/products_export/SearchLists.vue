<template>
  <div class="search_lists mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">تصفية النتائج</h2>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="selectedRequest"
                      type="text"
                      variant="outlined"
                      label="رقم الاذن"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="مسؤول الخروج"
                      :items="popupSupervisors"
                      v-model="selectedSuper"
                      item-title="userName"
                      item-value="id"
                    />
                  </v-col>
                  <v-col :cols="4">
                    <v-text-field
                      variant="outlined"
                      label="اسم السائق"
                      v-model="driverName"
                    ></v-text-field>
                  </v-col>
                  <v-col :cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="من"
                      v-model="fromDate"
                    ></v-text-field>
                  </v-col>
                  <v-col :cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="الي"
                      v-model="toDate"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-btn
                      @click="getSearchedLists"
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3"
                      color="rgb(114, 49, 116)"
                      :loading="btnLoading"
                      variant="outlined"
                      >بحث</v-btn
                    >
                    <v-btn
                      @click="dialog = false"
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3 mr-3"
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

// Init Store
const storesSt = storesModule();

// Data
const { popupSupervisors } = storeToRefs(storesSt);

const selectedSuper = ref("");
const selectedRequest = ref(null);
const fromDate = ref("");
const toDate = ref("");
const driverName = ref("");
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
const getSupers = async () => {
  const doGetPopupSupers = storesSt.doGetPopupSupers;
  await doGetPopupSupers();
};

const getSearchedLists = () => {
  const searchedObj = {
    requestId: selectedRequest.value,
    responsibleBy: parseInt(selectedSuper.value),
    driverName: driverName.value,
    fromDate: fromDate.value,
    toDate: toDate.value,
    page: 1,
  };
  emits("doGetSearchedLists", searchedObj);
  btnLoading.value = true;
  setTimeout(() => {
    dialog.value = false;
  }, 200);
};

// Hooks
onMounted(async () => {
  selectLoading.value = true;
  await getSupers();
  selectLoading.value = false;
  dialog.value = props.openSearch;
});
</script>
