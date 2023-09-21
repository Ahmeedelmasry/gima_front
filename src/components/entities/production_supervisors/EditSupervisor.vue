<template>
  <div class="add_supplier">
    <v-dialog v-model="dialog" max-width="400px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="updateUser">
          <v-card-title class="font-weight-bold"
            >تعديل بيانات المشرف</v-card-title
          >
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="اسم المشرف"
                    v-model="supervisorData.supervisorName"
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
import { supersModule } from "@/stores/production_supers/productionSupers.js";

// Init Store
const store = supersModule();

// doUpdateStore

// Data
const dialog = ref(true);
const loading = ref(false);

const errs = ref({
  supervisorName: "",
});

const supervisorData = ref({});

// Props
const props = defineProps(["supervisor"]);

// Emits
const emits = defineEmits(["close_edit", "regetSupervisors"]);

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
const doUpdateSupervisor = store.doUpdateSupervisor;

const updateUser = async () => {
  errs.value = {
    supervisorName: "",
  };
  if (!supervisorData.value.supervisorName) {
    return (errs.value.supervisorName = "قم بادخال اسم المشرف");
  }

  loading.value = true;
  const req = await doUpdateSupervisor(supervisorData.value);
  if (req) {
    emits("regetSupervisors");
    dialog.value = false;
  }
  loading.value = false;
};

// Hooks
onMounted(async () => {
  supervisorData.value = JSON.parse(JSON.stringify(props.supervisor));
});
</script>
