<template>
  <div class="adminPlistsReturns">
    <DiststoretoStore
      v-if="openStoreToStoreDist"
      @regetData="regetData"
      @close_popup="openStoreToStoreDist = false"
      :openPopup="openStoreToStoreDist"
      :fromStore="fromStore"
      :distPart="distPart"
    />
    <v-container class="mt-4" fluid>
      <div
        class="table_parent bg-white mb-0"
        :style="`height: ${windowHeight - 225}px; overflow: scroll`"
      >
        <table
          class="w-100 text-center"
          v-if="
            !tableLoading &&
            returnedReports.content &&
            returnedReports.content.length
          "
        >
          <thead>
            <tr>
              <th v-for="head in tableHeaders" :key="head">{{ head.text }}</th>
            </tr>
          </thead>
          <tbody style="font-size: 15px">
            <tr v-for="list in returnedReports.content" :key="list.id">
              <td style="width: 12%">
                {{ list.supplyProcess.billId }}
              </td>
              <td style="width: 12%">
                {{ list.supplyProcess.supplier.supplierName }}
              </td>
              <td style="width: 20%">
                {{ list.part.partName }}
              </td>
              <td style="width: 12%">
                {{
                  list.amountIncoming
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td style="width: 12%">
                {{
                  list.amountReturn
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td style="width: 12%">
                {{ new Date(list.creationDate).toISOString().split("T")[0] }}
              </td>
              <td style="width: 12%">
                {{ list.createdBy.userName }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="
            (!returnedReports.content && !tableLoading) ||
            (returnedReports.content &&
              !returnedReports.content.length &&
              !tableLoading)
          "
          :style="`min-height: ${windowHeight - 250}px`"
          class="no_data"
        >
          <p>لا توجد نتائج</p>
        </div>
        <v-progress-linear
          style="width: 100%"
          indeterminate
          color="rgb(60 22 68)"
          v-if="tableLoading"
        ></v-progress-linear>
      </div>
      <v-divider color="black"></v-divider>
      <v-row class="pt-4 align-center bg-white">
        <v-col cols="3" class="pt-2">
          <v-select
            :items="ranges"
            v-model="size"
            variant="outlined"
            label="عدد النتائج"
            @update:model-value="selectSize"
            class="mr-3"
            style="transform: translateY(8px); width: 100px"
            v-if="returnedReports.content && returnedReports.content.length"
            :disabled="tableLoading"
          ></v-select>
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="returnedReports.content ? returnedReports.totalPages : 2"
            :total-visible="returnedReports.content ? returnedReports.size : 5"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            @update:model-value="doGetSearch"
            v-if="returnedReports.content && returnedReports.content.length"
            :disabled="tableLoading"
          >
          </v-pagination>
        </v-col>
      </v-row>
    </v-container>
    <v-menu activator="#stores-activator">
      <v-list elevation="3">
        <v-list-item
          prepend-icon="mdi-printer"
          @click="printData"
          v-if="returnedReports && returnedReports.content.length"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="returnedReports && returnedReports.content.length"
        >
          <v-list-item-title>تحميل الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-magnify" @click="openSearch = true">
          <v-list-item-title style="margin-top: -5px">بحث</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-icon
      id="stores-activator"
      style="
        position: fixed;
        left: 20px;
        bottom: 40px;
        z-index: 2;
        border-radius: 50%;
        padding: 30px;
        box-shadow: 0px 0px 15px -2px black;
        cursor: pointer;
        background: rgb(69, 22, 70);
        color: white;
      "
      >mdi-menu</v-icon
    >
    <AdminReturnsearch
      v-if="openSearch"
      :openSearch="openSearch"
      @closePopup="openSearch = false"
    />
    <StoreSettlement
      v-if="settleStore"
      :openPopup="settleStore"
      @closePopup="settleStore = false"
      :storeId="storeId"
      @doGetSearchedLists="regetData"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { pListModule } from "@/stores/packingList/packingList";
import { mainStore } from "@/stores";

import DiststoretoStore from "@/components/store_to_store/DiststoretoStore.vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import AdminReturnsearch from "@/components/packinglist/SearchReturned.vue";
import StoreSettlement from "@/components/store_to_store/StoreSettlement.vue";

// Init store
const packingModule = pListModule();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { returnedReports } = storeToRefs(packingModule);

const page = ref(1);
const size = ref(7);
const ranges = [7, 14, 21, 35];
const tableLoading = ref(false);
const supplyProcessId = ref("");
const FromDate = ref("");
const partId = ref("");
const ToDate = ref("");
const openStoreToStoreDist = ref(false);
const fromStore = ref("");
const distPart = ref("");
const openSearch = ref(false);
const settleStore = ref(false);

const tableHeaders = ref([
  {
    text: "رقم الفاتورة",
    value: "id",
  },
  {
    text: "اسم المورد",
    value: "supplier.supplierName",
  },
  {
    text: "اسم الجزء",
    value: "supplier.supplierName",
  },
  {
    text: "الكمية الواردة",
    value: "supplier.supplierName",
  },
  {
    text: "الكمية المرجعة",
    value: "creationDate",
  },
  {
    text: "تاريخ الارجاع",
    value: "creationDate",
  },
  {
    text: "ارجاع بواسطة",
    value: "creationDate",
  },
]);

// Watchers
watch(
  () => route,
  () => {
    if (route.name == "AdminPlistsreturns") {
      page.value = 1;
      size.value = 7;
      routeValus();
      doGetSearch();
    }
  },
  { deep: true }
);

// Props
defineProps(["windowHeight"]);

// Methods
const routeValus = () => {
  supplyProcessId.value = route.query.supplyProcessId
    ? route.query.supplyProcessId
    : "";
  FromDate.value = route.query.FromDate ? route.query.FromDate : "";
  ToDate.value = route.query.ToDate ? route.query.ToDate : "";
  partId.value = route.query.partId ? route.query.partId : "";
};

const doGetSearch = async () => {
  const doGetPlistsReturns = packingModule.doGetPlistsReturns;
  const routeObj = {
    supplyProcessId: supplyProcessId.value,
    page: page.value,
    size: size.value,
    FromDate: FromDate.value,
    ToDate: ToDate.value,
    partId: partId.value,
  };
  tableLoading.value = true;
  await doGetPlistsReturns(routeObj);
  tableLoading.value = false;
};

const selectSize = async () => {
  page.value = 1;
  await doGetSearch();
};

const regetData = () => {
  doGetSearch();
};
const getReturns = async () => {
  await doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(returnedReports.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "رقم الفاتورة": req.supplyProcess.billId,
      "اسم المورد": req.supplyProcess.supplier.supplierName,
      "اسم الجزء": req.part.partName,
      "الكمية الواردة": req.amountIncoming,
      "الكمية المرجعة": req.amountReturn,
      "تاريخ الارجاع": new Date(req.creationDate).toLocaleDateString(),
      "ارجاع بواسطة": req.createdBy.userName,
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
    { wch: 20 },
  ];
  mainSt.exportExcel(arr, `تقارير ارجاعات التوريدات`, wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(returnedReports.value.content));
  let arr = [];
  let props = [
    "رقم الفاتورة",
    "اسم المورد",
    "اسم الجزء",
    "الكمية الواردة",
    "الكمية المرجعة",
    "تاريخ الارجاع",
    "ارجاع بواسطة",
  ];
  data.forEach((list) => {
    let obj = {
      "رقم الفاتورة": list.supplyProcess.billId,
      "اسم المورد": list.supplyProcess.supplier.supplierName,
      "اسم الجزء": list.part.partName,
      "الكمية الواردة": list.amountIncoming,
      "الكمية المرجعة": list.amountReturn,
      "تاريخ الارجاع": new Date(list.creationDate).toLocaleDateString(),
      "ارجاع بواسطة": list.createdBy.userName,
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, `تقارير ارجاعات التوريدات`);
};

// Hooks
onMounted(async () => {
  routeValus();
  await getReturns();
});
</script>

<style lang="scss">
.adminPlistsReturns {
  table {
    overflow-y: scroll;
    background-color: white;
    thead {
      font-size: 14px;
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
          padding: 6px 0 !important;
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
}
.v-list-item__prepend > .v-icon {
  margin-inline-end: 10px !important;
}
</style>
