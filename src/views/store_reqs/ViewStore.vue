<template>
  <div class="view_store">
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick"
    />
    <DataTable
      :data="singleStore"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      @refresh="viewStore($event)"
      @editUserMethod="editUserMethod($event)"
      @doBlockUser="doBlockUser($event)"
      :bottomActions="bottomActions"
      @printTable="printData"
      @downloadTable="exportExcel"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, inject } from "vue";
import { authStore } from "@/stores/auth/auth";
import { storesModule } from "@/stores/the_stores/theStores";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";

// Components
import SearchLists from "@/components/store_reqs/SearchRequests.vue";

// Init store
const authSt = authStore();
const storesSt = storesModule();
const mainSt = mainStore();

// Data
const { loggerData } = storeToRefs(authSt);
const { singleStore } = storeToRefs(storesSt);
const page = ref(1);
const size = ref(8);
const tableLoading = ref(false);
const openSearch = ref(false);

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: ["part", "partName"],
    type: "text",
    nested: true,
  },
  {
    text: "الكمية",
    value: "amount",
    type: "number",
  },
  {
    text: "صورة الجزء",
    value: ["part", "picture"],
    type: "img",
    nested: true,
  },
]);

const actions = ref([]);

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
]);

// Props
defineProps(["windowHeight"]);

// Define Emitter
const emitter = inject("emitter"); // Inject `emitter`

emitter.on("pl_search", () => {
  // *Listen* for event
});

// Methods
const viewStore = async (data) => {
  let obj = {
    storeId: loggerData.value.storeId,
  };
  if (data) {
    obj.page = data.page;
    obj.size = data.size;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  const doViewStore = storesSt.doViewStore;
  tableLoading.value = true;
  await doViewStore(obj);
  tableLoading.value = false;
};

const exportExcel = () => {
  let data = JSON.parse(JSON.stringify(singleStore.value.content));
  console.log(data);
  let arr = [];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "الكمية المتاحة": list.amount,
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(
    arr,
    `الاجزاء المتوفرة ب ${data[0].store.storeName}`,
    wscols
  );
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(singleStore.value.content));
  let arr = [];
  let props = ["اسم الجزء", "الكمية المتاحة"];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "الكمية المتاحة": list.amount,
    };
    arr.push(obj);
  });
  mainSt.printTable(
    arr,
    props,
    `الاجزاء المتوفرة ب ${data[0].store.storeName}`
  );
};

// Hooks
onMounted(async () => {
  await viewStore();
});
</script>

<style lang="scss">
.view_store {
  table {
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
