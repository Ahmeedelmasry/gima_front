<template>
  <div class="admin_part_history">
    <v-container class="mt-4" fluid>
      <div
        class="table_parent bg-white mb-0"
        :style="`height: ${windowHeight - 230}px; overflow: scroll`"
      >
        <div
          style="
            background-color: rgb(114, 49, 116);
            color: white;
            margin: 0 2.5px;
            font-weight: bold;
            font-size: 16px;
            width: calc(100% - 5px);
          "
          class="py-3"
          v-if="partHistory"
        >
          <v-row class="mx-0 pb-3 pt-2 px-3">
            <v-col class="py-0 text-center">
              اسم الجزء: &nbsp;&nbsp;{{ partHistory.part.partName }}
            </v-col>
          </v-row>
        </div>
        <table class="w-100 text-center" v-if="!tableLoading && partHistory">
          <thead>
            <tr>
              <th v-for="head in tableHeaders" :key="head">{{ head.text }}</th>
            </tr>
          </thead>
          <tbody style="font-size: 15px">
            <tr>
              <td>
                {{
                  partHistory.totalSuppliesIncome
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  partHistory.totalSuppliesReturns
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  partHistory.totalProductionRequested
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  partHistory.totalReturns
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  partHistory.totalHarmed
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  partHistory.totalOut
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!partHistory && !tableLoading"
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
    </v-container>
    <v-menu activator="#stores-activator">
      <v-list elevation="3">
        <v-list-item
          prepend-icon="mdi-printer"
          @click="printData"
          v-if="partHistory"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="partHistory"
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
    <AdminPartsSearch
      v-if="openSearch"
      :openSearch="openSearch"
      @closePopup="openSearch = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { partsModule } from "@/stores/parts/parts";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import AdminPartsSearch from "@/components/entities/pieces/PartFullHistorySearch.vue";

// Init store
const partsSt = partsModule();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { partHistory } = storeToRefs(partsSt);
const page = ref(1);
const size = ref(8);
const FromDate = ref("");
const ToDate = ref("");
const partId = ref("");
const tableLoading = ref(false);
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "بالتوريدات",
    value: "text",
  },
  {
    text: "ارجاع توريد",
    value: "text",
  },
  {
    text: "خرج للتصنيع",
    value: "text",
  },
  {
    text: "ارجاع للمخازن",
    value: "text",
  },
  {
    text: "الهوالك",
    value: "text",
  },
  {
    text: "خرج للبيع",
    value: "text",
  },
]);

// Watchers
watch(
  () => route,
  () => {
    if (route.name == "adminPartsHistory") {
      page.value = 1;
      size.value = 8;
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
  partId.value = route.query.partId ? route.query.partId : "";
  FromDate.value = route.query.FromDate ? route.query.FromDate : "";
  ToDate.value = route.query.ToDate ? route.query.ToDate : "";
};

const doGetSearch = async () => {
  if (!partId.value) return;
  const doGetPartFullHistory = partsSt.doGetPartFullHistory;
  const routeObj = {
    partId: partId.value,
    page: page.value,
    size: size.value,
    FromDate: FromDate.value,
    ToDate: ToDate.value,
  };
  tableLoading.value = true;
  await doGetPartFullHistory(routeObj);
  tableLoading.value = false;
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(partHistory.value));
  let arr = [];
  let obj = {
    "خرج للبيع": reqs.totalOut,
    الهوالك: reqs.totalHarmed,
    "ارجاع للمخازن": reqs.totalReturns,
    "خرج للتصنيع": reqs.totalProductionRequested,
    "ارجاع التوريدات": reqs.totalSuppliesReturns,
    بالتوريدات: reqs.totalSuppliesIncome,
  };
  arr.push(obj);

  var wscols = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  mainSt.exportExcel(arr, `تقرير تفصيلي ل ${reqs.part.partName}`, wscols);
};

const printData = () => {
  let reqs = JSON.parse(JSON.stringify(partHistory.value));
  let arr = [];
  let props = [
    "بالتوريدات",
    "ارجاع التوريدات",
    "خرج للتصنيع",
    "ارجاع للمخازن",
    "الهوالك",
    "خرج للبيع",
  ];
  let obj = {
    بالتوريدات: reqs.totalSuppliesIncome,
    "ارجاع التوريدات": reqs.totalSuppliesReturns,
    "خرج للتصنيع": reqs.totalProductionRequested,
    "ارجاع للمخازن": reqs.totalReturns,
    الهوالك: reqs.totalHarmed,
    "خرج للبيع": reqs.totalOut,
  };
  arr.push(obj);
  mainSt.printTable(arr, props, `تقرير تفصيلي ل ${reqs.part.partName}`);
};

// Hooks
onMounted(async () => {
  routeValus();
  await doGetSearch();
});
</script>

<style lang="scss">
.admin_part_history {
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
          padding: 4.4px !important;
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
