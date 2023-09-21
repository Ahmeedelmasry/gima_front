<template>
  <div class="delete_store">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">{{
          props.part.locked ? "فك حظر الجزء" : "حظر الجزء"
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
          هل تريد {{ props.part.locked ? "فك حظر الجزء" : "تاكيد حظر" }}
          {{ props.part.partName }} ؟
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              @click="delPart(props.part)"
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
import { partsModule } from "@/stores/parts/parts";

// Init Store
const store = partsModule();

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["part"]);

// Emits
const emits = defineEmits(["close_delete"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_delete", "regetParts");
      }, 200);
    }
  }
);

// Methods
const doUpdatePart = store.doUpdatePart;

const delPart = async (part) => {
  loading.value = true;
  let partObj = part;
  partObj.isLocked = part.locked ? false : true;
  delete partObj.locked;
  const updatePrt = await doUpdatePart(partObj);
  loading.value = false;
  if (updatePrt) {
    emits("regetParts");
  }
  emits("close_delete");
};
</script>
