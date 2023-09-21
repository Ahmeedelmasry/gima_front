<template>
  <div class="add_piece">
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent>
          <v-card-title class="font-weight-bold"
            >تعديل بيانات قطعة</v-card-title
          >
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="اسم القطعة"
                    v-model="pieceData.partName"
                    :error-messages="errs.label"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    type="number"
                    label="تكلفة القطعة"
                    v-model="pieceData.currentCost"
                    :error-messages="errs.cost"
                    class="required"
                    min="1"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    type="number"
                    min="1"
                    label="الحد الادني"
                    v-model="pieceData.minAmount"
                    :error-messages="errs.minAmount"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-file-input
                    accept="image/*"
                    label="صورة القطعة"
                    @update:modelValue="uploadPic"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    :error-messages="errs.img"
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
                :loading="loading"
                @click="updatePart"
              >
                حفظ
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
import { ref, defineEmits, watch, onMounted, defineProps } from "vue";
import { partsModule } from "@/stores/parts/parts";

// Init Store
const store = partsModule();

// Data
const dialog = ref(true);
const errs = ref({
  label: "",
  cost: "",
  img: "",
  minAmount: "",
});
const pieceData = ref({
  partName: "",
  currentCost: "",
  imgFile: "",
  minAmount: null,
  isLocked: false,
});
const loading = ref(false);

// Props
const props = defineProps(["part"]);

// Emits
const emits = defineEmits(["close_edit", "regetParts"]);

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

// Methods
const doUpdatePart = store.doUpdatePart;

const uploadPic = (e) => {
  if (!e.length) {
    pieceData.value.imgFile = "";
  } else {
    pieceData.value.imgFile = e[0];
  }
};

const updatePart = async () => {
  errs.value = {
    label: "",
    cost: "",
    img: "",
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
  if (!pieceData.value.minAmount || parseInt(pieceData.value.minAmount) < 1) {
    return (errs.value.minAmount = "قم بادخال الحد الادني للكمية المتوفرة");
  }

  loading.value = true;
  props.part.locked
    ? (pieceData.value.isLocked = true)
    : (pieceData.value.isLocked = false);
  const success = await doUpdatePart(pieceData.value);
  loading.value = false;
  if (success) {
    emits("regetParts");
    dialog.value = false;
  }
};

// Hooks
onMounted(() => {
  for (let val of Object.entries(props.part)) {
    pieceData.value[val[0]] = val[1];
  }
});
</script>
