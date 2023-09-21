<template>
  <div class="products">
    <DataTable
      :data="products"
      :tableHeaders="tableHeaders"
      :defaultImg="null"
      :actions="actions"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :padding="2.7"
      :resetPage="resetPage"
      rowCheck="locked"
      @refresh="getProducts($event)"
      @doEditProduct="doEditProduct($event)"
      @doDeleteProduct="doDeleteProduct($event)"
      :bottomActions="bottomActions"
      @addProduct="addProduct = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getProducts({ page: 1, size: 8 })"
      @viewProductParts="viewParts($event)"
    />
    <AddProduct
      v-if="addProduct"
      @close_addproduct="addProduct = false"
      @regetData="getProducts($event)"
    />
    <EditProduct
      v-if="editProduct"
      @close_edit="editProduct = false"
      :product="toEditProduct"
      @regetData="getProducts($event)"
    />
    <DeleteProduct
      v-if="deleteProduct"
      :product="toDeleteProduct"
      @regetData="getProducts($event)"
      @close_delete="deleteProduct = false"
    />
    <ViewParts
      :toShowParts="toShowParts"
      :showParts="showParts"
      v-if="showParts"
      @close_show="(toShowParts = ''), (showParts = false)"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import AddProduct from "@/components/entities/products/AddProduct.vue";
import EditProduct from "@/components/entities/products/EditProduct.vue";
// Data Table
import DataTable from "@/components/global/DataTable.vue";
import DeleteProduct from "@/components/entities/products/DeleteProduct.vue";
import ViewParts from "@/components/entities/products/ViewParts.vue";
import { productModule } from "@/stores/products/products";
import { mainStore } from "@/stores";
import { storeToRefs } from "pinia";

// Init Store
const productSt = productModule();
const mainSt = mainStore();

// Data
const { products } = storeToRefs(productSt);
const page = ref(1);
const size = ref(8);
const resetPage = ref(false);
const addProduct = ref(false);
const editProduct = ref(false);
const toEditProduct = ref(null);
const deleteProduct = ref(false);
const toDeleteProduct = ref(null);
const tableLoading = ref(false);
const showParts = ref(false);
const toShowParts = ref("");

const tableHeaders = ref([
  {
    text: "اسم المنتج",
    value: "productName",
    type: "text",
  },
  {
    text: "سعر المنتج",
    value: "price",
    type: "number",
  },
  {
    text: "صورة المنتج",
    value: "picture",
    type: "img",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر المنتج", "حظر المنتج"],
    emit: "doDeleteProduct",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockProduct",
  },
  {
    icon: "mdi-eye",
    text: "عرض اجزاء المنتج",
    emit: "viewProductParts",
    color: "green",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات المنتج",
    emit: "doEditProduct",
    color: "blue",
    needPriv: true,
    priv: "editProduct",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة منتج جديد",
    emit: "addProduct",
    needPriv: true,
    priv: "addProduct",
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
const doEditProduct = (product) => {
  toEditProduct.value = product;
  editProduct.value = true;
};

const doDeleteProduct = (product) => {
  toDeleteProduct.value = product;
  deleteProduct.value = true;
};

const getProducts = async (data) => {
  let obj = {};
  if (data) {
    obj = data;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  const doGetAllProducts = productSt.doGetAllProducts;
  tableLoading.value = true;
  await doGetAllProducts(data);
  if (resetPage.value) {
    resetPage.value = false;
  }
  tableLoading.value = false;
};

const viewParts = (product) => {
  showParts.value = true;
  toShowParts.value = product;
};

const exportExcel = () => {
  let items = JSON.parse(JSON.stringify(products.value.content));
  let arr = [];
  items.forEach((item) => {
    let obj = {
      "اسم المنتج": item.productName,
      "سعر المنتج": item.price,
      الحظر: item.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];

  mainSt.exportExcel(arr, "المنتجات", wscols);
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(products.value.content));
  let arr = [];
  let props = ["اسم المنتج", "سعر المنتج", "الحظر"];
  data.forEach((list) => {
    let obj = {
      "اسم المنتج": list.productName,
      "سعر المنتج": list.price,
      الحظر: list.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  mainSt.printTable(arr, props, "اجزاء المنتج");
};

// Hooks
onMounted(async () => {
  await getProducts({ page: 1, size: 8 });
});
</script>

<style lang="scss">
.products {
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

    td,
    th {
      padding: 12px 0;
    }
  }
  .v-pagination__list {
    justify-content: flex-start;
  }
  .pagins_parent {
    padding: 0 10px 0 35px;
  }
}
.v-list-item__prepend > .v-icon {
  margin-inline-end: 10px !important;
}
</style>
