<template>
  <div class="packing_list">
    <v-dialog v-model="dialog" :max-width="500" persistent>
      <v-card class="pb-5 px-5">
        <form action="" @submit.prevent>
          <div class="d-flex justify-space-between">
            <v-card-title class="font-weight-bold mb-0"
              >استكمال الطلب</v-card-title
            >
          </div>

          <v-card-text>
            <v-container class="py-0">
              <v-row>
                <v-col cols="6" class="py-0">
                  <v-text-field
                    variant="outlined"
                    label="رقم الطلب"
                    :error-messages="errs.selectedProduct"
                    class="required"
                    disabled
                    :model-value="props.reqId"
                  />
                </v-col>
                <v-col cols="6" class="py-0">
                  <v-text-field
                    variant="outlined"
                    label="عدد المنتجات المصنعة"
                    type="number"
                    v-model="producedCount"
                    :error-messages="errs.producedCount"
                    min="0"
                    class="required"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <div class="text-center" v-if="errs.global">
            <span class="text-error" style="font-size: 13px">{{
              errs.global
            }}</span>
          </div>

          <v-card-actions class="mt-0 pt-0">
            <div class="d-flex justify-start w-100 pr-6">
              <v-btn
                color="blue-darken-1"
                variant="outlined"
                type="button"
                :loading="loading"
                @click="submitComplete"
              >
                تاكيد
              </v-btn>
              <v-btn
                type="button"
                color="red"
                variant="outlined"
                @click="dialog = false"
              >
                الغاء
              </v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, onMounted, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { productionReturns } from "@/stores/production_request/productionReturns";
import { productionReq } from "@/stores/production_request/productionReq";

// Init Stores
const returnsSt = productionReturns();
const productionST = productionReq();

// Data
const { remainingParts, returnErr } = storeToRefs(returnsSt);
const dialog = ref(true);
const validationErr = ref("");

const errs = ref({
  producedCount: "",
  selectedProduct: "",
});
const producedCount = ref(0);

const loading = ref(false);

// Props
const props = defineProps(["reqId", "expected"]);

// Emits
const emits = defineEmits(["close_popup", "regetItems"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_popup");
      }, 200);
    }
  }
);

// Methods

const submitComplete = async () => {
  validationErr.value = "";
  const doCompleteReq = productionST.doCompleteReq;

  const amountRgx = /^(?!0)\d+$/;

  if (!amountRgx.test(parseInt(producedCount.value)))
    return (errs.value.producedCount = "قم بادخال عدد المنتجات المصنعة بالفعل");

  if (parseInt(producedCount.value) > props.expected)
    return (errs.value.producedCount =
      "الكمية المدخلة اكبر من الكمية المتوقع تصنيعها");
  const callObj = {
    reqId: props.reqId,
    exactlyAmount: parseInt(producedCount.value),
  };
  loading.value = true;
  const success = await doCompleteReq(callObj);
  loading.value = false;
  if (success) {
    emits("regetItems");
    dialog.value = false;
  }
};

// Hooks
onMounted(async () => {
  remainingParts.value = [];
  returnErr.value = "";
});
</script>

<style lang="scss">
table {
  border-top: 1px solid #c3c3c3;
  border-right: 1px solid #c3c3c3;
  text-align: center;
  overflow-y: scroll !important;
  background-color: white !important;
  thead {
    border-top: 1px solid #c3c3c3;
    border-right: 1px solid #c3c3c3;
    background-color: rgb(114 49 116) !important;
    color: white;
  }
  tbody {
    border-top: 1px solid #c3c3c3;
    border-right: 1px solid #c3c3c3;
  }

  td,
  th {
    padding: 12px 0 !important;
    border-left: 1px solid #c3c3c3;
    border-bottom: 1px solid #c3c3c3;
  }
  // th:last-child {

  // }
}
</style>
