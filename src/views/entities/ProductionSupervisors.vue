<template>
  <div class="supervisors">
    <DataTable
      :data="supers"
      :tableHeaders="tableHeaders"
      :actions="actions"
      :bottomActions="bottomActions"
      :windowHeight="windowHeight"
      :defaultImg="null"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :resetPage="resetPage"
      :padding="7.3"
      rowCheck="locked"
      @refresh="getSupers($event)"
      @doEditSupervisor="doEditSupervisor($event)"
      @doblockSuper="doblockSuper($event)"
      @addSuper="addSuper = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getSupers"
    />
    <AddProductionsuper
      v-if="addSuper"
      @close_add="addSuper = false"
      @regetSupers="resetPage = true"
    />
    <EditSupervisor
      v-if="editSupervisor"
      @close_edit="editSupervisor = false"
      :supervisor="toEditSupervisor"
      @regetSupervisors="resetPage = true"
    />
    <DeleteSupervisor
      v-if="deleteSuper"
      :supervisor="deletedSuper"
      @close_delete="deleteSuper = false"
      @regetSupers="resetPage = true"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { supersModule } from "@/stores/production_supers/productionSupers.js";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";
import AddProductionsuper from "@/components/entities/production_supervisors/AddSuper.vue";
import EditSupervisor from "@/components/entities/production_supervisors/EditSupervisor.vue";
import DeleteSupervisor from "@/components/entities/production_supervisors/DeleteSupervisor.vue";
import { onMounted } from "vue";

// Init Store
const store = supersModule();
const mainSt = mainStore();

// Data
const { supers } = storeToRefs(store);

const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addSuper = ref(false);
const editSupervisor = ref(false);
const toEditSupervisor = ref(null);
const deleteSuper = ref(false);
const deletedSuper = ref(null);
const tableLoading = ref(false);

const tableHeaders = ref([
  {
    text: "رقم معرف",
    value: "id",
    type: "text",
  },
  {
    text: "اسم المشرف",
    value: "supervisorName",
    type: "text",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر المشرف", "حظر المشرف"],
    emit: "doblockSuper",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockSupervisor",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات المشرف",
    emit: "doEditSupervisor",
    color: "blue",
    needPriv: true,
    priv: "editSupervisor",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة مشرف جديد",
    emit: "addSuper",
    needPriv: true,
    priv: "addSupervisor",
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
const doGetSupers = store.doGetSupers;

const getSupers = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await doGetSupers(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const doblockSuper = (supervisor) => {
  deletedSuper.value = supervisor;
  deleteSuper.value = true;
};

const doEditSupervisor = (supervisor) => {
  toEditSupervisor.value = supervisor;
  editSupervisor.value = true;
};

const exportExcel = () => {
  let theSupers = JSON.parse(JSON.stringify(supers.value.content));
  let arr = [];
  theSupers.forEach((item) => {
    let obj = {
      "اسم المشرف": item.supervisorName,
      "رقم المعرف": item.id,
      الحظر: item.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "مشرفين الانتاج", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(supers.value.content));
  let arr = [];
  let props = ["اسم المشرف", "رقم المعرف", "الحظر"];
  data.forEach((list) => {
    let obj = {
      "اسم المشرف": list.supervisorName,
      "رقم المعرف": list.id,
      الحظر: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "مشرفين الانتاج");
};
// Hooks
onMounted(async () => {
  await getSupers();
});
</script>

<style lang="scss">
.supervisors {
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
          padding: 6.2px 0 !important;
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
