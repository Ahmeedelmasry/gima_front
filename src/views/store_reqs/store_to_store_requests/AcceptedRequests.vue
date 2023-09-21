<template>
  <div class="accepted_requests">
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick"
    />
    <DataTable
      :data="storeAccepted"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[7, 14, 21, 35]"
      :page="page"
      :size="size"
      :padding="0"
      :resetPage="resetPage"
      @refresh="doGetSearch($event)"
      @searchLists="openSearch = true"
      :bottomActions="bottomActions"
      @addUser="addUser = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="resetPage = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import { authStore } from "@/stores/auth/auth";
import { storeToStoreModule } from "@/stores/store_to_store/storeToStore";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/store_reqs/SearchRequests.vue";

// Init store
const storeReqs = storeToStoreModule();
const authSt = authStore();
const mainSt = mainStore();

// Data
const { storeAccepted } = storeToRefs(storeReqs);
const { loggerData } = storeToRefs(authSt);
const page = ref(1);
const size = ref(7);
const resetPage = ref(false);
const tableLoading = ref(false);
const fromDate = ref("");
const toDate = ref("");
const partId = ref("");
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: ["part", "partName"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية الموردة",
    value: "amount",
    type: "number",
  },
  {
    text: "من مخزن",
    value: ["storeFrom", "storeName"],
    type: "text",
    nested: true,
  },
  {
    text: "تاريخ التوريد",
    value: "creationDate",
    type: "date",
  },
  {
    text: "حالة الطلب",
    value: ["status", "id"],
    type: "status",
    nested: true,
  },
  {
    text: "صورة الجزء",
    value: ["part", "picture"],
    type: "img",
    nested: true,
  },
]);

const actions = ref([]);

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
    emit: "searchLists",
  },
]);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetSearch = async (data) => {
  const doGetStoreToStoreRequests = storeReqs.doGetStoreToStoreRequests;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    statusId: 2,
    storeId: loggerData.value.storeId,
    pageType: "storeAccepted",
  };
  if (data) {
    routeObj.page = data.page;
    routeObj.size = data.size;
  } else {
    routeObj.size = size.value;
    routeObj.page = page.value;
  }
  tableLoading.value = true;
  await doGetStoreToStoreRequests(routeObj);
  tableLoading.value = false;
};

const searchClick = async (searchData) => {
  page.value = 1;
  fromDate.value = searchData.fromDate;
  toDate.value = searchData.toDate;
  partId.value = searchData.partId;
  fromDate.value = searchData.fromDate;
  resetPage.value = true;
  await doGetSearch();
};

const exportExcel = () => {
  let data = JSON.parse(JSON.stringify(storeAccepted.value.content));
  console.log(data);
  let arr = [];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "الكمية الموزعة": list.amount,
      "من مخزن": list.storeFrom.storeName,
      "الي مخزن": list.storeTo.storeName,
      "حالة الطلب":
        list.status.id == 1
          ? "معلقة"
          : list.status.id == 2
          ? "مقبولة"
          : "مرفوضة",
      "تاريخ التوزيع": new Date(list.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  var wscols = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  mainSt.exportExcel(arr, "قائمة طلبات توزيع مخزني مقبولة", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(storeAccepted.value.content));
  let arr = [];
  let props = [
    "اسم الجزء",
    "الكمية الموزعة",
    "من مخزن",
    "الي مخزن",
    "حالة الطلب",
    "تاريخ التوزيع",
  ];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "الكمية الموزعة": list.amount,
      "من مخزن": list.storeFrom.storeName,
      "الي مخزن": list.storeTo.storeName,
      "حالة الطلب":
        list.status.id == 1
          ? "معلقة"
          : list.status.id == 2
          ? "مقبولة"
          : "مرفوضة",
      "تاريخ التوزيع": new Date(list.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "قائمة طلبات توزيع مخزني مقبولة");
};

// Hooks
onMounted(async () => {
  await doGetSearch();
});
</script>
