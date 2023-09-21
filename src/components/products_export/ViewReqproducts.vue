<template>
  <div class="search_lists mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2" :loading="cardLoading">
                <v-table v-if="!cardLoading">
                  <caption
                    style="
                      background-color: rgb(114, 49, 116) !important;
                      color: white;
                      font-weight: bold;
                      padding: 8px 0 10px;
                      margin: 0;
                    "
                  >
                    رقم الطلب:&nbsp;
                    {{
                      props.request.requestId
                    }}
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
                        اسم المنتج
                      </th>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        الكمية المسجلة بالاذن
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(product, i) in reqExportedProducts" :key="i">
                      <td>{{ product.product.productName }}</td>
                      <td>
                        {{
                          product.amount
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <v-card-actions class="px-0 mt-5 justify-center">
                  <v-btn color="blue" variant="outlined" @click="printData">
                    <v-icon>mdi-printer</v-icon>
                    طباعة</v-btn
                  >
                  <v-btn color="green" variant="outlined" @click="exportExcel">
                    <v-icon>mdi-download</v-icon>
                    تحميل</v-btn
                  >
                  <v-btn color="red" variant="outlined" @click="dialog = false"
                    >اغلاق</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, defineEmits, watch } from "vue";
import { productsExport } from "@/stores/products_export/productsExport";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";

// Init Store
const exportingModule = productsExport();
const mainSt = mainStore();

// Data
const { reqExportedProducts } = storeToRefs(exportingModule);
const dialog = ref(true);
const cardLoading = ref(false);

// Props
const props = defineProps(["request", "isCompleted"]);

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
const getProducts = async () => {
  const doGetReqExportedProducts = exportingModule.doGetReqExportedProducts;
  cardLoading.value = true;
  await doGetReqExportedProducts(props.request.id);
  cardLoading.value = false;
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(reqExportedProducts.value));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم المنتج": req.product.productName,
      "الكمية المسجلة": req.amount,
    };
    arr.push(obj);
  });
  var wscols = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  mainSt.exportExcel(
    arr,
    `قائمة منتجات اذن بيع رقم ${reqs[0].productOut.requestId}`,
    wscols
  );
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(reqExportedProducts.value));
  let arr = [];

  let props = ["اسم المنتج", "الكمية المسجلة"];

  data.forEach((list) => {
    let obj = {
      "اسم المنتج": list.product.productName,
      "الكمية المسجلة": list.amount,
    };
    arr.push(obj);
  });
  mainSt.printTable(
    arr,
    props,
    `قائمة منتجات اذن بيع رقم ${data[0].productOut.requestId}`
  );
};

// Hooks
onMounted(async () => {
  await getProducts();
});
</script>
