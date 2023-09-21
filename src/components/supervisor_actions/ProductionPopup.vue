<template>
  <div class="search_requests mt-5">
    <v-dialog max-width="900" v-model="dialog" persistent max-height="500">
      <v-container fluid style="overflow-y: auto" class="bg-white">
        <v-card elevation="0">
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">اذن صرف</h2>
                <v-row>
                  <v-col cols="5">
                    <v-autocomplete
                      no-data-text="لاتوجد بيانات"
                      item-title="productName"
                      item-value="id"
                      variant="outlined"
                      label="اختر المنتج"
                      :items="popupProducts"
                      v-model="selectedProduct"
                      :readonly="selectLoading"
                      :error-messages="errs.product"
                      @update:model-value="productParts = ''"
                    />
                  </v-col>
                  <v-col cols="5">
                    <v-text-field
                      no-data-text="لاتوجد بيانات"
                      item-title="partName"
                      item-value="id"
                      variant="outlined"
                      label="الكمية المتوقعة للانتاج"
                      type="number"
                      min="1"
                      v-model="amount"
                      :error-messages="errs.amount"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-btn
                      type="submit"
                      variant="outlined"
                      class="mt-1"
                      color="green"
                      @click="getProductDetails"
                      :loading="btnLoading"
                      >طلب</v-btn
                    >
                  </v-col>
                  <v-col cols="12" class="py-0" v-if="productParts.length">
                    <h3 class="mb-3">بيانات اذن الصرف</h3>
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          variant="outlined"
                          label="رقم الاذن"
                          v-model="reqId"
                          :error-messages="errs.reqId"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <v-autocomplete
                          variant="outlined"
                          label="اسم المشرف"
                          no-data-text="لاتوجد بيانات"
                          :items="popupSupers"
                          item-title="supervisorName"
                          item-value="id"
                          v-model="superId"
                          :error-messages="errs.super"
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-autocomplete
                          variant="outlined"
                          label="اسم القسم"
                          :items="popupDeps"
                          item-title="deptName"
                          item-value="id"
                          v-model="depId"
                          no-data-text="لاتوجد بيانات"
                          :error-messages="errs.dep"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col
                    cols="12"
                    v-if="productDetailsErr"
                    class="pt-0"
                    style="margin-top: -20px; color: #a92929; font-size: 14px"
                  >
                    <p>{{ productDetailsErr }}</p>
                  </v-col>
                  <v-col cols="12" class="py-0" v-if="productParts.length">
                    <v-card
                      class="px-4 py-0 mb-5"
                      elevation="0"
                      :loading="btnLoading"
                    >
                      <v-tabs v-model="tab">
                        <v-tab
                          v-for="part in productParts"
                          :key="part.part.partName"
                          :value="part.part.id"
                          center-active
                          direction="vertical"
                          class="font-weight-bold px-4"
                          color="blue"
                          >{{ part.part.partName }}</v-tab
                        >
                      </v-tabs>
                      <v-window v-model="tab" class="mt-6">
                        <v-window-item
                          v-for="part in productParts"
                          :key="part.part.partName"
                          :value="part.part.id"
                        >
                          <v-row>
                            <v-col cols="5">
                              <v-autocomplete
                                :items="part.stores"
                                item-title="store.storeName"
                                v-model="part.selectedStores"
                                return-object
                                multiple
                                variant="outlined"
                                chips
                                label="اختر المخازن"
                                :error-messages="part.errMsg"
                              />
                            </v-col>
                            <v-col
                              cols="7"
                              v-if="
                                part.selectedStores &&
                                part.selectedStores.length
                              "
                            >
                              <p
                                class="w-75"
                                style="
                                  width: 100% !important;
                                  border: 1px solid rgb(194, 194, 194);
                                  padding: 9px;
                                  border-bottom: none;
                                  text-align: center;
                                  font-weight: bold;
                                "
                              >
                                الكمية المطلوبة: {{ part.requestedAmount }}
                              </p>
                              <ul style="list-style: none">
                                <div
                                  class="d-flex justify-sm-space-between align-center"
                                  style="
                                    border: 1px solid #c2c2c2;
                                    padding: 11px 5px 15px 3px;
                                  "
                                >
                                  <li
                                    class="pr-5 font-weight-bold"
                                    style="font-size: 13px"
                                  >
                                    اسم المخزن
                                  </li>
                                  <li
                                    class="pr-5 font-weight-bold"
                                    style="font-size: 13px"
                                  >
                                    الكمية المتاحة
                                  </li>
                                  <li
                                    class="font-weight-bold pl-7"
                                    style="font-size: 13px"
                                  >
                                    الكمية المخرجة
                                  </li>
                                </div>
                                <li
                                  v-for="st in part.selectedStores"
                                  :key="`${part.part.id}${st.id}`"
                                  class="d-flex pt-4 px-7 justify-space-between"
                                  style="
                                    border: 1px solid #c2c2c2;
                                    border-top: unset !important;
                                    padding: 5px 5px 0 5px;
                                    position: relative;
                                  "
                                >
                                  <p class="w-75 mt-3">
                                    {{ st.store.storeName }}
                                  </p>
                                  <v-text-field
                                    label="المتاح"
                                    type="number"
                                    variant="outlined"
                                    :model-value="st.amount"
                                    disabled
                                  ></v-text-field>
                                  <v-text-field
                                    label="المخرج"
                                    type="number"
                                    variant="outlined"
                                    v-model="st.selectedAmount"
                                    :error-messages="st.errorMsg"
                                    class="mr-5"
                                  ></v-text-field>
                                </li>
                              </ul>
                            </v-col>
                          </v-row>
                        </v-window-item>
                      </v-window>
                    </v-card>
                  </v-col>
                  <v-col
                    cols="12"
                    class="pt-0"
                    style="margin-top: -20px; color: #a92929; font-size: 14px"
                  >
                    <p>{{ submitErr }}</p>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-btn
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3"
                      color="rgb(114, 49, 116)"
                      variant="outlined"
                      @click="submitRequest"
                      :loading="saveLoading"
                      v-if="productParts.length"
                      >حفظ</v-btn
                    >
                    <v-btn
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3 mr-3"
                      color="red"
                      variant="outlined"
                      :disabled="saveLoading"
                      @click="dialog = false"
                      >الغاء</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits, defineProps } from "vue";
