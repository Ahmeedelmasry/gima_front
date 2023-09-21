<template>
  <div class="search_lists mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">تصفية النتائج</h2>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="partId"
                      :items="popupParts.content"
                      no-data-text="لاتوجد بيانات"
                      item-title="partName"
                      item-value="id"
                      variant="outlined"
                      label="اسم الجزء"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="text"
                      variant="outlined"
                      label="رقم الفاتورة"
                      v-model="supplyProcessId"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="من"
                      v-model="FromDate"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="الي"
                      v-model="ToDate"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-btn
                      @click="getSearchedLists"
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3"
                      color="rgb(114, 49, 116)"
                      :loading="btnLoading"
                      variant="outlined"
                      >بحث</v-btn
                    >
                    <v-btn
                      @click="dialog = false"
                      size="xl"
                      class="px-8 py-2 font-weight-bold pb-3 mr-3"
                      color="red"
                      variant="outlined"
                      >الغاء</v-btn
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { partsModule } from "@/stores/parts/parts";

// Init Store
const partSt = partsModule();

// Init Router
const router = useRouter();

// Data
const { popupParts } = storeToRefs(partSt);

const partId = ref("");
const FromDate = ref("");
const ToDate = ref("");
const supplyProcessId = ref("");
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);

// Emits
const emits = defineEmits(["doGetSearchedLists", "closePopup"]);

// Props
const props = defineProps(["openSearch"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("closePopup");
      }, 200);
    }
  }
);

// Methods

const getSearchedLists = () => {
  router.push({
    name: "AdminPlistsreturns",
    query: {
      supplyProcessId: supplyProcessId.value,
      FromDate: FromDate.value,
      ToDate: ToDate.value,
      partId: partId.value,
    },
  });
  dialog.value = false;
};

const getParts = async () => {
  const DoGetPopupParts = partSt.DoGetPopupParts;
  await DoGetPopupParts();
};

// Hooks
onMounted(async () => {
  selectLoading.value = true;
  await getParts();
  if (popupParts.value.content && popupParts.value.content.length) {
    popupParts.value.content.unshift({
      partName: "",
      id: "",
    });
  }
  selectLoading.value = false;
  dialog.value = props.openSearch;
});
</script>
