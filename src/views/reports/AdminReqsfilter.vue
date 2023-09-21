<template>
  <div class="adminFilteredReqs">
    <v-container class="mt-4" fluid>
      <div
        class="table_parent bg-white mb-0"
        :style="`height: ${windowHeight - 230}px; overflow: scroll`"
      >
        <table
          class="w-100 text-center"
          v-if="!tableLoading && requests.content && requests.content.length"
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
              requests.content[0].store.storeName
            }}
          </caption>
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
            <tr v-for="list in requests.content" :key="list.id">
              <td style="width: 12%">
                {{ list.supplyProcessPart.part.partName }}
              </td>
              <td style="width: 12%">
                {{
                  list.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td style="width: 12%; font-size: 13px">
                {{ new Date(list.creationDate).toISOString().split("T")[0] }}
              </td>
              <td style="width: 12%; font-size: 13px">
                {{ list.distBy.userName }}
              </td>
              <td v-if="statusId == 3">
                <span>
                  {{
                    list.notes.length > 30
                      ? list.notes.substring(0, 29) + "..."
                      : list.notes
                  }}
                  <v-tooltip activator="parent" location="bottom">{{
                    list.notes
                  }}</v-tooltip>
                </span>
              </td>
              <td
                :style="`width: 10%; color: ${
                  list.status.id == 1
                    ? 'orange'
                    : list.status.id == 2
                    ? 'green'
                    : 'red'
                }`"
              >
                {{
                  list.status.id == 1
                    ? "معلقة"
                    : list.status.id == 2
                    ? "مقبولة"
                    : "مرفوضة"
                }}
              </td>
              <td style="width: 12%">
                <img
                  :src="`data:image/jpg;base64,${list.supplyProcessPart.part.picture}`"
                  alt=""
                  width="30"
                  height="30"
                  style="border-radius: 50%"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="
            (!requests.content && !tableLoading) ||
            (requests.content && !requests.content.length && !tableLoading)
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
            v-if="requests.content && requests.content.length"
            :disabled="tableLoading"
          />
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="requests.content ? requests.totalPages : 2"
            :total-visible="requests.content ? requests.size : 5"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            @update:model-value="doGetSearch"
            :disabled="tableLoading"
            v-if="requests.content && requests.content.length"
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
          v-if="requests.content && requests.content.length"
        >
          <v-list-item-title>طباعة الجدول</v-list-item-title>
        </v-list-item>
        <v-list-item
          prepend-icon="mdi-download"
          @click="exportExcel"
          v-if="requests.content && requests.content.length"
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
      :reqId="1"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch } from "vue";
import { storeRequests } from "@/stores/store_requests/storeRequests";
import { mainStore } from "@/stores";

import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import AdminSearchreqs from "@/components/store_reqs/AdminSearchreqs.vue";

// Init store
const storeReqs = storeRequests();
const mainSt = mainStore();

// Init route
const route = useRoute();

// Data
const { requests } = storeToRefs(storeReqs);
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
    text: "الكمية الموزعة",
    value: "",
  },
  {
    text: "تاريخ التوزيع",
    value: "creationDate",
  },
  {
    text: "توزيع بواسطة",
    value: "creationDate",
  },
  {
    text: "سبب الرفض",
    value: "refuseNotes",
  },
  {
    text: "حالة الطلب",
    value: "status",
  },
  {
    text: "صورة الجزء",
    value: "billId",
  },
]);

// Watchers
watch(
  () => route,
  async () => {
    if (route.name == "admineRequests") {
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
  statusId.value = route.query.statusId ? route.query.statusId : "";
  partId.value = route.query.partId ? route.query.partId : "";
  toDate.value = route.query.toDate ? route.query.toDate : "";
  fromDate.value = route.query.fromDate ? route.query.fromDate : "";
  storeId.value = route.query.storeId ? route.query.storeId : "";
};

const doGetSearch = async () => {
  if (!storeId.value) {
    requests.value = [];
    return;
  }
  const doGetStoreRequests = storeReqs.doGetStoreRequests;
  const routeObj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    partId: partId.value,
    size: size.value,
    page: page.value,
    statusId: statusId.value,
    storeId: storeId.value,
  };
  tableLoading.value = true;
  await doGetStoreRequests(routeObj);
  tableLoading.value = false;
};

const selectSize = async () => {
  page.value = 1;
  await doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(requests.value.content));
  console.log(reqs);
  let arr = [];
  reqs.forEach((req) => {
    let obj = {
      "اسم الجزء": req.supplyProcessPart.part.partName,
      "الكمية الموزعة": req.amount,
      "حالة الطلب":
        req.status.id == 1 ? "معلقة" : req.status.id == 2 ? "مقبولة" : "مرفوضة",
      "تاريخ التوزيع": new Date(req.creationDate).toLocaleDateString(),
      "توزيع بواسطة": req.distBy.userName,
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(
    arr,
    `تقارير طلبات توزيع التوريدات ل ${reqs[0].store.storeName}`,
    wscols
  );
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(requests.value.content));
  let arr = [];
  let props = [
    "اسم الجزء",
    "الكمية الموزعة",
    "حالة الطلب",
    "تاريخ التوزيع",
    "توزيع بواسطة",
  ];
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
      "توزيع بواسطة": list.distBy.userName,
    };
    arr.push(obj);
  });
  mainSt.printTable(
    arr,
    props,
    `تقارير طلبات توزيع التوريدات ل ${data[0].store.storeName}`
  );
};

// Hooks
onMounted(async () => {
  routeValus();
  await doGetSearch();
});
</script>

<style lang="scss">
.adminFilteredReqs {
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
      padding: 0 !important;
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
