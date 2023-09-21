<template>
  <div class="parts_reports mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">تقرير الاجزاء</h2>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedPart"
                      :items="popupParts.content"
                      item-title="partName"
                      item-value="id"
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="اسم الجزء"
                      :loading="selectLoading"
                      :disabled="selectLoading"
                      :error-messages="errs.part"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="supplierId"
                      :items="popupSuppliers.content"
                      item-title="supplierName"
                      item-value="id"
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="اسم المورد"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="billId"
                      variant="outlined"
                      label="رقم الفاتورة"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="FromDate"
                      variant="outlined"
                      label="من"
                      type="date"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="ToDate"
                      variant="outlined"
                      label="الي"
                      type="date"
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
                        !popupParts.content ||
                        !popupParts.content.length
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
import { partsModule } from "@/stores/parts/parts";
import { suppliersModule } from "@/stores/suppliers/suppliers";
import router from "@/router";

// Init Store
const partsSt = partsModule();
const suppliersSt = suppliersModule();

// Data
const { popupParts } = storeToRefs(partsSt);
const { popupSuppliers } = storeToRefs(suppliersSt);
const selectedPart = ref("");
const FromDate = ref("");
const ToDate = ref("");
const supplierId = ref("");
const billId = ref("");
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);
const errs = ref({
  part: "",
});

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
const getParts = async () => {
  const DoGetPopupParts = partsSt.DoGetPopupParts;
  await DoGetPopupParts();
};

const getSuppliers = async () => {
  const doGetPopupSuppliers = suppliersSt.doGetPopupSuppliers;
  await doGetPopupSuppliers();
};

const getSearchedLists = () => {
  errs.value.part = "";
  if (!selectedPart.value) return (errs.value.part = "قم باختيار الجزء");
  router.push({
    name: "adminParts",
    query: {
      supplierId: supplierId.value,
      billId: billId.value,
      FromDate: FromDate.value,
      ToDate: ToDate.value,
      partId: selectedPart.value,
    },
  });
  dialog.value = false;
};

// Hooks
onMounted(async () => {
  dialog.value = props.openSearch;
  selectLoading.value = true;
  await Promise.all([getSuppliers(), getParts()]);
  selectLoading.value = false;
});
</script>
