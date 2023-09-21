<template>
  <div class="suppliers">
    <DataTable
      :data="suppliers"
      :tableHeaders="tableHeaders"
      :actions="actions"
      :windowHeight="windowHeight"
      :defaultImg="null"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :resetPage="resetPage"
      :padding="7.3"
      rowCheck="locked"
      @refresh="getSuppliers($event)"
      @doEditSupplier="doEditSupplier($event)"
      @doDeleteSupplier="doDeleteSupplier($event)"
      :bottomActions="bottomActions"
      @addSupplier="addSupplier = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getSuppliers"
    />
    <AddSupplier
      v-if="addSupplier"
      @close_add="addSupplier = false"
      @regetSuppliers="resetPage = true"
    />
    <EditSupplier
      v-if="editSupplier"
      @close_edit="editSupplier = false"
      :supplier="toEditSupplier"
      @regetSuppliers="resetPage = true"
    />
    <DeleteSupplier
      v-if="deleteSupplier"
      :supplier="deletedSupplier"
      @close_delete="deleteSupplier = false"
      @regetSuppliers="resetPage = true"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import { suppliersModule } from "@/stores/suppliers/suppliers";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";
import AddSupplier from "@/components/entities/suppliers/AddSupplier.vue";
import EditSupplier from "@/components/entities/suppliers/EditSupplier.vue";
import DeleteSupplier from "@/components/entities/suppliers/DeleteSupplier.vue";
import { onMounted } from "vue";

// Init Store
const store = suppliersModule();
const mainSt = mainStore();

// Data
const { suppliers } = storeToRefs(store);

const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addSupplier = ref(false);
const editSupplier = ref(false);
const toEditSupplier = ref(null);
const deleteSupplier = ref(false);
const deletedSupplier = ref(null);
const tableLoading = ref(false);

const tableHeaders = ref([
  {
    text: "اسم المورد",
    value: "supplierName",
    type: "text",
  },
  {
    text: "رقم الهاتف",
    value: "phone",
    type: "text",
  },
  {
    text: "ملاحظات",
    value: "notes",
    type: "text",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر المورد", "حظر المورد"],
    emit: "doDeleteSupplier",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockSupplier",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات المورد",
    emit: "doEditSupplier",
    color: "blue",
    needPriv: true,
    priv: "editSupplier",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة مورد جديد",
    emit: "addSupplier",
    needPriv: true,
    priv: "addSupplier",
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
const doGetSuppliers = store.doGetSuppliers;

const getSuppliers = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await doGetSuppliers(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const doDeleteSupplier = (supplier) => {
  deletedSupplier.value = supplier;
  deleteSupplier.value = true;
};

const doEditSupplier = (supplier) => {
  toEditSupplier.value = supplier;
  editSupplier.value = true;
};

const exportExcel = () => {
  let theSuppliers = JSON.parse(JSON.stringify(suppliers.value.content));
  let arr = [];
  theSuppliers.forEach((supplier) => {
    let obj = {
      "اسم المورد": supplier.supplierName,
      "رقم الهاتف": supplier.phone,
      ملاحظات: supplier.notes,
      الحظر: supplier.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "الموردين", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(suppliers.value.content));
  let arr = [];
  let props = ["اسم المورد", "رقم الهاتف", "ملاحظات", "الحظر"];
  data.forEach((list) => {
    let obj = {
      "اسم المورد": list.supplierName,
      "رقم الهاتف": list.phone,
      ملاحظات: list.notes,
      الحظر: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "الموردين");
};
// Hooks
onMounted(async () => {
  await getSuppliers();
});
</script>

<style lang="scss">
.suppliers {
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
