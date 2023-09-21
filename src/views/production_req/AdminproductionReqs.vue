<template>
  <div class="p_lists">
    <SearchLists
      @doGetSearchedLists="searchClick($event)"
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
    />
    <DataTable
      :data="allRequests"
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
      @refresh="doGetSearch($event)"
      @searchRequest="openSearch = true"
      @addProductionReq="newProduction = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="doGetSearch"
      @viewList="openViewPartsPopup($event)"
    />
    <MarkasCompleted
      @regetItems="doGetSearch"
      v-if="markAsCompleted"
      :reqId="markedReq"
      @close_popup="markAsCompleted = false"
      :expected="expected"
    />
    <ViewParts
      :reqId="reqId"
      v-if="reqId"
      @close_popup="reqId = ''"
      :isCompleted="showAllHeaders"
    />
    <ProductionPopup
      :dialog="newProduction"
      v-if="newProduction"
      @close_popup="newProduction = false"
      @regetData="doGetSearch({ page: 1, size: 8 })"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import { productionReq } from "@/stores/production_request/productionReq";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import ProductionPopup from "@/components/supervisor_actions/ProductionPopup";
import { storeToRefs } from "pinia";
import { mainStore } from "@/stores";

// Components
import MarkasCompleted from "@/components/production_reqs/MarkasCompleted.vue";
import SearchLists from "@/components/production_reqs/SearchLists.vue";
import ViewParts from "@/components/production_reqs/ViewParts.vue";

// Init store
const mainSt = mainStore();
const productionSt = productionReq();

// Data
const { allRequests } = storeToRefs(productionSt);

const page = ref(1);
const size = ref(7);
const resetPage = ref(false);
const newProduction = ref(false);
const tableLoading = ref(false);
const markAsCompleted = ref(false);
const fromDate = ref("");
const toDate = ref("");
const productId = ref("");
const requestId = ref("");
const isCompleted = ref(undefined);
const openSearch = ref(false);
const markedReq = ref("");
const reqId = ref("");
const expected = ref("");
const showAllHeaders = ref(false);

const tableHeaders = ref([
  {
    text: "رقم الاذن",
    value: "requestID",
    type: "text",
  },
  {
    text: "مشرف الانتاج",
    value: ["supervisor", "supervisorName"],
    type: "text",
    nested: true,
  },
  {
    text: "القسم",
    value: ["department", "deptName"],
    type: "text",
    nested: true,
  },
  {
    text: "اسم المنتج",
    value: ["product", "productName"],
    type: "text",
    nested: true,
  },
  {
    text: "تاريخ الادخال",
    value: "creationDate",
    type: "date",
  },
  {
    text: "عدد متوقع الانتاج",
    value: "expectedProduction",
    type: "number",
  },
  {
    text: "حالة خروج المخازن",
    value: "fullOut",
    type: "status",
    check: "fullOut",
    checkText: ["مكتمل", "غير مكتمل"],
  },
]);

const actions = ref([
  {
    icon: "mdi-eye",
    text: "اجزاء الطلب",
    emit: "viewList",
    color: "green",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "ادخال اذن جديد",
    emit: "addProductionReq",
    needPriv: true,
    priv: "addProductionProcess",
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
    emit: "searchRequest",
  },
]);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetSearch = async (data) => {
  const doGetAllAdminReqs = productionSt.doGetAllAdminReqs;
  let obj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    productId: productId.value,
    requestId: requestId.value,
    isFullOut: isCompleted.value,
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
  await doGetAllAdminReqs(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.fromDate;
  toDate.value = data.toDate;
  productId.value = data.productId;
  requestId.value = data.requestId;
  isCompleted.value = data.isCompleted;
  resetPage.value = true;
};

const openViewPartsPopup = (data) => {
  if (data.completed) {
    showAllHeaders.value = true;
  } else {
    showAllHeaders.value = false;
  }
  reqId.value = data.requestID;
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(allRequests.value.content));
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "رقم الاذن": req.requestID,
      "مشرف الانتاج": req.supervisor.supervisorName,
      القسم: req.department.deptName,
      "اسم المنتج": req.product.productName,
      "متوقع انتاج": req.expectedProduction,
      "حالة خروج المخازن": req.fullOut ? "مكتمل" : "غير مكتمل",
      "تاريخ الادخال": new Date(req.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  console.log(arr);
  var wscols = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  mainSt.exportExcel(arr, "قائمة اذونات الصرف", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(allRequests.value.content));
  let arr = [];
  let props = [
    "رقم الاذن",
    "مشرف الانتاج",
    "القسم",
    "اسم المنتج",
    "متوقع انتاج",
    "حالة خروج المخازن",
    "تاريخ الادخال",
  ];
  data.forEach((list) => {
    let obj = {
      "رقم الاذن": list.requestID,
      "مشرف الانتاج": list.supervisor.supervisorName,
      القسم: list.department.deptName,
      "اسم المنتج": list.product.productName,
      "متوقع انتاج": list.expectedProduction,
      "حالة خروج المخازن": list.fullOut ? "مكتمل" : "غير مكتمل",
      "تاريخ الادخال": new Date(list.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "اذونات الصرف");
};

// Hooks
onMounted(async () => {
  await doGetSearch();
});
</script>

<style lang="scss">
.p_lists {
  table {
    font-size: 14px;
    overflow-y: scroll;
    background-color: white;
    thead {
      tr {
        box-shadow: 0px 0px 3px -2px black;
      }
    }
    tbody {
      tr {
        box-shadow: 0px 0px 3px -2px black;
        th {
          padding: 10px 0 !important;
        }
        td {
          padding: 1.3px 0 !important;
        }
      }
    }
  }
  .v-pagination__list {
    justify-content: flex-start;
  }
  .pagins_parent {
    padding: 0 10px 0 35px;
  }
  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      font-size: 25px;
      color: rgb(80, 80, 80);
    }
  }
  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      font-size: 25px;
      color: rgb(80, 80, 80);
    }
  }
}
.v-list-item__prepend > .v-icon {
  margin-inline-end: 10px !important;
}
</style>
