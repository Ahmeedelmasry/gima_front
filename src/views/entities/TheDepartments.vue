<template>
  <div class="departments">
    <DataTable
      :data="departments"
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
      @refresh="getDepartments($event)"
      @doEditDept="doEditDept($event)"
      @doBlockDept="doBlockDept($event)"
      @addDept="addDept = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getDepartments"
    />
    <AddDept
      v-if="addDept"
      @close_add="addDept = false"
      @regetDepts="resetPage = true"
    />
    <EditDept
      v-if="editDept"
      @close_edit="editDept = false"
      :department="toEditDept"
      @regetDepts="resetPage = true"
    />
    <DeleteDept
      v-if="deleteDept"
      :department="deletedDept"
      @close_delete="deleteDept = false"
      @regetSupers="resetPage = true"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { departmentsModule } from "@/stores/departments/departments.js";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";
import AddDept from "@/components/entities/departments/AddDept.vue";
import EditDept from "@/components/entities/departments/EditDept.vue";
import DeleteDept from "@/components/entities/departments/DeleteDept.vue";
import { onMounted } from "vue";

// Init Store
const store = departmentsModule();
const mainSt = mainStore();

// Data
const { departments } = storeToRefs(store);

const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addDept = ref(false);
const editDept = ref(false);
const toEditDept = ref(null);
const deleteDept = ref(false);
const deletedDept = ref(null);
const tableLoading = ref(false);

const tableHeaders = ref([
  {
    text: "رقم معرف",
    value: "id",
    type: "text",
  },
  {
    text: "اسم القسم",
    value: "deptName",
    type: "text",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر القسم", "حظر القسم"],
    emit: "doBlockDept",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockDepartment",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات القسم",
    emit: "doEditDept",
    color: "blue",
    needPriv: true,
    priv: "editDepartment",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة قسم جديد",
    emit: "addDept",
    needPriv: true,
    priv: "addDepartment",
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
const doGetDepartments = store.doGetDepartments;

const getDepartments = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await doGetDepartments(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const doBlockDept = (department) => {
  deletedDept.value = department;
  deleteDept.value = true;
};

const doEditDept = (dept) => {
  toEditDept.value = dept;
  editDept.value = true;
};

const exportExcel = () => {
  let theDeps = JSON.parse(JSON.stringify(departments.value.content));
  let arr = [];
  theDeps.forEach((item) => {
    let obj = {
      "اسم القسم": item.deptName,
      "رقم المعرف": item.id,
      الحظر: item.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "الاقسام", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(departments.value.content));
  let arr = [];
  let props = ["اسم القسم", "رقم المعرف", "الحظر"];
  data.forEach((list) => {
    let obj = {
      "اسم القسم": list.deptName,
      "رقم المعرف": list.id,
      الحظر: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "اقسام الانتاج");
};

// Hooks
onMounted(async () => {
  await getDepartments();
});
</script>

<style lang="scss">
.departments {
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
