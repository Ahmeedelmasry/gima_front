<template>
  <div class="p_lists">
    <SearchLists
      @doGetSearchedLists="searchClick($event)"
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
    />
    <DataTable
      :data="pLists"
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
      @viewList="
        router.push({ name: 'showPlist', params: { plistId: $event.id } })
      "
      @distList="
        router.push({
          name: 'distLists',
          params: { plistId: $event.id, billId: $event.billId },
        })
      "
      @returnList="
        router.push({
          name: 'returnLists',
          params: { plistId: $event.id, billId: $event.billId },
        })
      "
      :bottomActions="bottomActions"
      @addPackingList="packingList = true"
      @searchPackingList="openSearch = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="resetPage = false"
    />
    <PackingList
      @regetItems="doGetSearch(false)"
      v-if="packingList"
      @close_packinglist="packingList = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import { pListModule } from "@/stores/packingList/packingList";
import { authStore } from "@/stores/auth/auth";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

// Components
import PackingList from "@/components/packinglist/PackingList.vue";
import SearchLists from "@/components/packinglist/SearchLists.vue";

// Init store
const store = pListModule();
const mainSt = mainStore();
const authModule = authStore();

// Init Router
const router = useRouter();

// Data
const { pLists } = storeToRefs(store);
const { loggerData } = storeToRefs(authModule);
const page = ref(1);
const size = ref(7);
const resetPage = ref(false);
const tableLoading = ref(false);
const packingList = ref(false);
const fromDate = ref("");
const toDate = ref("");
const billId = ref("");
const supplierId = ref("");
const status = ref(0);
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "رقم الفاتورة",
    value: "billId",
    type: "text",
  },
  {
    text: "اسم المورد",
    value: ["supplier", "supplierName"],
    type: "text",
    nested: true,
  },
  {
    text: "تاريخ الادخال",
    value: "creationDate",
    type: "date",
  },
  {
    text: "حالة التوزيع",
    value: "fullDist",
    type: "status",
    check: "fullDist",
    checkText: ["مكتملة", "غير مكتملة"],
  },
  {
    text: "الملاحظات",
    value: "notes",
    type: "text",
  },
]);

const actions = ref([
  {
    icon: "mdi-eye",
    text: "تفاصيل الفاتورة",
    emit: "viewList",
    color: "green",
  },
  {
    icon: "mdi-align-horizontal-distribute",
    text: "توزيع الفاتورة",
    emit: "distList",
    color: "blue",
    checkProp: "fullDist",
    changeStatus: false,
    needPriv: true,
    priv: "haveSupplierProcessDist",
  },
  {
    icon: "mdi-keyboard-return",
    text: "ارجاع الفاتورة",
    emit: "returnList",
    color: "red",
    checkProp: "fullDist",
    changeStatus: true,
    needPriv: true,
    priv: "returnSupplierProcess",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة فاتورة توريد",
    emit: "addPackingList",
    needPriv: true,
    priv: "addSupplierProcess",
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
    emit: "searchPackingList",
  },
]);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetSearch = async (data) => {
  const doGetSearchResults = store.doGetSearchResults;
  let obj = {
    supplyProcessFromDate: fromDate.value,
    supplyProcessToDate: toDate.value,
    supplierId: supplierId.value,
    billId: billId.value,
    status: status.value,
  };
  if (data) {
    obj.size = data.size;
    obj.page = data.page;
  } else {
    obj.size = size.value;
    obj.page = page.value;
  }
  tableLoading.value = true;
  await doGetSearchResults(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.supplyProcessFromDate;
  toDate.value = data.supplyProcessToDate;
  billId.value = data.billId;
  supplierId.value = data.supplierId;
  status.value = data.status;
  resetPage.value = true;
  await doGetSearch();
};

const exportExcel = () => {
  let packingLists = JSON.parse(JSON.stringify(pLists.value.content));
  let arr = [];
  packingLists.forEach((pList) => {
    let obj = {
      "رقم الفاتورة": pList.billId,
      "اسم المورد": pList.supplier.supplierName,
      "حالة التوزيع": pList.fullDist ? "مكتمل" : "غير مكتمل",
      ملاحظات: pList.notes,
      "تاريخ الادخال": new Date(pList.creationDate).toLocaleDateString(),
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
  mainSt.exportExcel(arr, "قائمة التوريدات", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(pLists.value.content));
  let arr = [];
  let props = [
    "رقم الفاتورة",
    "اسم المورد",
    "حالة التوزيع",
    "ملاحظات",
    "تاريخ الادخال",
  ];
  data.forEach((list) => {
    let obj = {
      "رقم الفاتورة": list.billId,
      "اسم المورد": list.supplier.supplierName,
      "حالة التوزيع": list.fullDist ? "مكتمل" : "غير مكتمل",
      ملاحظات: list.notes,
      "تاريخ الادخال": new Date(list.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "التوريدات");
};

// Hooks
onMounted(async () => {
  if (!loggerData.value.userPrivileges.haveSupplierProcess) {
    return router.go(-1);
  }
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