import { productModule } from "@/stores/products/products.js";
import { productionReq } from "@/stores/production_request/productionReq.js";
import { departmentsModule } from "@/stores/departments/departments.js";
import { supersModule } from "@/stores/production_supers/productionSupers.js";
import { authStore } from "@/stores/auth/auth.js";
import { storeToRefs } from "pinia";
import { notifsModule } from "@/stores/notifications/notifs";

// Init Stores
const productsSt = productModule();
const productionStore = productionReq();
const authSt = authStore();
const depSt = departmentsModule();
const supersMod = supersModule();
const notifsStore = notifsModule();

// Data
const dialog = ref(false);
const btnLoading = ref(false);
const saveLoading = ref(false);
const selectLoading = ref(false);
const tab = ref("");
const amount = ref(1);
const selectedProduct = ref("");
const reqId = ref("");
const superId = ref("");
const depId = ref("");

const errs = ref({
  product: "",
  amount: "",
  reqId: "",
  super: "",
  dep: "",
});

const { popupProducts } = storeToRefs(productsSt);
const { productDetailsErr, submitErr, productParts } =
  storeToRefs(productionStore);
const { loggerData } = storeToRefs(authSt);
const { popupDeps } = storeToRefs(depSt);
const { popupSupers } = storeToRefs(supersMod);

// Methods
const getProducts = async () => {
  const doGetPopupProducts = productsSt.doGetPopupProducts;
  await doGetPopupProducts();
};

