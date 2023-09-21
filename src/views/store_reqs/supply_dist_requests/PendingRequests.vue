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
      :data="supplyPending"
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
import { storeRequests } from "@/stores/store_requests/storeRequests";
import { mainStore } from "@/stores";
import { notifsModule } from "@/stores/notifications/notifs";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/store_reqs/SearchRequests.vue";
import RejectRequest from "@/components/store_reqs/RejectRequest.vue";

// Init store
const storeReqs = storeRequests();
const authSt = authStore();
const mainSt = mainStore();
const notifsStore = notifsModule();

// Data
const { supplyPending } = storeToRefs(storeReqs);
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
    value: ["supplyProcessPart", "part", "partName"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية الموزعة",
    value: "amount",
    type: "number",
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
    value: ["supplyProcessPart", "part", "picture"],
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
  const doGetStoreRequests = storeReqs.doGetStoreRequests;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    statusId: 1,
    storeId: loggerData.value.storeId,
    pageType: "supplyPending",
  };
  if (data) {
    routeObj.page = data.page;
    routeObj.size = data.size;
  } else {
    routeObj.size = size.value;
    routeObj.page = page.value;
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
  resetPage.value = true;
  await doGetSearch();
};

const acceptRequest = async (data) => {
  const doAcceptRequest = storeReqs.doAcceptRequest;
  console.log(data);
  const isAccepted = await doAcceptRequest({
    userId: loggerData.value.id,
    requestId: data.id,
    notes: "",
  });
  if (isAccepted) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: `طلب توزيع فاتورة توريد رقم ${data.supplyProcessPart.supplyProcess.billId}`,
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} امين ${data.store.storeName} بقبول طلب توزيع كمية ${data.amount} من ${data.supplyProcessPart.part.partName}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: `/store/admin-requests?statusId=2&storeId=${data.store.id}`,
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
  let data = JSON.parse(JSON.stringify(supplyPending.value.content));
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
  mainSt.exportExcel(arr, "قائمة طلبات توزيع التوريدات المعلقة", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(supplyPending.value.content));
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
  mainSt.printTable(arr, props, "قائمة طلبات توزيع التوريدات المعلقة");
};

// Hooks
onMounted(async () => {
  await doGetSearch();
});
</script>
