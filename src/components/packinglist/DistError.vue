<template>
  <div class="del-plist">
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="text-center pb-5">
        <v-card-title class="font-weight-bold">طلب غير مكتمل!</v-card-title>
        <div class="text-center">
          <v-icon
            style="
              font-size: 50px;
              color: #ff5d5d;
              padding: 10px;
              border-radius: 50%;
              border: 1px solid #ff5d5d;
              width: 70px;
              height: 70px;
            "
            >mdi-close</v-icon
          >
        </div>
        <v-card-text>{{ props.message }}</v-card-text>
        <v-card-actions>
          <div class="d-flex justify-center w-100">
            <v-btn variant="outlined" color="red" @click="dialog = false">
              اغلاق
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
const dialog = ref(false);

// Props
const props = defineProps(["message", "showValidationError"]);

// Emits
const emits = defineEmits(["close_popup"]);

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

onMounted(() => {
  dialog.value = props.showValidationError;
});
</script>
