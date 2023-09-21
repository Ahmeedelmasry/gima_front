<template>
  <div class="adminPartsFilter">
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
          v-if="partsReports.content && partsReports.content.length"
        >
          <v-row class="mx-0 pb-3 pt-2 px-3">
            <v-col cols="4" class="py-0">
              اسم الجزء: &nbsp;&nbsp;{{ singlePart.partName }}
            </v-col>
            <v-col cols="4" class="py-0">
              الكمية بالمخازن:&nbsp;&nbsp;
              {{
                singlePart.totalInStores
                  ? singlePart.totalInStores
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : 0
              }}
            </v-col>
          </v-row>
        </div>
        <table
          class="w-100 text-center"
          v-if="!tableLoading && partsReports && partsReports.content.length"
        >
          <thead>
            <tr>
              <th v-for="head in tableHeaders" :key="head">{{ head.text }}</th>
            </tr>
          </thead>
          <tbody style="font-size: 15px">
            <tr v-for="(list, i) in partsReports.content" :key="i">
              <td>
                {{ list.billId }}
              </td>
              <td>
                {{ list.supplierName }}
              </td>
              <td>
                {{
                  list.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  list.distAmount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  list.remainAmount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{ list.creationBy }}
              </td>
              <td>
                {{ new Date(list.creationDate).toISOString().split("T")[0] }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="
            (!partsReports.content && !tableLoading) ||
            (partsReports.content &&
              !partsReports.content.length &&
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
            v-if="partsReports.content && partsReports.content.length"
            :disabled="tableLoading"
          />
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="partsReports ? partsReports.totalPages : 2"
            :total-visible="partsReports.content ? partsReports.size : 5"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            @update:model-value="doGetSearch"
            v-if="partsReports.content && partsReports.content.length"
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
          v-if="partsReports.content && partsReports.content.length"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="partsReports.content && partsReports.content.length"
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
import AdminPartsSearch from "@/components/entities/pieces/AdminPartsSearch.vue";

// Init store
const partsSt = partsModule();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { partsReports, singlePart } = storeToRefs(partsSt);
const page = ref(1);
const size = ref(8);
const FromDate = ref("");
const ToDate = ref("");
const billId = ref("");
const supplierId = ref("");
const partId = ref("");
const ranges = [8, 16, 24, 40];
const tableLoading = ref(false);
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "رقم الفاتورة",
    value: "id",
  },
  {
    text: "اسم المورد",
    value: "id",
  },
  {
    text: "كمية التوريد",
    value: "supplier.supplierName",
  },
  {
    text: "الكمية الموزعة",
    value: "supplier.supplierName",
  },
  {
    text: "الكمية المتبقية",
    value: "supplier.supplierName",
  },
  {
    text: "مسؤول التوريد",
    value: "creationDate",
  },
  {
    text: "تاريخ التوريد",
    value: "creationDate",
  },
]);

// Watchers
watch(
  () => route,
  () => {
    if (route.name == "adminParts") {
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
  supplierId.value = route.query.supplierId ? route.query.supplierId : "";
  billId.value = route.query.billId ? route.query.billId : "";
  FromDate.value = route.query.FromDate ? route.query.FromDate : "";
  ToDate.value = route.query.ToDate ? route.query.ToDate : "";
};

const doGetSearch = async () => {
  if (!partId.value) return;
  const doViewPart = partsSt.doGetPartsReports;
  const doGetSinglePart = partsSt.doGetSinglePart;
  const routeObj = {
    partId: partId.value,
    page: page.value,
    size: size.value,
    FromDate: FromDate.value,
    ToDate: ToDate.value,
    supplierId: supplierId.value,
    billId: billId.value,
  };
  tableLoading.value = true;
  const gotData = await doGetSinglePart(partId.value);
  if (gotData) {
    await doViewPart(routeObj);
  }
  tableLoading.value = false;
};

const selectSize = async () => {
  page.value = 1;
  await doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(partsReports.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "رقم الفاتورة": req.billId,
      "اسم المورد": req.supplierName,
      "كمية التوريد": req.amount,
      "الكمية الموزعة": req.distAmount,
      "الكمية المتبقية": req.remainAmount,
      "مسؤول التوريد": req.creationBy,
      "تاريخ التوريد": new Date(req.creationDate).toLocaleDateString(),
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
  mainSt.exportExcel(
    arr,
    `تقارير ${singlePart.value.partName} بالتوريدات`,
    wscols
  );
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(partsReports.value.content));
  let arr = [];
  let props = [
    "رقم الفاتورة",
    "اسم المورد",
    "الكمية الموزعة",
    "الكمية المتبقية",
    "مسؤول التوريد",
    "تاريخ التوريد",
  ];
  data.forEach((list) => {
    let obj = {
      "رقم الفاتورة": list.billId,
      "اسم المورد": list.supplierName,
      "كمية التوريد": list.amount,
      "الكمية الموزعة": list.distAmount,
      "الكمية المتبقية": list.remainAmount,
      "مسؤول التوريد": list.creationBy,
      "تاريخ التوريد": new Date(list.creationDate).toLocaleDateString(),
    };
    arr.push(obj);
  });
  mainSt.printTable(
    arr,
    props,
    `تقارير ${singlePart.value.partName} بالتوريدات`
  );
};

// Hooks
onMounted(async () => {
  routeValus();
  await doGetSearch();
});
</script>

<style lang="scss">
.adminPartsFilter {
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