const getProductDetails = async () => {
  errs.value = {
    product: "",
    amount: "",
    reqId: "",
    super: "",
    dep: "",
  };

  const amountRgx = /^(?!0)\d+$/;

  if (!selectedProduct.value) return (errs.value.product = "قم باختيار المنتج");
  if (!amountRgx.test(amount.value)) {
    return (errs.value.amount = "قم بادخال الكمية بطريقة صحيحة");
  }
  btnLoading.value = true;
  const doGetProductDetails = productionStore.doGetProductDetails;
  const callData = {
    amount: amount.value,
    productId: selectedProduct.value,
  };
  await doGetProductDetails(callData);
  btnLoading.value = false;
};

const getDpts = async () => {
  const doGetPopupDeps = depSt.doGetPopupDeps;
  await doGetPopupDeps();
};

const getSupers = async () => {
  const doGetPopupSupers = supersMod.doGetPopupSupers;
  await doGetPopupSupers();
};

const submitRequest = async () => {
  errs.value = {
    product: "",
    amount: "",
    reqId: "",
    super: "",
    dep: "",
  };
  if (!reqId.value) return (errs.value.reqId = "قم بادخال رقم الاذن");
  if (!superId.value) return (errs.value.super = "قم بادخال رقم الاذن");
  if (!depId.value) return (errs.value.dep = "قم بادخال رقم الاذن");

  for (let i = 0; i < productParts.value.length; i++) {
    let singlePart = productParts.value[i];
    singlePart.errMsg = "";
    if (!singlePart.selectedStores || !singlePart.selectedStores.length) {
      return (singlePart.errMsg = `قم باختيار المخازن لجزء ${singlePart.part.partName}`);
    }
    for (let j = 0; j < singlePart.selectedStores.length; j++) {
      let singleStore = singlePart.selectedStores[j];
      singleStore.errorMsg = "";
      const amountRgx = /^(?!0)\d+$/;
      if (!amountRgx.test(parseInt(singleStore.selectedAmount))) {
        return (singleStore.errorMsg = "كمية غير صحيحة");
      }
      if (parseInt(singleStore.selectedAmount) != singlePart.requestedAmount) {
        return (singleStore.errorMsg =
          "الكمية المدخلة ليست مساوية للكمية المطلوبة");
      }
      if (parseInt(singleStore.selectedAmount) > singleStore.amount) {
        return (singleStore.errorMsg =
          "الكمية المدخلة اكبر من الكمية الموجودة بالمخزن");
      }
    }
  }

  const callObj = {
    productionRequestDTO: {
      requestID: reqId.value,
      product: {
        id: parseInt(selectedProduct.value),
      },
      department: {
        id: parseInt(depId.value),
      },
      supervisor: {
        id: parseInt(superId.value),
      },
      expectedProduction: parseInt(amount.value),
      createdBy: {
        id: loggerData.value.id,
      },
      itProduct: true,
    },
    parts: [],
  };

  productParts.value.forEach((part) => {
    const partObj = {
      part: {
        id: part.part.id,
      },
      requestedAmount: part.requestedAmount,
      storeAmounts: [],
    };
    part.selectedStores.forEach((st) => {
      partObj.storeAmounts.push({
        store: {
          id: st.store.id,
        },
        amount: parseInt(st.selectedAmount),
      });
    });
    callObj.parts.push(partObj);
  });

  saveLoading.value = true;
  const doSubmitReq = productionStore.doSubmitReq;
  const isSuccess = await doSubmitReq(callObj);
  saveLoading.value = false;
  if (isSuccess) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: "اذن صرف جديد",
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بادخال اذن صرف جديد برقم ${reqId.value}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: "/production-requests",
      privilege: "haveProductionProcess",
    };

    await saveNotif(notification);
    emits("regetData");
    dialog.value = false;
  }
};

const doReset = () => {
  const resetData = productionStore.resetData;
  resetData();
};

// Props
const props = defineProps(["dialog"]);

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

// Hooks
onMounted(async () => {
  doReset();
  selectLoading.value = true;
  await Promise.all([getDpts(), getProducts(), getSupers()]);
  selectLoading.value = false;
  dialog.value = props.dialog;
});
</script>
