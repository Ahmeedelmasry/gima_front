<template>
  <div class="edit-plist-part">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="text-center pb-5">
        <v-card-title class="font-weight-bold">تعديل بيانات الجزء</v-card-title>
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="اسم الجزء"
                type="text"
                min="0"
                :model-value="listPart.cost ? listPart.part.partName : ''"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="عدد الاجزاء"
                type="number"
                min="0"
                v-model="listPart.amount"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="التكلفة"
                type="number"
                min="0"
                v-model="listPart.cost"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="اجمالي التكلفة"
                type="text"
                min="0"
                :model-value="listPart.cost * listPart.amount"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <div class="d-flex justify-center w-100">
            <v-btn
              variant="outlined"
              color="blue"
              class="ml-2"
              :loading="btnLoading"
              @click="updatePart"
            >
              تعديل
            </v-btn>
            <v-btn variant="outlined" color="red" @click="dialog = false">
              الغاء
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps, onMounted } from "vue";

// Data
const dialog = ref(true);
const btnLoading = ref(false);
const listPart = ref({});

// Props
const props = defineProps(["list_part"]);

// Emits
const emits = defineEmits(["close_popup", "confirmUpdate"]);

// Watchers
watch(
  () => dialog.value,
  () => {
    setTimeout(() => {
      emits("close_popup");
    }, 200);
  }
);

// Methods
const updatePart = async () => {
  emits("confirmUpdate", listPart.value);
  dialog.value = false;
};

// Hooks
onMounted(() => {
  listPart.value = props.list_part;
});
</script>
