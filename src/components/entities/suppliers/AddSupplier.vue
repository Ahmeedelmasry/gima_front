<template>
  <div class="add_store">
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="addNewUser">
          <v-card-title class="font-weight-bold">اضافة مورد جديد</v-card-title>
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="اسم المورد"
                    v-model="supplierData.supplierName"
                    :error-messages="errs.supplierName"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="رقم هاتف المورد"
                    v-model="supplierData.phone"
                    :error-messages="errs.phone"
                    type="number"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    variant="outlined"
                    label="ملاحظات"
                    v-model="supplierData.notes"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <div class="d-flex justify-start w-100 pr-8">
              <v-btn color="blue-darken-1" variant="outlined" type="submit">
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
import { suppliersModule } from "@/stores/suppliers/suppliers";
import { storeToRefs } from "pinia";

// Init Store
const store = suppliersModule();

// Data
const { addSupplierSuccess } = storeToRefs(store);
const dialog = ref(true);
const loading = ref(false);

const errs = ref({
  supplierName: "",
  phone: "",
});

const supplierData = ref({
  supplierName: "",
  phone: "",
  notes: "",
});

// Emits
const emits = defineEmits(["close_add", "regetSuppliers"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_add");
      }, 200);
    }
  }
);

// Methods
const doAddSupplier = store.doAddSupplier;

const addNewUser = async () => {
  errs.value = {
    supplierName: "",
    phone: "",
  };
  if (!supplierData.value.supplierName) {
    return (errs.value.supplierName = "قم بادخال اسم المورد");
  }
  if (!supplierData.value.phone) {
    return (errs.value.phone = "قم بادخال رقم هاتف المورد");
  }
  if (supplierData.value.phone.length != 11) {
    return (errs.value.phone = "رقم الهاتف يجب ان يكون 11 رقم");
  }
  loading.value = true;
  await doAddSupplier(supplierData.value);
  if (addSupplierSuccess.value) {
    emits("regetSuppliers");
    dialog.value = false;
  }
  loading.value = false;
};
</script>
