<template>
  <div class="home position-relative">
    <div
      class="loading_parent"
      style="
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
      "
      v-if="loading"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        reverse
        size="50"
        v-if="loading"
      ></v-progress-circular>
    </div>
    <v-container class="px-10">
      <v-row
        class="justify-start mt-7"
        v-if="loggerData.userPrivileges.haveEntities"
      >
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-if="loggerData.userPrivileges.haveUser"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              :elevation="isHovering ? 10 : 3"
              v-bind="props"
              class="text-center users_card home_card position-relative"
              :to="{ name: 'users' }"
              :height="propss.windowHeight / 3"
              :image="usersImg"
            >
              <v-tooltip location="bottom" offset="-65" activator="parent">
                <div class="d-flex flex-column justify-center align-center">
                  <v-card-title
                    class="font-weight-bold py-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >المستخدمين</v-card-title
                  >
                  <v-card-text
                    class="font-weight-bold pb-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >{{ users.content ? users.content.length : 0 }}</v-card-text
                  >
                </div>
              </v-tooltip>
            </v-card>
          </v-hover>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-if="loggerData.userPrivileges.haveStore"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              :elevation="isHovering ? 10 : 3"
              v-bind="props"
              class="text-center store_card home_card position-relative"
              :to="{ name: 'stores' }"
              :height="propss.windowHeight / 3"
              :image="storeImg"
            >
              <v-tooltip location="bottom" offset="-65" activator="parent">
                <div class="d-flex flex-column justify-center align-center">
                  <v-card-title
                    class="font-weight-bold py-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >المخازن</v-card-title
                  >
                  <v-card-text
                    class="font-weight-bold pb-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >{{
                      theStores.content ? theStores.content.length : 0
                    }}</v-card-text
                  >
                </div>
              </v-tooltip>
            </v-card>
          </v-hover>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-if="loggerData.userPrivileges.haveSupplier"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              :elevation="isHovering ? 10 : 3"
              v-bind="props"
              class="text-center suppliers_card home_card position-relative"
              :to="{ name: 'suppliers' }"
              :height="propss.windowHeight / 3"
              :image="supplierImg"
            >
              <v-tooltip location="bottom" offset="-65" activator="parent">
                <div class="d-flex flex-column justify-center align-center">
                  <v-card-title
                    class="font-weight-bold py-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >الموردين</v-card-title
                  >
                  <v-card-text
                    class="font-weight-bold pb-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >{{
                      popupSuppliers.content ? popupSuppliers.content.length : 0
                    }}</v-card-text
                  >
                </div>
              </v-tooltip>
            </v-card>
          </v-hover>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-if="loggerData.userPrivileges.havePart"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 10 : 3"
              class="text-center parts_card home_card position-relative"
              :to="{ name: 'pieces' }"
              :height="propss.windowHeight / 3"
            >
              <template v-slot:image>
                <img
                  :src="partsImg"
                  class="w-100 height-100"
                  style="object-fit: contain"
                  alt=""
                />
              </template>
              <v-tooltip location="bottom" offset="-65" activator="parent">
                <div class="d-flex flex-column justify-center align-center">
                  <v-card-title
                    class="font-weight-bold py-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >اجزاء المنتج</v-card-title
                  >
                  <v-card-text
                    class="font-weight-bold pb-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >{{
                      theParts.content ? theParts.content.length : 0
                    }}</v-card-text
                  >
                </div>
              </v-tooltip>
            </v-card>
          </v-hover>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-if="loggerData.userPrivileges.haveProduct"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              :elevation="isHovering ? 10 : 3"
              class="text-center products_card home_card position-relative"
              :to="{ name: 'completeProducts' }"
              :height="propss.windowHeight / 3"
              :image="productImg"
              v-bind="props"
            >
              <v-tooltip location="bottom" offset="-65" activator="parent">
                <div class="d-flex flex-column justify-center align-center">
                  <v-card-title
                    class="font-weight-bold py-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >المنتجات</v-card-title
                  >
                  <v-card-text
                    class="font-weight-bold pb-0"
                    style="font-size: 17px; text-shadow: 1px 1px black"
                    >{{
                      products.content ? products.content.length : 0
                    }}</v-card-text
                  >
                </div>
              </v-tooltip>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          <v-card
            elevation="0"
            :height="windowHeight - 130"
            class="d-flex align-center justify-center text-center"
          >
            <div>
              <v-card-title style="font-size: 30px">{{
                `مرحبا ${loggerData.firstName} ${loggerData.lastName}`
              }}</v-card-title>
              <v-card-text style="font-size: 19px" class="mt-5"
                >قم باختيار الصفحة المطلوب الوصول اليها من خلال القائمة
                الجانبية</v-card-text
              >
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import { addUserStore } from "@/stores/users/users";
import { storesModule } from "@/stores/the_stores/theStores";
import { suppliersModule } from "@/stores/suppliers/suppliers";
import { partsModule } from "@/stores/parts/parts";
import { authStore } from "@/stores/auth/auth";
import { productModule } from "@/stores/products/products";
import { storeToRefs } from "pinia";
import router from "@/router";

// Init Stores
const usersSt = addUserStore();
const storesSt = storesModule();
const suppliersSt = suppliersModule();
const partsSt = partsModule();
const authSt = authStore();
const productSt = productModule();
const storeImg = require("@/assets/stores-img.jpg");
const supplierImg = require("@/assets/suppliers-img.jpg");
const usersImg = require("@/assets/users-img.jpg");
const partsImg = require("@/assets/parts-img.jpg");
const productImg = require("@/assets/prodcut-img-2.webp");

// Data
const { users } = storeToRefs(usersSt);
const { theStores } = storeToRefs(storesSt);
const { popupSuppliers } = storeToRefs(suppliersSt);
const { theParts } = storeToRefs(partsSt);
const { loggerData } = storeToRefs(authSt);
const { products } = storeToRefs(productSt);

const loading = ref(false);

// Props
const propss = defineProps(["windowHeight"]);

// Methods
const getUsers = async () => {
  const doGetAllUsers = usersSt.doGetAllUsers;
  await doGetAllUsers();
};
const getStores = async () => {
  const dogetAllStores = storesSt.dogetAllStores;
  await dogetAllStores();
};
const getSuppliers = async () => {
  const doGetPopupSuppliers = suppliersSt.doGetPopupSuppliers;
  await doGetPopupSuppliers();
};
const getParts = async () => {
  const doGetAllParts = partsSt.doGetAllParts;
  await doGetAllParts();
};
const getProducts = async () => {
  const doGetAllProducts = productSt.doGetAllProducts;
  await doGetAllProducts();
};

// Hooks
onMounted(async () => {
  if (loggerData.value && loggerData.value.role.id == 3) {
    return router.replace({
      name: "viewStore",
      params: { storeId: loggerData.value.storeId, statusId: 1 },
    });
  }
  loading.value = true;
  await Promise.all([
    getUsers(),
    getStores(),
    getSuppliers(),
    getParts(),
    getProducts(),
  ]);
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.home_card {
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
