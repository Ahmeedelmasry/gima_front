<template>
  <div class="block_user">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">{{
          props.user.locked ? "فك حظر المستخدم" : "حظر المستخدم"
        }}</v-card-title>
        <div class="text-center">
          <v-icon
            style="
              font-size: 50px;
              color: #e89e47;
              padding: 10px;
              border-radius: 50%;
              border: 1px solid #e89e47;
              width: 70px;
              height: 70px;
            "
            >mdi-alert</v-icon
          >
        </div>
        <v-card-text>
          هل تريد {{ props.user.locked ? "فك" : "تاكيد" }} حظر المستخدم
          {{ props.user.userName }} ؟
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              @click="emits('doUpdate', props.user.locked ? false : true)"
              :loading="loading"
            >
              تاكيد
            </v-btn>
            <v-btn color="red" variant="outlined" @click="dialog = false">
              الغاء
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, defineEmits } from "vue";

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["user"]);

// Emits
const emits = defineEmits(["close_window", "update_success", "doUpdate"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_window");
      }, 200);
    }
  }
);
</script>
