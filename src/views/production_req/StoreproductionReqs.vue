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
      @refresh="doGetSearch($event)"
      :bottomActions="bottomActions"
      @markCompleted="openCompletePopup($event)"
      @searchRequest="openSearch = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="resetPage = false"
      @doOpenReq="openRequest($event)"
    />
    <SuperopenReq
      @regetItems="doGetSearch(false)"
      v-if="reqId"
      :reqId="reqId"
      @close_popup="reqId = ''"
      :storeId="loggerData.storeId"
      :userId="loggerData.id"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { productionReq } from "@/stores/production_request/productionReq";
import { authStore } from "@/stores/auth/auth";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/production_reqs/SearchLists.vue";
import SuperopenReq from "@/components/production_reqs/SuperopenReq.vue";

// Init store
const productionSt = productionReq();
const authSt = authStore();
const mainSt = mainStore();

// Data
const { allRequests } = storeToRefs(productionSt);
const { loggerData } = storeToRefs(authSt);

const page = ref(1);
const size = ref(7);
const resetPage = ref(false);
const tableLoading = ref(false);
const markAsCompleted = ref(false);
const fromDate = ref("");
const toDate = ref("");
const productId = ref("");
const storeId = ref("");
const requestId = ref("");
const isCompleted = ref(null);
const openSearch = ref(false);
const markedReq = ref("");
const reqId = ref("");
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
    text: "تاريخ الطلب",
    value: "creationDate",
    type: "date",
  },
]);

const actions = ref([
  {
    icon: "mdi-eye",
    text: "عرض الطلب",
    emit: "doOpenReq",
    color: "green",
  },
]);
const bottomActions = ref([]);

watch(
  () => allRequests.value,
  (newVal) => {
    if (newVal.content && newVal.content.length) {
      bottomActions.value = [
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
      ];
    } else {
      bottomActions.value = [];
    }
  },
  { deep: true }
);

// Props
defineProps(["windowHeight"]);

// Methods
const openCompletePopup = (data) => {
  markedReq.value = data.requestID;
  markAsCompleted.value = true;
};

const openRequest = (data) => {
  if (data.completed) {
    showAllHeaders.value = true;
  } else {
    showAllHeaders.value = false;
  }
  reqId.value = data.id;
};

const doGetSearch = async (data) => {
  const doGetAllReqs = productionSt.doGetAllReqs;
  let obj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    productId: productId.value,
    storeId: loggerData.value.storeId,
    requestId: requestId.value,
    isCompleted: isCompleted.value,
  };
  if (data) {
    obj.size = data.size;
    obj.page = data.page;
  } else {
    obj.size = size.value;
    obj.page = page.value;
  }
  tableLoading.value = true;
  await doGetAllReqs(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.fromDate;
  toDate.value = data.toDate;
  productId.value = data.productId;
  storeId.value = loggerData.value.storeId;
  requestId.value = data.requestId;
  isCompleted.value = data.isCompleted;
  await doGetSearch();
};

const exportExcel = () => {
  let data = JSON.parse(JSON.stringify(allRequests.value.content));
  console.log(data);
  let arr = [];
  data.forEach((list) => {
    let obj = {
      "رقم الاذن": list.requestID,
      "مشرف الانتاج": list.supervisor.supervisorName,
      القسم: list.department.deptName,
      "اسم المنتج": list.product.productName,
      "تاريخ الطلب": new Date(list.creationDate).toLocaleDateString(),
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
    "تاريخ الادخال",
  ];
  data.forEach((list) => {
    let obj = {
      "رقم الاذن": list.requestID,
      "مشرف الانتاج": list.supervisor.supervisorName,
      القسم: list.department.deptName,
      "اسم المنتج": list.product.productName,
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
