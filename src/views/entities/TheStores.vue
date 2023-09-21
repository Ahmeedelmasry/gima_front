<template>
  <div class="stores">
    <DataTable
      :data="theStores"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :resetPage="resetPage"
      :padding="7.3"
      rowCheck="locked"
      @refresh="getStores($event)"
      @doEditStore="doEditStore($event)"
      @doDeleteStore="doDeleteStore($event)"
      :bottomActions="bottomActions"
      @addStore="addStore = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getStores"
    />
    <AddStore
      v-if="addStore"
      @close_addstore="addStore = false"
      @reGetStores="resetPage = true"
    />
    <EditStore
      v-if="editStore"
      @close_edit="editStore = false"
      :store="toEditStore"
      @reGetStores="resetPage = true"
    />
    <DeleteStore
      v-if="deleteStore"
      :store="deletedStore"
      @close_delete="deleteStore = false"
      @reGetStores="resetPage = true"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { storesModule } from "@/stores/the_stores/theStores";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { storeToRefs } from "pinia";
import AddStore from "@/components/entities/stores/AddStore.vue";
import EditStore from "@/components/entities/stores/EditStore.vue";
import DeleteStore from "@/components/entities/stores/DeleteStore.vue";
import { onMounted } from "vue";

// Init Store
const store = storesModule();
const mainSt = mainStore();

// Data
const { theStores } = storeToRefs(store);

const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addStore = ref(false);
const editStore = ref(false);
const toEditStore = ref(null);
const deleteStore = ref(false);
const deletedStore = ref(null);
const tableLoading = ref(false);

const tableHeaders = ref([
  {
    text: "اسم المخزن",
    value: "storeName",
    type: "text",
  },
  {
    text: "امين المخزن",
    type: "text",
    value: ["user", "userName"],
    nested: true,
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر المخزن", "حظر المخزن"],
    emit: "doDeleteStore",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockStore",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات المخزن",
    emit: "doEditStore",
    color: "blue",
    needPriv: true,
    priv: "editStore",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة مخزن جديد",
    emit: "addStore",
    needPriv: true,
    priv: "addStore",
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
]);

// Props
defineProps(["windowHeight"]);

// Methods
const dogetAllStores = store.dogetAllStores;

const getStores = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await dogetAllStores(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const doDeleteStore = (store) => {
  deletedStore.value = store;
  deleteStore.value = true;
};

const doEditStore = (store) => {
  toEditStore.value = store;
  editStore.value = true;
};

const exportExcel = () => {
  let stores = JSON.parse(JSON.stringify(theStores.value.content));
  let arr = [];
  stores.forEach((store) => {
    let obj = {
      "اسم المخزن": store.storeName,
      "امين المخزن": store.user.userName,
      الحالة: store.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "المخازن", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(theStores.value.content));
  let arr = [];
  let props = ["اسم المخزن", "امين المخزن", "الحالة"];
  data.forEach((list) => {
    let obj = {
      "اسم المخزن": list.storeName,
      "امين المخزن": list.user.userName,
      الحالة: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "المخازن");
};

// Hooks
onMounted(async () => {
  await getStores();
});
</script>
