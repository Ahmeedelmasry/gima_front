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
                      v-model="selectedProduct"
                      :items="popupProducts"
                      no-data-text="لاتوجد بيانات"
                      item-title="productName"
                      item-value="id"
                      variant="outlined"
                      label="المنتج"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="حالة الطلب"
                      :items="listStatus"
                      v-model="selectedStatus"
                    />
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
import { productionReturns } from "@/stores/production_request/productionReturns";
import { productModule } from "@/stores/products/products";

// Init Store
const storesSt = storesModule();
const productionSt = productionReturns();
const productsSt = productModule();

// Data
const { popupStores } = storeToRefs(storesSt);
const { allIds } = storeToRefs(productionSt);
const { popupProducts } = storeToRefs(productsSt);

const selectedStatus = ref(undefined);
const selectedRequest = ref(null);
const selectedProduct = ref(null);
const fromDate = ref("");
const toDate = ref("");
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);
const listStatus = ref([
  { title: "", value: null },
  {
    title: "مكتمل الخروج",
    value: true,
  },
  {
    title: "غير مكتمل الخروج",
    value: false,
  },
]);

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

const getProducts = async () => {
  const doGetPopupProducts = productsSt.doGetPopupProducts;
  await doGetPopupProducts();
};

const getSearchedLists = () => {
  const searchedObj = {
    productId: selectedProduct.value,
    requestId: selectedRequest.value,
    isCompleted: selectedStatus.value,
    fromDate: fromDate.value,
    toDate: toDate.value,
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
  await Promise.all([getStores(), getProducts()]);
  if (popupStores.value.content && popupStores.value.content.length) {
    popupStores.value.content.unshift({
      storeName: "",
      id: "",
    });
  }
  if (allIds.value.length) {
    allIds.value.unshift("");
  }
  if (popupProducts.value.length) {
    popupProducts.value.unshift({
      productName: "",
      id: "",
    });
  }
  selectLoading.value = false;
  dialog.value = props.openSearch;
});
</script>
