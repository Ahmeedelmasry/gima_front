<template>
  <div class="add_store">
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent="updateUser">
          <v-card-title class="font-weight-bold"
            >تعديل بيانات المخزن</v-card-title
          >
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    label="اسم المخزن"
                    v-model="storeData.storeName"
                    :error-messages="errs.storeName"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    :items="supervisors"
                    variant="outlined"
                    label="مسؤول المخزن"
                    v-model="storeData.user.id"
                    item-title="userName"
                    :error-messages="errs.supervisor"
                    item-value="id"
                    :loading="selectLoading"
                    no-data-text="لاتوجد بيانات"
                    class="required"
                  />
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
import { storesModule } from "@/stores/the_stores/theStores";
import { storeToRefs } from "pinia";

// Init Store
const store = storesModule();

// doUpdateStore

// Data
const { supervisors } = storeToRefs(store);

const dialog = ref(true);
const loading = ref(false);
const selectLoading = ref(false);

const errs = ref({
  storeName: "",
  supervisor: "",
});

const storeData = ref({
  storeName: "",
  user: {
    id: "",
  },
});

// Props
const props = defineProps(["store"]);

// Emits
const emits = defineEmits(["close_edit", "reGetStores"]);

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
const doUpdateStore = store.doUpdateStore;
const doGetSupervisors = store.doGetSupervisors;

const updateUser = async () => {
  errs.value = {
    storeName: "",
    supervisor: "",
  };
  if (!storeData.value.storeName) {
    return (errs.value.storeName = "قم بادخال اسم المخزن");
  }
  if (!storeData.value.user.id) {
    return (errs.value.supervisor = "قم باختيار امين المخزن");
  }
  loading.value = true;
  const req = await doUpdateStore(storeData.value);
  if (req) {
    emits("reGetStores");
    dialog.value = false;
  }
  loading.value = false;
};

// Hooks
onMounted(async () => {
  for (let val of Object.entries(props.store)) {
    storeData.value[val[0]] = val[1];
  }
  selectLoading.value = true;
  await doGetSupervisors();
  selectLoading.value = false;
});
</script>
