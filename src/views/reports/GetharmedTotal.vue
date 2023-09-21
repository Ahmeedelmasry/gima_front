<template>
  <div class="get_returns">
    <v-container class="mt-4" fluid>
      <div
        class="table_parent bg-white mb-0"
        :style="`height: ${windowHeight - 230}px; overflow: scroll`"
      >
        <table
          class="w-100 text-center"
          v-if="
            !tableLoading && totalHarmed.content && totalHarmed.content.length
          "
        >
          <thead>
            <tr>
              <th
                v-for="head in tableHeaders"
                :key="head"
                :style="
                  head.value == 'refuseNotes' && statusId != 3
                    ? 'display: none'
                    : ''
                "
              >
                {{ head.text }}
              </th>
            </tr>
          </thead>
          <tbody style="font-size: 15px">
            <tr v-for="list in totalHarmed.content" :key="list.id">
              <td style="width: 12%">
                {{ list.part.partName }}
              </td>
              <td style="width: 12%">
                {{
                  list.totalAmount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="
            (!totalHarmed.content && !tableLoading) ||
            (totalHarmed.content &&
              !totalHarmed.content.length &&
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
            :disabled="tableLoading"
            v-if="totalHarmed.content && totalHarmed.content.length"
          ></v-select>
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="totalHarmed.content ? totalHarmed.totalPages : 2"
            :total-visible="totalHarmed.content ? totalHarmed.size : 5"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            @update:model-value="doGetSearch"
            v-if="totalHarmed.content && totalHarmed.content.length"
            :disabled="tableLoading"
          >
          </v-pagination>
        </v-col>
      </v-row>
    </v-container>
    <v-menu activator="#sup-dist-activator">
      <v-list elevation="3">
        <v-list-item
          prepend-icon="mdi-printer"
          @click="printData"
          v-if="totalHarmed.content && totalHarmed.content.length"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="totalHarmed.content && totalHarmed.content.length"
        >
          <v-list-item-title>تحميل الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-magnify" @click="openSearch = true">
          <v-list-item-title>بحث</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-icon
      id="sup-dist-activator"
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
    <AdminSearchreqs
      v-if="openSearch"
      :openSearch="openSearch"
      @closePopup="openSearch = false"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { productionReturns } from "@/stores/production_request/productionReturns";
import { mainStore } from "@/stores";

import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import AdminSearchreqs from "@/components/add_returns/SearchharmedTotal.vue";

// Init store
const productionSt = productionReturns();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { totalHarmed } = storeToRefs(productionSt);

const page = ref(1);
const size = ref(7);
const ranges = [7, 14, 21, 35];
const tableLoading = ref(false);
const fromDate = ref("");
const toDate = ref("");
const partId = ref("");
const storeId = ref("");
const statusId = ref("");
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: "id",
  },
  {
    text: "اجمالي الهوالك",
    value: "",
  },
]);

// Watchers
watch(
  () => route,
  async () => {
    if (route.name == "getTotalHarmed") {
      page.value = 1;
      size.value = 7;
      routeValus();
      await doGetSearch();
    }
  },
  { deep: true }
);

// Props
defineProps(["windowHeight"]);

// Methods
const routeValus = () => {
  partId.value = route.query.partId ? route.query.partId : "";
  toDate.value = route.query.toDate ? route.query.toDate : "";
  fromDate.value = route.query.fromDate ? route.query.fromDate : "";
  storeId.value = route.query.storeId ? route.query.storeId : "";
};

const doGetSearch = async () => {
  const doGetTotalHarmed = productionSt.doGetTotalHarmed;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    storeId: storeId.value,
    size: size.value,
    page: page.value,
  };
  tableLoading.value = true;
  await doGetTotalHarmed(routeObj);
  tableLoading.value = false;
};

const selectSize = async () => {
  page.value = 1;
  await doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(totalHarmed.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم الجزء": req.part.partName,
      "اجمالي الهوالك": req.totalAmount,
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
  mainSt.exportExcel(arr, "تقارير الهوالك مجمع", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(totalHarmed.value.content));
  let arr = [];
  let props = ["اسم الجزء", "اجمالي الهوالك"];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "اجمالي الهوالك": list.totalAmount,
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "تقارير الهوالك مجمع");
};

// Hooks
onMounted(async () => {
  routeValus();
  await doGetSearch();
});
</script>

<style lang="scss">
.get_returns {
  table {
    overflow-y: scroll;
    background-color: white;
    font-size: 14px !important;
    thead {
      tr {
        box-shadow: 0px 0px 3px -2px black;
      }
    }
    tbody {
      tr {
        box-shadow: 0px 0px 3px -2px black;
      }
    }

    th {
      padding: 10px 0 !important;
    }
    td {
      padding: 7px !important;
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
