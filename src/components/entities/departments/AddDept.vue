<template>
  <div class="add_store">
    <v-dialog v-model="dialog" max-width="400px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="addDept">
          <v-card-title class="font-weight-bold">اضافة قسم جديد</v-card-title>
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="اسم القسم"
                    v-model="deptData.deptName"
                    :error-messages="errs.deptName"
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
import { departmentsModule } from "@/stores/departments/departments.js";

// Init Store
const store = departmentsModule();
const dialog = ref(true);
const loading = ref(false);

const errs = ref({
  deptName: "",
});

const deptData = ref({
  deptName: "",
  locked: false,
});

// Emits
const emits = defineEmits(["close_add", "regetDepts"]);

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
const doAddDepartment = store.doAddDepartment;

const addDept = async () => {
  errs.value = {
    deptName: "",
  };
  if (!deptData.value.deptName) {
    return (errs.value.deptName = "قم بادخال اسم القسم");
  }
  loading.value = true;
  const isAdded = await doAddDepartment(deptData.value);
  if (isAdded) {
    emits("regetDepts");
    dialog.value = false;
  }
  loading.value = false;
};
</script>
