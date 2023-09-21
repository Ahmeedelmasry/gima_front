<template>
  <div class="products-export">
    <DataTable
      :data="soldInDetails"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :resetPage="resetPage"
      :ranges="[7, 14, 21, 35]"
      :page="page"
      :size="size"
      :padding="0"
      :bottomActions="bottomActions"
      @doOpenReq="productToViewParts = $event"
      @openSearch="openSearch = true"
      @refresh="doGetSearch($event)"
      @pageReset="doGetSearch"
      @printTable="printData"
      @downloadTable="exportExcel"
    />
    <ViewUsedParts
      :production="productToViewParts"
      v-if="productToViewParts"
      @close_popup="productToViewParts = ''"
      type="detailed"
    />
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick($event)"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, defineProps } from "vue";
import { storeToRefs } from "pinia";
import DataTable from "@/components/global/DataTable.vue";
import ViewUsedParts from "@/components/products_export/ViewUsedParts.vue";
import SearchLists from "@/components/products_export/SearchDetailedSold.vue";

import { productsExport } from "../../stores/products_export/productsExport";
import { mainStore } from "@/stores";

// Init Store
const exportStore = productsExport();
const mainSt = mainStore();

// Data
const { soldInDetails } = storeToRefs(exportStore);

const page = ref(1);
const size = ref(7);
const tableLoading = ref(false);
const resetPage = ref(false);
const openSearch = ref(false);
const fromDate = ref("");
const toDate = ref("");
const productToViewParts = ref("");
const productId = ref(null);

const tableHeaders = ref([
  {
    text: "اسم المنتج",
    value: ["product", "productName"],
    type: "text",
    nested: true,
  },
  {
    text: "خاص باذن بيع",
    value: ["productOut", "requestId"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية المباعة",
    value: "amount",
    type: "number",
  },
  {
    text: "تاريخ البيع",
    value: ["productOut", "creationDate"],
    type: "date",
    nested: true,
  },
]);

const actions = ref([
  {
    icon: "mdi-eye",
    text: "اجزاء الانتاج",
    emit: "doOpenReq",
    color: "green",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-printer",
    text: "طباعة الجدول",
    emit: "printTable",
    check: true,
  },
  {
    icon: "mdi-download",
    text: "تحميل الجدول",
    emit: "downloadTable",
    check: true,
  },
  {
    icon: "mdi-magnify",
    text: "بحث",
    emit: "openSearch",
  },
]);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetSearch = async (data) => {
  const doGetSoldProductsInDetails = exportStore.doGetSoldProductsInDetails;
  let obj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    productId: productId.value,
  };
  if (data) {
    obj.size = data.size;
    obj.page = data.page;
  } else {
    obj.size = size.value;
    obj.page = page.value;
  }
  if (resetPage.value) {
    resetPage.value = false;
  }
  tableLoading.value = true;
  await doGetSoldProductsInDetails(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.fromDate;
  toDate.value = data.toDate;
  productId.value = data.productId;
  resetPage.value = true;
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(soldInDetails.value.content));
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم المنتج": req.product.productName,
      "خاص باذن بيع": req.productOut.requestId,
      "الكمية المباعة": req.amount,
      "تاريخ البيع": new Date(req.productOut.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "تقارير بيع المنتجات", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(soldInDetails.value.content));
  let arr = [];
  let props = ["اسم المنتج", "خاص باذن بيع", "الكمية المباعة", "تاريخ البيع"];
  data.forEach((list) => {
    let obj = {
      "اسم المنتج": list.product.productName,
      "خاص باذن بيع": list.productOut.requestId,
      "الكمية المباعة": list.amount,
      "تاريخ البيع": new Date(
        list.productOut.creationDate
      ).toLocaleDateString(),
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "تقارير بيع المنتجات");
};

// Hooks
onMounted(async () => {
  tableLoading.value = true;
  await doGetSearch();
  tableLoading.value = false;
});
</script>
