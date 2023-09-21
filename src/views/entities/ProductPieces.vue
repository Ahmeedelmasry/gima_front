<template>
  <div class="product_pieces">
    <DataTable
      :data="theParts"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :padding="2"
      :resetPage="resetPage"
      rowCheck="locked"
      @refresh="getParts($event)"
      @doEditePiece="doEditePiece($event)"
      @doDeletePiece="doDeletePiece($event)"
      :bottomActions="bottomActions"
      @addPart="addPiece = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getParts"
    />
    <AddPiece
      v-if="addPiece"
      @close_addpiece="addPiece = false"
      @regetParts="resetPage = true"
    />
    <EditPiece
      v-if="editStore"
      @close_edit="editStore = false"
      :part="toEditPiece"
      @regetParts="resetPage = true"
    />
    <DeletePiece
      v-if="deletePiece"
      :part="toDeletePiece"
      @close_delete="deletePiece = false"
      @regetParts="resetPage = true"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import { partsModule } from "@/stores/parts/parts";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import AddPiece from "@/components/entities/pieces/AddPiece.vue";
import EditPiece from "@/components/entities/pieces/EditPiece.vue";
import DeletePiece from "@/components/entities/pieces/DeletePiece.vue";
import { storeToRefs } from "pinia";

// Init store
const store = partsModule();
const mainSt = mainStore();

// Data
const { theParts } = storeToRefs(store);
const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addPiece = ref(false);
const editStore = ref(false);
const toEditPiece = ref(null);
const deletePiece = ref(false);
const toDeletePiece = ref(null);
const tableLoading = ref(false);

const tableHeaders = ref([
  {
    text: "اسم الجزء",
    value: "partName",
    type: "text",
  },
  {
    text: "تكلقة الجزء",
    value: "currentCost",
    type: "number",
  },
  {
    text: "الحد الادني",
    value: "minAmount",
    type: "number",
  },
  {
    text: "صورة الجزء",
    value: "picture",
    type: "img",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر الجزء", "حظر الجزء"],
    emit: "doDeletePiece",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockPart",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات الجزء",
    emit: "doEditePiece",
    color: "blue",
    needPriv: true,
    priv: "editPart",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة جزء جديد",
    emit: "addPart",
    needPriv: true,
    priv: "addPart",
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
const doGetAllParts = store.doGetAllParts;

const getParts = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await doGetAllParts(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const doDeletePiece = (part) => {
  toDeletePiece.value = part;
  deletePiece.value = true;
};

const doEditePiece = (piece) => {
  toEditPiece.value = piece;
  editStore.value = true;
};

const exportExcel = () => {
  let parts = JSON.parse(JSON.stringify(theParts.value.content));
  let arr = [];
  parts.forEach((item) => {
    let obj = {
      "اسم الجزء": item.partName,
      "التكلفة الحالية": item.currentCost,
      الحظر: item.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];

  mainSt.exportExcel(arr, "الاجزاء", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(theParts.value.content));
  let arr = [];
  let props = ["اسم الجزء", "التكلفة الحالية", "الحظر"];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.partName,
      "التكلفة الحالية": list.currentCost,
      الحظر: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "اجزاء المنتج");
};

// Hooks
onMounted(async () => {
  await getParts();
});
</script>
