<template>
  <div class="search_lists mt-5">
    <v-dialog max-width="900" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card
                class="pa-5 d-flex justify-space-between align-center"
                elevation="0"
                :loading="cardLoading"
                style="gap: 20px"
              >
                <v-table v-if="!cardLoading" class="w-100">
                  <caption
                    class="text-center pr-10"
                    style="
                      background-color: rgb(114, 49, 116) !important;
                      color: white;
                      font-weight: bold;
                      padding: 8px 0 10px;
                      margin: 0;
                    "
                  >
                    <span class="d-block my-2"> الكمية المباعة&nbsp; </span>
                  </caption>
                  <thead>
                    <tr>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        اسم الجزء
                      </th>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center w-50"
                      >
                        الكمية
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(part, i) in usedParts" :key="i">
                      <td>{{ part.part.partName }}</td>
                      <td>
                        {{
                          part.requestedAmount
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <v-table
                  v-if="!cardLoading && props.type == 'total'"
                  class="w-100"
                >
                  <caption
                    class="text-center pr-10"
                    style="
                      background-color: rgb(114, 49, 116) !important;
                      color: white;
                      font-weight: bold;
                      padding: 8px 0 10px;
                      margin: 0;
                    "
                  >
                    <span class="d-block my-2">
                      كمية العجز / الزيادة&nbsp;
                    </span>
                  </caption>
                  <thead>
                    <tr>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        اسم الجزء
                      </th>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center w-50"
                      >
                        الكمية
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(part, i) in extraWasteParts" :key="i">
                      <td>{{ part.part.partName }}</td>
                      <td
                        :style="`color: ${
                          part.requestedAmount > 0
                            ? '#fa8e21'
                            : part.requestedAmount < 0
                            ? 'red'
                            : '#14ad2d'
                        }`"
                      >
                        {{
                          part.requestedAmount
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
              <v-card-actions class="mt-5 justify-center">
                <v-btn color="blue" variant="outlined">
                  <v-icon>mdi-printer</v-icon>
                  طباعة</v-btn
                >
                <v-btn color="green" variant="outlined" @click="exportExcel">
                  <v-icon>mdi-download</v-icon>
                  تحميل</v-btn
                >
                <v-btn color="red" variant="outlined" @click="dialog = false">
                  اغلاق</v-btn
                >
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, defineEmits, watch } from "vue";
import { productionReq } from "@/stores/production_request/productionReq";
import { storeToRefs } from "pinia";
import { mainStore } from "@/stores";

// Init Store
const productsSt = productionReq();
const mainSt = mainStore();

// Data
const { usedParts, extraWasteParts } = storeToRefs(productsSt);
const dialog = ref(true);
const cardLoading = ref(false);

// Props
const props = defineProps(["production", "type", "extraMinus"]);

// Emits
const emits = defineEmits(["close_popup"]);

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
const getProductionParts = async () => {
  const doGetUsedParts = productsSt.doGetUsedParts;
  cardLoading.value = true;
  await doGetUsedParts({
    amount:
      props.type == "detailed"
        ? props.production.amount
        : props.production.amountOut,
    productId: props.production.product.id,
  });
  cardLoading.value = false;
};

const getExtraMinusParts = async () => {
  const doGetExtraMinusParts = productsSt.doGetExtraMinusParts;
  cardLoading.value = true;
  await doGetExtraMinusParts({
    amount: props.extraMinus,
    productId: props.production.product.id,
  });
  cardLoading.value = false;
};

const exportExcel = () => {
  console.log(props.production);
  let reqs = JSON.parse(JSON.stringify(usedParts.value));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم الجزء": req.part.partName,
      الكمية: req.requestedAmount,
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(
    arr,
    `${
      props.type == "total"
        ? `اجمالي الاجزاء المباعة الخاصة بمنتج ${props.production.product.productName}`
        : `الاجزاء المباعة باذن بيع ${props.production.productOut.requestId} الخاص بمنتج ${props.production.product.productName}`
    }`,
    wscols
  );
  if (props.type == "total") {
    let reqs = JSON.parse(JSON.stringify(extraWasteParts.value));
    let arr = [];
    reqs.forEach((req) => {
      let obj = {
        "اسم الجزء": req.part.partName,
        الكمية: req.requestedAmount,
      };
      arr.push(obj);
    });
    var newWscols = [{ wch: 20 }, { wch: 20 }];
    mainSt.exportExcel(
      arr,
      `اجمالي اجزاء العجز / الزيادة الخاصة بمنتج ${props.production.product.productName}`,
      newWscols
    );
  }
};

// Hooks
onMounted(async () => {
  if (props.type == "detailed") {
    await getProductionParts();
  } else {
    await Promise.all([getExtraMinusParts(), getProductionParts()]);
  }
});
</script>
