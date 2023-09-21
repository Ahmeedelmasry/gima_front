<template>
  <div class="products-export">
    <DataTable
      :data="allReqs"
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
      @doOpenReq="selectedExportingReq = $event"
      @openSearch="openSearch = true"
      @refresh="doGetSearch($event)"
      @addProductionReq="addNew = true"
      @editReq="openEdit($event)"
      @pageReset="doGetSearch"
      @printTable="printData"
      @downloadTable="exportExcel"
    />
    <AddNew
      v-if="addNew"
      @close_popup="addNew = false"
      @regetData="doGetSearch"
    />
    <EditRequest
      v-if="editReq"
      :reqData="reqData"
      @close_popup="(editReq = false), (reqData = '')"
      @regetData="doGetSearch"
    />
    <ViewReqproducts
      :request="selectedExportingReq"
      v-if="selectedExportingReq"
      @close_popup="selectedExportingReq = ''"
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
import { mainStore } from "@/stores";
import DataTable from "@/components/global/DataTable.vue";
import AddNew from "../../components/products_export/AddNew.vue";
import EditRequest from "../../components/products_export/EditRequest.vue";
import ViewReqproducts from "@/components/products_export/ViewReqproducts.vue";
import SearchLists from "@/components/products_export/SearchLists.vue";

import { productsExport } from "../../stores/products_export/productsExport";

// Init Store
const exportStore = productsExport();
const mainSt = mainStore();

// Data
const { allReqs } = storeToRefs(exportStore);

const page = ref(1);
const size = ref(7);
const tableLoading = ref(false);
const addNew = ref(false);
const editReq = ref(false);
const resetPage = ref(false);
const openSearch = ref(false);
const reqData = ref("");
const fromDate = ref("");
const toDate = ref("");
const selectedExportingReq = ref("");
const responsibleBy = ref("");
const requestId = ref(null);
const driverName = ref("");

const tableHeaders = ref([
  {
    text: "رقم الاذن",
    value: "requestId",
    type: "text",
  },
  {
    text: "مسؤول الخروج",
    value: ["responsibleBy", "userName"],
    type: "text",
    nested: true,
  },
  {
    text: "اسم السائق",
    value: "driverName",
    type: "text",
  },
  {
    text: "مكان الوصول",
    value: "destinationName",
    type: "text",
  },
  {
    text: "انشاء بواسطة",
    value: ["createdBy", "userName"],
    type: "text",
    nested: true,
  },
  {
    text: "تاريخ الطلب",
    value: "creationDate",
    type: "date",
  },
  {
    text: "ملاحظات",
    value: "note",
    type: "text",
  },
]);

const actions = ref([
  {
    icon: "mdi-eye",
    text: "عرض المنتجات",
    emit: "doOpenReq",
    color: "green",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل الطلب",
    emit: "editReq",
    color: "blue",
    needPriv: true,
    priv: "editProductOut",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "فاتورة بيع جديدة",
    emit: "addProductionReq",
    needPriv: true,
    priv: "addProductOut",
  },
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
  console.log("fired");
  const getReqs = exportStore.doGetAllExportReqs;
  let obj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    requestId: requestId.value,
    driverName: driverName.value,
    responsibleBy: responsibleBy.value,
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
  await getReqs(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.fromDate;
  toDate.value = data.toDate;
  requestId.value = data.requestId;
  driverName.value = data.driverName;
  responsibleBy.value = data.responsibleBy;
  resetPage.value = true;
};

const openEdit = (data) => {
  editReq.value = true;
  reqData.value = data;
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(allReqs.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "رقم الاذن": req.requestId,
      "مسؤول الخروج": req.responsibleBy.userName,
      "اسم السائق": req.driverName,
      "مكان الوصول": req.destinationName,
      "ادخال بوساطة": req.createdBy.userName,
      "تاريخ الادخال": new Date(req.creationDate).toLocaleDateString(),
      ملاحظات: req.notes,
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
  mainSt.exportExcel(arr, "قائمة اذونات الصرف", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(allReqs.value.content));
  let arr = [];

  let props = [
    "رقم الاذن",
    "مسؤول الخروج",
    "اسم السائق",
    "مكان الوصول",
    "مكان الوصول",
    "ادخال بوساطة",
    "تاريخ الادخال",
    "ملاحظات",
  ];

  data.forEach((list) => {
    let obj = {
      "رقم الاذن": list.requestId,
      "مسؤول الخروج": list.responsibleBy.userName,
      "اسم السائق": list.driverName,
      "مكان الوصول": list.destinationName,
      "ادخال بوساطة": list.createdBy.userName,
      "تاريخ الادخال": new Date(list.creationDate).toLocaleDateString(),
      ملاحظات: list.notes,
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "قائمة اذونات الصرف");
};

// Hooks
onMounted(async () => {
  tableLoading.value = true;
  await doGetSearch();
  tableLoading.value = false;
});
</script>
