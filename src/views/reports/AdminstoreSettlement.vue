<template>
  <div class="adminFilterStores">
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
            settlementReport.content &&
            settlementReport.content.length
          "
        >
          <caption
            style="
              background-color: rgb(114, 49, 116);
              color: white;
              margin: 0 2px;
              font-weight: bold;
              font-size: 16px;
            "
            class="py-3"
          >
            {{
              settlementReport.content[0].store.storeName
            }}
          </caption>
          <thead>
            <tr>
              <th v-for="head in tableHeaders" :key="head">{{ head.text }}</th>
            </tr>
          </thead>
          <tbody style="font-size: 15px">
            <tr v-for="list in settlementReport.content" :key="list.id">
              <td style="width: 12%">
                {{ list.part.partName }}
              </td>
              <td style="width: 12%">
                {{
                  list.amountPrevious
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td style="width: 12%">
                {{
                  list.amountUpdate
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td
                :style="`width: 12%; color: ${
                  list.amountDiff > 0
                    ? 'orange'
                    : list.amountDiff == 0
                    ? 'green'
                    : 'red'
                }`"
              >
                {{
                  list.amountDiff
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td style="width: 12%; font-size: 13px">
                {{ new Date(list.creationDate).toISOString().split("T")[0] }}
              </td>
              <td style="width: 12%; font-size: 13px">
                {{ list.createdBy.userName }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="
            (!settlementReport.content && !tableLoading) ||
            (settlementReport.content &&
              !settlementReport.content.length &&
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
            v-if="settlementReport.content && settlementReport.content.length"
            :disabled="tableLoading"
          ></v-select>
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="
              settlementReport.totalPages ? settlementReport.totalPages : 2
            "
            :total-visible="settlementReport.size ? settlementReport.size : 5"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            @update:model-value="doGetSearch"
            v-if="settlementReport.content && settlementReport.content.length"
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
          v-if="settlementReport.content && settlementReport.content.length"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="settlementReport.content && settlementReport.content.length"
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
    <AdminstoreSearch
      v-if="openSearch"
      :openSearch="openSearch"
      @closePopup="openSearch = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { storesModule } from "@/stores/the_stores/theStores";
import { mainStore } from "@/stores";
import DiststoretoStore from "@/components/store_to_store/DiststoretoStore.vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import AdminstoreSearch from "@/components/entities/stores/AdminsettlementSearch.vue";

// Init store
const storesMod = storesModule();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { settlementReport } = storeToRefs(storesMod);
const page = ref(1);
const size = ref(7);
const ranges = [7, 14, 21, 35];
const tableLoading = ref(false);
const storeId = ref("");
const FromDate = ref("");
const ToDate = ref("");
const openStoreToStoreDist = ref(false);
const fromStore = ref("");
const distPart = ref("");
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: "id",
  },
  {
    text: "الكمية الدفترية",
    value: "supplier.supplierName",
  },
  {
    text: "الكمية الفعلية",
    value: "supplier.supplierName",
  },
  {
    text: "عجز / زيادة",
    value: "supplier.supplierName",
  },
  {
    text: "تاريخ التسوية",
    value: "creationDate",
  },
  {
    text: "تسوية بواسطة",
    value: "creationDate",
  },
]);

// Watchers
watch(
  () => route,
  () => {
    if (route.name == "adminStoreSettlement") {
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
  storeId.value = route.query.storeId ? route.query.storeId : "";
  FromDate.value = route.query.FromDate ? route.query.FromDate : "";
  ToDate.value = route.query.ToDate ? route.query.ToDate : "";
};

const doGetSearch = async () => {
  if (!storeId.value) {
    settlementReport.value = [];
    return;
  }
  const doGetSettlementsReports = storesMod.doGetSettlementsReports;
  const routeObj = {
    storeId: storeId.value,
    page: page.value,
    size: size.value,
    FromDate: FromDate.value,
    ToDate: ToDate.value,
  };
  tableLoading.value = true;
  await doGetSettlementsReports(routeObj);
  tableLoading.value = false;
};

const selectSize = async () => {
  page.value = 1;
  await doGetSearch();
};

const regetData = () => {
  doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(settlementReport.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم الجزء": req.part.partName,
      "الكمية الدفترية": req.amountPrevious,
      "الكمية الفعلية": req.amountUpdate,
      "عجز / زيادة": req.amountDiff,
      "تاريخ التسوية": new Date(req.creationDate).toLocaleDateString(),
      "تسوية بوساطة": req.createdBy.userName,
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
  mainSt.exportExcel(arr, `تقارير تسوية ${reqs[0].store.storeName}`, wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(settlementReport.value.content));
  let arr = [];
  let props = [
    "اسم الجزء",
    "الكمية الدفترية",
    "الكمية الفعلية",
    "عجز / زيادة",
    "تاريخ التسوية",
    "تسوية بوساطة",
  ];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "الكمية الدفترية": list.amountPrevious,
      "الكمية الفعلية": list.amountUpdate,
      "عجز / زيادة": list.amountDiff,
      "تاريخ التسوية": new Date(list.creationDate).toLocaleDateString(),
      "تسوية بوساطة": list.createdBy.userName,
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, `تقارير تسوية ${data[0].store.storeName}`);
};

// Hooks
onMounted(async () => {
  routeValus();
  await doGetSearch();
});
</script>

<style lang="scss">
.adminFilterStores {
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
