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
                    <v-autocomplete
                      v-model="selectedSupplier"
                      :items="suppliers.content"
                      no-data-text="لاتوجد بيانات"
                      item-title="supplierName"
                      item-value="id"
                      variant="outlined"
                      label="اسم المورد"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      type="text"
                      variant="outlined"
                      label="رقم الفاتورة"
                      v-model="billId"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="حالة الفاتورة"
                      :items="listStatus"
                      v-model="selectedStatus"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="من"
                      v-model="fromDate"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
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
import { suppliersModule } from "@/stores/suppliers/suppliers";

// Init Store
const supplierSt = suppliersModule();

// Data
const { suppliers } = storeToRefs(supplierSt);
const selectedSupplier = ref("");
const selectedStatus = ref(null);
const fromDate = ref("");
const toDate = ref("");
const billId = ref("");
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);
const listStatus = ref([
  { title: "", value: "" },
  {
    title: "مكتملة",
    value: 1,
  },
  {
    title: "غير مكتملة",
    value: 2,
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
const getSuppliers = async () => {
  const doGetSuppliers = supplierSt.doGetSuppliers;
  await doGetSuppliers();
};

const getSearchedLists = () => {
  const searchedObj = {
    supplierId: selectedSupplier.value,
    supplyProcessFromDate: fromDate.value,
    supplyProcessToDate: toDate.value,
    billId: billId.value,
  };
  searchedObj.status = selectedStatus.value;
  emits("doGetSearchedLists", searchedObj);
  btnLoading.value = true;
  setTimeout(() => {
    dialog.value = false;
  }, 200);
};

// Hooks
onMounted(async () => {
  selectLoading.value = true;
  await getSuppliers();
  if (suppliers.value.content && suppliers.value.content.length) {
    suppliers.value.content.unshift({
      supplierName: "",
      id: "",
    });
  }
  selectLoading.value = false;
  dialog.value = props.openSearch;
});
</script>
