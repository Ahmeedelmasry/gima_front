<template>
  <div class="pending_requests">
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick"
    />
    <RejectRequest
      :openReject="openReject"
      :rejectedId="rejectedId"
      v-if="openReject"
      @closePopup="openReject = false"
      @doGetSearchedLists="searchClick"
      :rejectedFullData="rejectedFullData"
    />
    <DataTable
      :data="storePending"
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
      @acceptRequest="acceptRequest($event)"
      @toRejectPopup="toRejectPopup($event)"
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
import { notifsModule } from "@/stores/notifications/notifs";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/store_reqs/SearchRequests.vue";
import RejectRequest from "@/components/store_to_store/RejectReq.vue";

// Init store
const storeReqs = storeToStoreModule();
const authSt = authStore();
const mainSt = mainStore();
const notifsStore = notifsModule();

// Data
const { storePending } = storeToRefs(storeReqs);
const { loggerData } = storeToRefs(authSt);
const page = ref(1);
const size = ref(7);
const resetPage = ref(false);
const tableLoading = ref(false);
const fromDate = ref("");
const toDate = ref("");
const partId = ref("");
const openSearch = ref(false);
const openReject = ref(false);
const rejectedId = ref("");
const rejectedFullData = ref("");

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: ["part", "partName"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية الموزعة",
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
    text: "تاريخ التوزيع",
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

const actions = ref([
  {
    icon: "mdi-store-plus",
    text: "قبول الطلب",
    emit: "acceptRequest",
    color: "green",
  },
  {
    icon: "mdi-cancel",
    text: "رفض الطلب",
    emit: "toRejectPopup",
    color: "red",
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
    emit: "searchLists",
  },
]);

// Props
defineProps(["windowHeight"]);

// Define Emitter

// Methods
const doGetSearch = async (data) => {
  const doGetStoreToStoreRequests = storeReqs.doGetStoreToStoreRequests;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    statusId: 1,
    storeId: loggerData.value.storeId,
    pageType: "storePending",
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
  resetPage.value = true;
  await doGetSearch();
};

const acceptRequest = async (data) => {
  const doAcceptStoreDistReq = storeReqs.doAcceptStoreDistReq;
  const isAccepted = await doAcceptStoreDistReq({
    userId: loggerData.value.id,
    requestId: data.id,
    notes: "",
  });
  if (isAccepted) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: `طلب توزيع مخزني`,
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} امين ${data.storeTo.storeName} بقبول طلب توزيع كمية ${data.amount} من ${data.part.partName} الموزعة من ${data.storeFrom.storeName}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: `/store/admin-between-stores-requests?statusId=2&storeId=${data.storeTo.id}`,
      privilege: "haveReports",
    };
    await saveNotif(notification);

    doGetSearch();
  }
};

const toRejectPopup = (data) => {
  rejectedId.value = data.id;
  rejectedFullData.value = data;
  openReject.value = true;
};

const exportExcel = () => {
  let data = JSON.parse(JSON.stringify(storePending.value.content));
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
  mainSt.exportExcel(arr, "قائمة طلبات توزيع مخزني معلقة", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(storePending.value.content));
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
  mainSt.printTable(arr, props, "قائمة طلبات توزيع مخزني معلقة");
};
// Hooks
onMounted(async () => {
  await doGetSearch();
});
</script>
