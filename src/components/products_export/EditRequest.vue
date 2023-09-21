<template>
  <div class="edit_req">
    <v-dialog v-model="dialog" max-width="800" persistent>
      <v-card>
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-card-title class="font-weight-bold mb-0 pb-0 px-0"
                >بيانات رئيسية</v-card-title
              >
            </v-col>
            <v-col cols="6">
              <v-text-field
                class="required"
                label="رقم الفاتورة"
                variant="outlined"
                v-model="billId"
                :error-messages="billIdErr"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                class="required"
                label="مسؤول المنتجات"
                variant="outlined"
                item-title="userName"
                item-value="id"
                v-model="responsible"
                :error-messages="responsibleErr"
                :items="popupSupervisors"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-text-field
                class="required"
                label="اسم السائق"
                variant="outlined"
                v-model="driver"
                :error-messages="driverErr"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                class="required"
                label="مكان التوصيل"
                variant="outlined"
                v-model="destination"
                :error-messages="destinationErr"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-card-title class="font-weight-bold mb-0 pb-0 px-0"
                >بيانات المنتجات</v-card-title
              >
            </v-col>
            <v-col cols="12">
              <v-btn
                color="rgb(60, 22, 68)"
                @click="startAddProducts = !startAddProducts"
                v-if="!startAddProducts"
                class="text-white"
              >
                <v-icon>mdi-plus</v-icon>
                اضافة منتجات</v-btn
              >
            </v-col>
            <v-col cols="5" v-if="startAddProducts">
              <v-autocomplete
                class="required"
                label="اختر المنتج"
                variant="outlined"
                :items="popupProducts"
                no-data-text="لاتوجد بيانات"
                item-title="productName"
                return-object
                :error-messages="productErr"
                v-model="selectedProduct"
              ></v-autocomplete>
            </v-col>
            <v-col cols="3" v-if="startAddProducts">
              <v-text-field
                class="required"
                label="الكمية"
                variant="outlined"
                v-model="selectedAmount"
                :error-messages="amountErr"
              ></v-text-field>
            </v-col>
            <v-col cols="3" v-if="startAddProducts">
              <v-btn color="green" class="mt-1" @click="submitSelection">
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn
                color="red"
                class="mt-1 mr-2"
                @click="startAddProducts = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="12" v-if="selectedProducts.length">
              <table class="w-100">
                <thead>
                  <tr>
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, i) in selectedProducts" :key="i">
                    <td>{{ product.product.productName }}</td>
                    <td>
                      {{
                        product.amount
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }}
                    </td>
                    <td>
                      <v-icon
                        color="red"
                        style="cursor: pointer"
                        @click="selectedProducts.splice(i, 1)"
                        >mdi-delete</v-icon
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-col>
            <v-col cols="12" v-if="selectedProducts.length">
              <v-textarea
                variant="outlined"
                label="ملاحظات"
                type="textarea"
                v-model="notes"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions class="pb-5">
          <v-btn
            @click="submitReq"
            color="rgb(60, 22, 68)"
            variant="elevated"
            class="text-white"
            :disabled="loading"
            >تاكيد الادخال</v-btn
          >
          <v-btn
            @click="dialog = false"
            :disabled="loading"
            color="red"
            variant="elevated"
            >الغاء</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, onMounted, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { productModule } from "@/stores/products/products";
import { storesModule } from "@/stores/the_stores/theStores";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";
import { productsExport } from "../../stores/products_export/productsExport";

// Init Stores
const productSt = productModule();
const storeSt = storesModule();
const authSt = authStore();
const notifsStore = notifsModule();
const exportSt = productsExport();

// Data
const { popupProducts } = storeToRefs(productSt);
const { popupSupervisors } = storeToRefs(storeSt);
const { loggerData } = storeToRefs(authSt);
const { reqExportedProducts } = storeToRefs(exportSt);

