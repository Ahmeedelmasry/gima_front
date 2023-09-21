<template>
  <div class="search_requests mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2">
                <h2 class="mb-6">
                  {{
                    reqId == 1
                      ? "تقرير طلبات توزيع فاتورة"
                      : "تقرير طلبات مخزن لمخزن"
                  }}
                </h2>
                <v-row>
                  <v-col cols="4">
                    <v-autocomplete
                      v-model="selectedPart"
                      :items="popupParts.content"
                      no-data-text="لاتوجد بيانات"
                      item-title="partName"
                      item-value="id"
                      variant="outlined"
                      label="اسم الجزء"
                      :loading="selectLoading"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      v-model="selectedStore"
                      :items="theStores.content"
                      no-data-text="لاتوجد بيانات"
                      item-title="storeName"
                      item-value="id"
                      variant="outlined"
                      label="اسم المخزن"
                      :loading="selectLoading"
                      class="required"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="statusId"
                      :items="statusList"
                      no-data-text="لاتوجد بيانات"
                      variant="outlined"
                      label="حالة الطلب"
                      class="required"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="من"
                      v-model="fromDate"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      type="date"
                      variant="outlined"
                      label="الي"
                      v-model="toDate"
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
                      :disabled="selectLoading"
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
import { storeToRefs } from "pinia";
import { partsModule } from "@/stores/parts/parts";
import { storesModule } from "@/stores/the_stores/theStores";
import router from "@/router";

// Init Store
const partsSt = partsModule();
const storesSt = storesModule();

// Data
const { popupParts } = storeToRefs(partsSt);
const { theStores } = storeToRefs(storesSt);
const selectedPart = ref("");
const selectedStore = ref("");
const fromDate = ref("");
const toDate = ref("");
const statusId = ref(1);
const selectLoading = ref(false);
const btnLoading = ref(false);
const dialog = ref(false);

const statusList = ref([
  {
    title: "معلقة",
    value: 1,
  },
  {
    title: "مقبولة",
    value: 2,
  },
  {
    title: "مرفوضة",
    value: 3,
  },
]);

// Emits
const emits = defineEmits(["doGetSearchedLists", "closePopup"]);

// Props
const props = defineProps(["openSearch", "reqId"]);

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
const getParts = async () => {
  const DoGetPopupParts = partsSt.DoGetPopupParts;
  await DoGetPopupParts();
};
const getStores = async () => {
  const dogetAllStores = storesSt.dogetAllStores;
  await dogetAllStores();
};

const getSearchedLists = () => {
  dialog.value = false;
  if (props.reqId == 1) {
    router.push({
      name: "admineRequests",
      query: {
        fromDate: fromDate.value,
        toDate: toDate.value,
        statusId: statusId.value,
        partId: selectedPart.value,
        storeId: selectedStore.value,
      },
    });
  } else {
    router.push({
      name: "AdminToStoreReqs",
      params: { storeId: selectedStore.value },
      query: {
        fromDate: fromDate.value,
        toDate: toDate.value,
        statusId: statusId.value,
        partId: selectedPart.value,
        storeId: selectedStore.value,
      },
    });
  }
};

// Hooks
onMounted(async () => {
  dialog.value = props.openSearch;
  selectLoading.value = true;
  await Promise.all([getStores(), getParts()]);
  if (popupParts.value.content && popupParts.value.content.length) {
    popupParts.value.content.unshift({
      partName: "",
      id: "",
    });
  }
  theStores.value.content && theStores.value.content.length
    ? (selectedStore.value = theStores.value.content[0].id)
    : "";
  selectLoading.value = false;
});
</script>
