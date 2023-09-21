<template>
  <div class="add_store">
    <v-dialog v-model="dialog" max-width="400px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="addNewSuper">
          <v-card-title class="font-weight-bold">اضافة مشرف جديد</v-card-title>
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="اسم المشرف"
                    v-model="superData.supervisorName"
                    :error-messages="errs.supervisorName"
                    class="required"
                  ></v-text-field>
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
import { supersModule } from "@/stores/production_supers/productionSupers.js";

// Init Store
const store = supersModule();
const dialog = ref(true);
const loading = ref(false);

const errs = ref({
  supervisorName: "",
});

const superData = ref({
  supervisorName: "",
  locked: false,
});

// Emits
const emits = defineEmits(["close_add", "regetSupers"]);

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
const doAddSuper = store.doAddSuper;

const addNewSuper = async () => {
  errs.value = {
    supervisorName: "",
  };
  if (!superData.value.supervisorName) {
    return (errs.value.supervisorName = "قم بادخال اسم المشرف");
  }
  loading.value = true;
  const isAdded = await doAddSuper(superData.value);
  if (isAdded) {
    emits("regetSupers");
    dialog.value = false;
  }
  loading.value = false;
};
</script>
