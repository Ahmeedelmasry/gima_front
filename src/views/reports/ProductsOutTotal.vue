<template>
  <div class="products-export">
    <div
      class="table_parent bg-white mb-0"
      :style="`height: ${windowHeight - 150}px; overflow: scroll`"
    >
      <v-container fluid class="mt-4">
        <table class="w-100 text-center" v-if="soldTotal && !tableLoading">
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الكمية المطلوب تصنيعها</th>
              <th>الكمية المباعة</th>
              <th>عجز / زيادة</th>
              <th>اتخاذ اجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ soldTotal.product.productName }}</td>
              <td>
                {{
                  soldTotal.amountRequested
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                {{
                  soldTotal.amountOut
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td
                :style="`color: ${
                  soldTotal.amountOut - soldTotal.amountRequested > 0
                    ? '#fa8e21'
                    : soldTotal.amountOut - soldTotal.amountRequested < 0
                    ? 'red'
                    : '#14ad2d'
                }`"
              >
                {{
                  (soldTotal.amountOut - soldTotal.amountRequested)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                <v-icon id="actionsMenu" color="blue" style="cursor: pointer"
                  >mdi-dots-vertical</v-icon
                >
                <v-menu activator="#actionsMenu" offset="15">
                  <v-list class="pa-2" elevation="3">
                    <v-list-item
                      @click="
                        (productToViewParts = soldTotal),
                          (extraMinus =
                            soldTotal.amountOut - soldTotal.amountRequested)
                      "
                    >
                      <v-list-item-title>
                        <v-icon color="green" class="ml-3">mdi-eye</v-icon>
                        عرض الاجزاء
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!soldTotal && !tableLoading"
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
      </v-container>
      <v-menu activator="#sup-dist-activator">
        <v-list elevation="3">
          <v-list-item
            prepend-icon="mdi-printer"
            @click="printData"
            v-if="soldTotal"
          >
            <v-list-item-title>طباعة الجدول</v-list-item-title>
          </v-list-item>
          <v-list-item
            prepend-icon="mdi-download"
            @click="exportExcel"
            v-if="soldTotal"
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
    </div>
    <ViewUsedParts
      :production="productToViewParts"
      v-if="productToViewParts"
      @close_popup="productToViewParts = ''"
      type="total"
      :extraMinus="extraMinus"
    />
    <SearchLists
      :openSearch="openSearch"
      v-if="openSearch"
      @closePopup="openSearch = false"
      @doGetSearchedLists="searchClick($event)"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { storeToRefs } from "pinia";
import ViewUsedParts from "@/components/products_export/ViewUsedParts.vue";
import SearchLists from "@/components/products_export/SearchTotalSold.vue";

import { productsExport } from "../../stores/products_export/productsExport";
import { mainStore } from "@/stores";

// Init Store
const exportStore = productsExport();
const mainSt = mainStore();

// Data
const { soldTotal } = storeToRefs(exportStore);

const page = ref(1);
const size = ref(7);
const tableLoading = ref(false);
const resetPage = ref(false);
const openSearch = ref(false);
const fromDate = ref("");
const toDate = ref("");
const productToViewParts = ref("");
const extraMinus = ref("");
const productId = ref(null);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetSearch = async (data) => {
  const doGetSoldProductsInTotal = exportStore.doGetSoldProductsInTotal;
  let obj = {
    fromDate: fromDate.value,
    toDate: toDate.value,
    productId: productId.value,
  };
  if (data) {
    obj.size = data.size;
    obj.page = data.page;
  } else {
    obj.size = size.value;
    obj.page = page.value;
  }
  if (resetPage.value) {
    resetPage.value = false;
  }
  tableLoading.value = true;
  await doGetSoldProductsInTotal(obj);
  tableLoading.value = false;
};

const searchClick = async (data) => {
  fromDate.value = data.fromDate;
  toDate.value = data.toDate;
  productId.value = data.productId;
  doGetSearch();
};

const exportExcel = () => {
  let reqs = JSON.parse(JSON.stringify(soldTotal.value));
  let arr = [];
  let obj = {
    "اسم المنتج": reqs.product.productName,
    "الكمية المطلوب تصنيعها": reqs.amountRequested,
    "الكمية المباعة": reqs.amountOut,
    "عجز / زيادة": reqs.amountOut - reqs.amountRequested,
  };
  arr.push(obj);
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(
    arr,
    `تقرير مجمع لبيع ${reqs.product.productName}`,
    wscols
  );
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(soldTotal.value));
  let arr = [];
  let props = [
    "اسم المنتج",
    "الكمية المطلوب تصنيعها",
    "الكمية المباعة",
    "عجز / زيادة",
  ];
  let obj = {
    "اسم المنتج": data.product.productName,
    "الكمية المطلوب تصنيعها": data.amountRequested,
    "الكمية المباعة": data.amountOut,
    "عجز / زيادة": data.amountOut - data.amountRequested,
  };
  arr.push(obj);
  mainSt.printTable(arr, props, `تقرير مجمع لبيع ${data.product.productName}`);
};
</script>

<style lang="scss">
.products-export {
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
          padding: 6px 0 !important;
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
