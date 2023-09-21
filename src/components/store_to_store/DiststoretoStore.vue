<template>
  <div class="store_to_store">
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="text-center pb-5">
        <v-card-title class="font-weight-bold">توزيع الي لمخزن</v-card-title>
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="اسم الجزء"
                type="text"
                v-model:model-value="selectedPart.part.partName"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="الكمية المتاحة"
                type="number"
                min="0"
                readonly
                v-model:model-value="selectedPart.amount"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                variant="outlined"
                label="توزيع الي"
                type="text"
                min="0"
                :readonly="storesLoading"
                :items="toStores"
                item-title="storeName"
                return-object
                :loading="storesLoading"
                v-model="selectedTo"
                :error-messages="errors.to"
                class="required"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                label="الكمية الموزعة"
                type="number"
                min="1"
                v-model="distAmount"
                :error-messages="errors.amount"
                class="required"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <div class="d-flex justify-center w-100">
            <v-btn
              variant="outlined"
              color="blue"
              class="ml-2"
              :loading="callLoading"
              @click="submitDist"
            >
              تاكيد الطلب
            </v-btn>
            <v-btn variant="outlined" color="red" @click="dialog = false">
              الغاء
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, onMounted, computed, defineProps } from "vue";
import { storesModule } from "@/stores/the_stores/theStores";
import { storeToStoreModule } from "@/stores/store_to_store/storeToStore";
import { notifsModule } from "@/stores/notifications/notifs";
import { authStore } from "@/stores/auth/auth";

import { storeToRefs } from "pinia";

// init Stores
const storesSt = storesModule();
const storeToStore = storeToStoreModule();
const notifsStore = notifsModule();
const authSt = authStore();

// Data
const { theStores } = storeToRefs(storesSt);
const { loggerData } = storeToRefs(authSt);

const stores = ref([]);
const selectedFrom = ref(null);
const selectedPart = ref(null);
const selectedTo = ref(null);
const distAmount = ref(1);
const errors = ref({
  to: "",
  amount: "",
});

const storesLoading = ref(false);
const callLoading = ref(false);
const dialog = ref(false);

// Props
const props = defineProps([
  "openPopup",
  "fromStore",
  "distPart",
  "storeId",
  "fromStoreName",
]);

// Emits
const emits = defineEmits(["close_popup", "regetData"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_popup");
      }, 200);
    }
  }
);

// Methods
const getStores = async () => {
  const dogetAllStores = storesSt.dogetAllStores;
  storesLoading.value = true;
  await dogetAllStores();
  stores.value = theStores.value.content.filter((el) => !el.locked);
  storesLoading.value = false;
};

const submitDist = async () => {
  errors.value = {
    to: "",
    amount: "",
  };
  if (!selectedTo.value) {
    return (errors.value.to = "قم باختيار المخزن المراد التوزيع اليه");
  }
  const amountRgx = /^(?!0)\d+$/;

  if (!amountRgx.test(distAmount.value)) {
    return (errors.value.amount = "قم بادخال الكمية المراد توزيعها");
  } else {
    if (distAmount.value > selectedPart.value.amount) {
      return (errors.value.amount =
        "الكمية المدخلة اكبر من الكمية المتاحه للجزء");
    }
  }
  const callObj = {
    storeFromId: parseInt(selectedFrom.value),
    storeToId: parseInt(selectedTo.value.id),
    parts: [
      {
        part: {
          id: parseInt(selectedPart.value.part.id),
        },
        amount: parseInt(distAmount.value),
      },
    ],
    statusId: 1,
    distUserId: JSON.parse(localStorage.getItem("logger")),
  };
  callLoading.value = true;
  const doConfirmDist = storeToStore.doConfirmDist;
  const callReq = await doConfirmDist(callObj);
  callLoading.value = false;
  if (callReq) {
    const saveNotif = notifsStore.saveNotif;
    const notification_1 = {
      title: "توزيع مخزني",
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بتوزيع كمية ${distAmount.value} من ${selectedPart.value.part.partName} من ${props.fromStoreName} الي ${selectedTo.value.storeName}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: `/store/admin-stores?storeId=${props.storeId}`,
      privilege: "haveStorePartsDist",
    };

    const notification_2 = {
      title: "طلب توزيع مخزني",
      message: `تم ارسال طلب توزيع بكمية ${distAmount.value} من ${selectedPart.value.part.partName} علي مخزنك`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      receiver: `${selectedTo.value.user.id}`,
      routeName: `/store/requests/store-to-store/pending/${props.storeId}/1`,
      privilege: "noPrivilige",
    };
    await Promise.all([saveNotif(notification_2), saveNotif(notification_1)]);

    emits("regetData");
    dialog.value = false;
  }
};

// Computed
const toStores = computed(() => {
  let fromStores = [];
  if (stores.value.length) {
    fromStores = stores.value.filter((el) => el.id != props.fromStore);
  }
  return fromStores;
});

// Hooks
onMounted(() => {
  getStores();
  dialog.value = props.openPopup;
  selectedFrom.value = props.fromStore;
  selectedPart.value = props.distPart;
});
</script>
