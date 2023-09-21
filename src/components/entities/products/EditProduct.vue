<template>
  <div class="update_product">
    <v-dialog v-model="dialog" max-width="900px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent>
          <div class="d-flex justify-space-between">
            <v-card-title class="font-weight-bold">تعديل المنتج</v-card-title>
            <v-icon
              color="red"
              size="25"
              class="pa-7"
              style="cursor: pointer"
              @click="dialog = false"
              >mdi-close</v-icon
            >
          </div>

          <v-card-text>
            <v-container class="pb-0">
              <v-card-text class="my-0 pt-0 pr-0"
                ><h4>بيانات المنتج</h4></v-card-text
              >
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="اسم المنتج"
                    v-model="productData.name"
                    :error-messages="errs.name"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-file-input
                    accept="image/*"
                    label="صورة المنتج"
                    variant="outlined"
                    @update:modelValue="uploadPic"
                    prepend-icon="mdi-camera"
                    :error-messages="errs.image"
                  ></v-file-input>
                </v-col>
                <v-col cols="12 pt-0">
                  <v-card-text class="my-0 pt-0 pr-0"
                    ><h4>اجزاء المنتج</h4></v-card-text
                  >
                  <div class="chips_parent d-flex justify-space-between mb-2">
                    <div
                      class="chips"
                      v-if="productData.pieces && productData.pieces.length"
                    >
                      <v-chip
                        class="ma-2"
                        label
                        v-for="(piece, index) in productData.pieces"
                        :key="piece.id"
                        variant="outlined"
                        color="blue"
                      >
                        {{ piece.part.partName }} - عدد: {{ piece.amount }}
                        <v-icon
                          style="
                            font-size: 13px;
                            border-radius: 50%;
                            margin-right: 8px;
                            margin-top: 2px;
                            color: indianred;
                          "
                          @click="deletePiece(index)"
                          >mdi-close</v-icon
                        >
                      </v-chip>
                    </div>
                    <v-btn
                      color="rgb(60 22 68)"
                      class="text-white pb-1"
                      @click="
                        (toggleInsertPieces = !toggleInsertPieces),
                          (errs.pieces = '')
                      "
                      v-if="!toggleInsertPieces"
                    >
                      <v-icon size="20" class="mt-1">mdi-plus</v-icon>
                      ادخال الاجزاء
                    </v-btn>
                  </div>
                  <v-card-text v-if="errs.pieces" class="text-red pt-0">
                    {{ errs.pieces }}
                  </v-card-text>
                  <v-row v-if="toggleInsertPieces">
                    <v-col cols="4">
                      <v-autocomplete
                        :items="popupParts.content"
                        variant="outlined"
                        label="القطعة"
                        item-title="partName"
                        return-object
                        v-model="selectedPiece"
                        no-data-text="لاتوجد بيانات"
                        :error-messages="errs.partName"
                      />
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        variant="outlined"
                        label="العدد"
                        type="number"
                        v-model="selectedNumber"
                        min="0"
                        :error-messages="errs.partAmount"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <div class="d-flex justify-center mt-2" style="gap: 5px">
                        <v-btn color="green" @click="addPieces()">
                          <v-icon size="20" class="mt-1">mdi-check</v-icon>

                          اضافة</v-btn
                        >
                        <v-btn
                          color="red"
                          class="text-white pb-1 mb-4"
                          @click="toggleInsertPieces = !toggleInsertPieces"
                          v-if="toggleInsertPieces"
                        >
                          <v-icon size="20" class="mt-1">mdi-close</v-icon>
                          اغلاق
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="12">
                  <v-row>
                    <v-col cols="4">
                      <v-text-field
                        variant="outlined"
                        label="تكلفة المنتج"
                        type="text"
                        :disabled="
                          !productData.pieces || !productData.pieces.length
                        "
                        readonly
                        :model-value="productCost"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        variant="outlined"
                        label="سعر المنتج"
                        type="number"
                        v-model="productData.sellingPrice"
                        :error-messages="errs.sellingCost"
                        class="required"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <div class="d-flex justify-start w-100 pr-8">
              <v-btn
                color="blue-darken-1"
                variant="outlined"
                type="button"
                @click="updateProduct"
                :loading="loading"
              >
                انشاء
              </v-btn>
              <v-btn
                type="button"
                color="red"
                variant="outlined"
                @click="dialog = false"
              >
                الغاء
              </v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, computed, onMounted, defineProps } from "vue";
