<template>
  <div class="add_store">
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent>
          <v-card-title class="font-weight-bold">اضافة جزء جديد</v-card-title>
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="اسم الجزء"
                    v-model="pieceData.partName"
                    :error-messages="errs.label"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    type="number"
                    label="تكلفة الجزء"
                    v-model="pieceData.currentCost"
                    :error-messages="errs.cost"
                    hide-spin-buttons
                    class="required"
                    min="1"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    type="number"
                    label="الحد الادني"
                    v-model="pieceData.minAmount"
                    :error-messages="errs.minAmount"
                    class="required number_input"
                    min="1"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-file-input
                    accept="image/*"
                    label="صورة الجزء"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @update:model-value="uploadPic"
                    class="required"
                  ></v-file-input>
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
                @click="addNewPart"
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
import { ref, defineEmits, watch } from "vue";
import { partsModule } from "@/stores/parts/parts";
import { storeToRefs } from "pinia";

// Init Store
const store = partsModule();
const { addPartSuccess } = storeToRefs(store);

// Data
const dialog = ref(true);

const errs = ref({
  label: "",
  cost: "",
  minAmount: "",
});

const pieceData = ref({
  partName: "",
  currentCost: 1,
  imgFile: "",
  minAmount: 1,
});

// Emits
const emits = defineEmits(["close_addpiece"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_addpiece", "regetParts");
      }, 200);
    }
  }
);

// Methods
const doAddPart = store.doAddPart;
const addPart = async (part) => {
  await doAddPart(part);
};
const uploadPic = (e) => {
  if (!e.length) {
    pieceData.value.imgFile = "";
  } else {
    pieceData.value.imgFile = e[0];
  }
};

const addNewPart = async () => {
  errs.value = {
    label: "",
    cost: "",
    minAmount: "",
  };
  const amountRgx = /^(?!0)\d+$/;
  const costRgx = /^[1-9]\d*(\.\d+)?$/;

  if (!pieceData.value.partName) {
    return (errs.value.label = "قم بادخال اسم الجزء");
  }
  if (!costRgx.test(pieceData.value.currentCost)) {
    return (errs.value.cost = "قم بادخال تكلفة الجزء بطريقة صحيحة");
  }
  if (!amountRgx.test(pieceData.value.minAmount)) {
    return (errs.value.minAmount = "قم بادخال الحد الادني للكمية المتوفرة");
  }

  await addPart(pieceData.value);
  if (addPartSuccess.value) {
    pieceData.value.imgFile = "";
    emits("regetParts");
    dialog.value = false;
  }
};
</script>
