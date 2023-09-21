<template>
  <div class="delete_supplier">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">{{
          props.supplier.locked ? "فك حظر المورد" : "حظر المورد"
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
          هل تريد {{ props.supplier.locked ? "فك حظر" : "تاكيد حظر" }}
          {{ props.supplier.supplierName }} ؟
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
import { suppliersModule } from "@/stores/suppliers/suppliers";

// Init Store
const store = suppliersModule();

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["supplier"]);

// Emits
const emits = defineEmits(["close_delete", "regetSuppliers"]);

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
const doUpdateSupplier = store.doUpdateSupplier;

const deleteSupplier = async () => {
  loading.value = true;
  const supplier = props.supplier;
  supplier.locked = props.supplier.locked ? false : true;
  const updateSupp = await doUpdateSupplier(supplier);
  if (updateSupp) {
    emits("regetSuppliers");
  }
  loading.value = false;
  dialog.value = false;
};
</script>