import { productModule } from "@/stores/products/products";
import { partsModule } from "@/stores/parts/parts";
import { storeToRefs } from "pinia";

// Init Store
const productSt = productModule();
const partSt = partsModule();

// Data
const { popupParts } = storeToRefs(partSt);
const { singleProduct } = storeToRefs(productSt);
const dialog = ref(true);
const toggleInsertPieces = ref(false);
const loading = ref(false);

const errs = ref({
  name: "",
  image: "",
  pieces: "",
  partName: "",
  partAmount: "",
  sellingCost: "",
});

const productData = ref({
  name: "",
  image: "",
  pieces: [],
  sellingPrice: 0,
});

const selectedPiece = ref(null);
const selectedNumber = ref(0);

// Props
const props = defineProps(["product"]);

// Emits
const emits = defineEmits(["close_edit", "regetData"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_edit");
      }, 200);
    }
  }
);

// Computed
const productCost = computed(() => {
  let num = 0;
  if (productData.value.pieces && productData.value.pieces.length) {
    productData.value.pieces.map((el) => {
      num += el.amount * el.part.currentCost;
    });
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

// Methods
const getSelectParts = async () => {
  const DoGetPopupParts = partSt.DoGetPopupParts;
  await DoGetPopupParts();
};

const getProductParts = async (productId) => {
  const doGetProductParts = productSt.doGetProductParts;
  await doGetProductParts(productId);
};

const uploadPic = (e) => {
  if (!e.length) {
    productData.value.image = "";
  } else {
    productData.value.image = e[0];
  }
};

const updateProduct = async () => {
  const costRgx = /^[1-9]\d*(\.\d+)?$/;
  productData.value.productCost = productCost.value;
  errs.value = {
    name: "",
    image: "",
    pieces: "",
    partName: "",
    partAmount: "",
    sellingCost: "",
  };
  if (!productData.value.name)
    return (errs.value.name = "قم بادخال اسم المنتج");

  if (!productData.value.pieces.length) {
    return (errs.value.pieces = "قم بادخال اجزاء المنتج");
  }

  if (!costRgx.test(productData.value.sellingPrice))
    return (errs.value.sellingCost = "قم بادخال سعر المنتج");

  const callPieces = [];
  productData.value.pieces.forEach((part) => {
    let obj = {
      part: {
        id: part.part.id,
      },
      amount: parseInt(part.amount),
    };
    callPieces.push(obj);
  });
  const callData = {
    id: props.product.id,
    productName: productData.value.name,
    isLocked: props.product.locked ? true : false,
    parts: callPieces,
    picture: productData.value.image
      ? productData.value.image
      : new File([""], ""),
    price: productData.value.sellingPrice,
  };
  const doUpdateProduct = productSt.doUpdateProduct;
  loading.value = true;
  const isUpdated = await doUpdateProduct(callData);
  if (isUpdated) {
    emits("regetData", { page: 1, size: 8 });
    dialog.value = false;
  }
  loading.value = false;
};

const addPieces = () => {
  const amountRgx = /^(?!0)\d+$/;
  errs.value = {
    name: "",
    image: "",
    pieces: "",
    partName: "",
    partAmount: "",
    sellingCost: "",
  };
  if (!selectedPiece.value) return (errs.value.partName = "قم باختيار الجزء");

  const checkExists = productData.value.pieces.filter(
    (el) => el.part.id == selectedPiece.value.id
  );
  if (checkExists.length)
    return (errs.value.partName = "تم ادخال هذا الجزء من قبل");

  if (!amountRgx.test(selectedNumber.value)) {
    return (errs.value.partAmount = "قم بادخال عدد الاجزاء");
  }
  let piece = {
    amount: parseInt(selectedNumber.value),
    part: JSON.parse(JSON.stringify(selectedPiece.value)),
  };
  productData.value.pieces.push(piece);
  selectedPiece.value = null;
  selectedNumber.value = 0;
};

const deletePiece = (i) => {
  productData.value.pieces.splice(i, 1);
};

onMounted(async () => {
  await Promise.all([getSelectParts(), getProductParts(props.product.id)]);
  productData.value.pieces = singleProduct.value.parts;
  productData.value.name = props.product.productName;
});
</script>
