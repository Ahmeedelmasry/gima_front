<template>
  <div class="add_supplier">
    <v-dialog v-model="dialog" max-width="400px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="updateUser">
          <v-card-title class="font-weight-bold"
            >تعديل بيانات القسم</v-card-title
          >
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="اسم القسم"
                    v-model="departmentData.deptName"
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
              <v-btn
                color="blue-darken-1"
                variant="outlined"
                type="submit"
                :loading="loading"
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
import { departmentsModule } from "@/stores/departments/departments.js";

// Init Store
const store = departmentsModule();

// doUpdateStore

// Data
const dialog = ref(true);
const loading = ref(false);

const errs = ref({
  deptName: "",
});

const departmentData = ref({});

// Props
const props = defineProps(["department"]);

// Emits
const emits = defineEmits(["close_edit", "regetDepts"]);

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
const doUpdateDepartment = store.doUpdateDepartment;

const updateUser = async () => {
  errs.value = {
    deptName: "",
  };
  if (!departmentData.value.deptName) {
    return (errs.value.deptName = "قم بادخال اسم القسم");
  }

  loading.value = true;
  const req = await doUpdateDepartment(departmentData.value);
  if (req) {
    emits("regetDepts");
    dialog.value = false;
  }
  loading.value = false;
};

// Hooks
onMounted(async () => {
  departmentData.value = JSON.parse(JSON.stringify(props.department));
});
</script>