const dialog = ref(true);
const billId = ref("");
const billIdErr = ref("");
const responsible = ref("");
const responsibleErr = ref("");
const driver = ref("");
const driverErr = ref("");
const destination = ref("");
const destinationErr = ref("");
const selectedProducts = ref([]);
const selectedProduct = ref("");
const productErr = ref("");
const selectedAmount = ref("");
const amountErr = ref("");
const notes = ref("");
const loading = ref(false);
const startAddProducts = ref(false);

// Props
const props = defineProps(["reqData"]);

// Emits
const emits = defineEmits(["close_popup", "regetData"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_popup");
      }, 200);
    }
  }
);

// Methods
const getProducts = async () => {
  const doGetPopupProducts = productSt.doGetPopupProducts;
  await doGetPopupProducts();
};
const getSupervisors = async () => {
  const doGetPopupSupers = storeSt.doGetPopupSupers;
  await doGetPopupSupers();
};

const submitSelection = () => {
  productErr.value = "";
  amountErr.value = "";

  const amountRgx = /^(?!0)\d+$/;

  if (!selectedProduct.value) return (productErr.value = "قم باختيار المنتج");

  if (!amountRgx.test(selectedAmount.value))
    return (amountErr.value = "قم بادخال الكمية");

  for (let i = 0; i < selectedProducts.value.length; i++) {
    if (selectedProducts.value[i].product.id === selectedProduct.value.id)
      return (productErr.value = "هذا المنتج تم اختياره بالفعل");
  }

  selectedProducts.value.push({
    product: selectedProduct.value,
    amount: parseInt(selectedAmount.value),
  });

  // reset Data
  selectedProduct.value = "";
  selectedAmount.value = "";
};

const submitReq = async () => {
  billIdErr.value = "";
  responsibleErr.value = "";
  driverErr.value = "";
  destinationErr.value = "";
  productErr.value = "";

  if (!billId.value) return (billIdErr.value = "قم بادخال رقم الفاتورة");
  if (!responsible.value) return (responsibleErr.value = "قم باختيار المسؤول");
  if (!driver.value) return (driverErr.value = "قم بادخال اسم السائق");
  if (!destination.value)
    return (destinationErr.value = "قم بادخال اسم مكان التوصيل");
  if (!selectedProducts.value.length)
    return (productErr.value = "قم بادخال المنتجات");

  const callData = {
    id: props.reqData.id,
    destinationName: destination.value,
    driverName: driver.value,
    note: notes.value,
    createdBy: {
      id: loggerData.value.id,
    },
    responsibleBy: {
      id: parseInt(responsible.value),
    },
    requestId: billId.value,
    productAmounts: [],
  };
  selectedProducts.value.forEach((product) => {
    const obj = {
      product: {
        id: product.product.id,
      },
      amount: product.amount,
    };
    callData.productAmounts.push(obj);
  });

  const doUpdateExportingReq = exportSt.doUpdateExportingReq;

  loading.value = true;
  const isUpdated = await doUpdateExportingReq(callData);
  loading.value = false;
  if (isUpdated) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: `تعديل اذن بيع رقم ${billId.value}`,
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بتعديل اذن بيع برقم ${billId.value}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: `/products/products-exporting`,
      privilege: "editProductOut",
    };

    await saveNotif(notification);
    emits("regetData");
    dialog.value = false;
  }
};

// Hooks
onMounted(async () => {
  const doGetReqExportedProducts = exportSt.doGetReqExportedProducts;
  await Promise.all([
    getSupervisors(),
    getProducts(),
    doGetReqExportedProducts(props.reqData.id),
  ]);
  destination.value = props.reqData.destinationName;
  responsible.value = props.reqData.responsibleBy.id;
  driver.value = props.reqData.driverName;
  notes.value = props.reqData.note;
  billId.value = props.reqData.requestId;

  reqExportedProducts.value.forEach((product) => {
    const obj = {
      amount: product.amount,
      product: product.product,
    };
    selectedProducts.value.push(obj);
  });
});
</script>
