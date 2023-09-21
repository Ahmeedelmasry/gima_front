<template>
  <div class="accepted_requests">
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick"
    />
    <DataTable
      :data="supplyAccepted"
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
import { storeRequests } from "@/stores/store_requests/storeRequests";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/store_reqs/SearchRequests.vue";

// Init store
const storeReqs = storeRequests();
const authSt = authStore();
const mainSt = mainStore();

// Data
const { supplyAccepted } = storeToRefs(storeReqs);
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
    value: ["supplyProcessPart", "part", "partName"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية الموردة",
    value: "amount",
    type: "number",
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
    value: ["supplyProcessPart", "part", "picture"],
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
  const doGetStoreRequests = storeReqs.doGetStoreRequests;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    statusId: 2,
    storeId: loggerData.value.storeId,
    pageType: "supplyAccepted",
  };
  if (data) {
    routeObj.page = data.page;
    routeObj.size = data.size;
  } else {
    routeObj.page = page.value;
    routeObj.size = size.value;
  }
  tableLoading.value = true;
  await doGetStoreRequests(routeObj);
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
  let data = JSON.parse(JSON.stringify(supplyAccepted.value.content));
  console.log(data);
  let arr = [];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.supplyProcessPart.part.partName,
      "الكمية الموزعة": list.amount,
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
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "قائمة طلبات توزيع التوريدات المقبولة", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(supplyAccepted.value.content));
  let arr = [];
  let props = ["اسم الجزء", "الكمية الموزعة", "حالة الطلب", "تاريخ التوزيع"];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.supplyProcessPart.part.partName,
      "الكمية الموزعة": list.amount,
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
  mainSt.printTable(arr, props, "قائمة طلبات توزيع التوريدات المقبولة");
};

// Hooks
onMounted(async () => {
  await doGetSearch();
});
</script>
