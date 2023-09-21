<template>
  <div class="delete_supplier">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">{{
          props.supervisor.locked ? "فك حظر المشرف" : "حظر المشرف"
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
          هل تريد {{ props.supervisor.locked ? "فك حظر" : "تاكيد حظر" }}
          {{ props.supervisor.supervisorName }} ؟
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              @click="deleteSupplier"
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
import { supersModule } from "@/stores/production_supers/productionSupers.js";

// Init Store
const store = supersModule();

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["supervisor"]);

// Emits
const emits = defineEmits(["close_delete", "regetSupers"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_delete");
      }, 200);
    }
  }
);

// Methods
const doUpdateSupervisor = store.doUpdateSupervisor;

const deleteSupplier = async () => {
  loading.value = true;
  const supervisor = props.supervisor;
  supervisor.locked = props.supervisor.locked ? false : true;
  const updateSupp = await doUpdateSupervisor(supervisor);
  if (updateSupp) {
    emits("regetSupers");
  }
  loading.value = false;
  dialog.value = false;
};
</script>
