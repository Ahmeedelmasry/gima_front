<template>
  <div class="add_harmed">
    <v-dialog v-model="dialog" max-width="600" height="500">
      <v-container class="bg-white" style="overflow-y: auto">
        <v-card
          elevation="0"
          class="px-5 pb-5"
          max-width="1000"
          height="1000"
          style="overflow-y: auto"
        >
          <v-card-title class="px-0 mb-2">ادخال هوالك</v-card-title>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                :items="allBillIds"
                label="رقم الفاتورة"
                variant="outlined"
                class="required"
                no-data-text="لايوجد بيانات"
                v-model="billId"
                style="height: 46px"
                @update:model-value="getListParts"
                :disabled="!allBillIds.length"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                :items="harmSelectedPlistParts"
                item-title="partName"
                return-object
                label="الاجزاء"
                multiple
                chips
                variant="outlined"
                no-data-text="لايوجد بيانات"
                class="required"
                v-model="selectedParts"
                :disabled="!harmSelectedPlistParts.length || !billId"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" v-if="selectedParts.length">
              <table class="w-100">
                <thead>
                  <tr>
                    <th>اسم الجزء</th>
                    <th>كمية الهوالك</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="part in selectedParts" :key="part.id">
                    <td>{{ part.partName }}</td>
                    <td class="px-5" style="width: 40%">
                      <v-text-field
                        variant="outlined"
                        label="عدد الهوالك"
                        type="number"
                        v-model="part.harmedAmountInserted"
                        :error-messages="part.errMsg"
                        min="0"
                        class="required"
                        style="margin-bottom: -10px"
                      ></v-text-field>
                    </td>
                  </tr>
                </tbody>
              </table>

              <v-card class="mt-5" variant="text">
                <v-card-actions class="justify-center d-flex" style="gap: 10px">
                  <v-btn
                    @click="submitReq"
                    :loading="loading"
                    color="blue"
                    variant="elevated"
                    :disabled="!selectedParts.length"
                    >تاكيد الادخال</v-btn
                  >
                  <v-btn @click="dialog = false" color="red" variant="elevated"
                    >الغاء</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
        <v-divider length="100%" color="black"></v-divider>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, defineEmits } from "vue";
import { productionReturns } from "@/stores/production_request/productionReturns";
import { storeToRefs } from "pinia";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";
import { pListModule } from "@/stores/packingList/packingList";

// Init Stores
const productionStore = productionReturns();
const authSt = authStore();
const notifsStore = notifsModule();
const pListsStore = pListModule();

// Data
const dialog = ref(false);
const loading = ref(false);
const selectedParts = ref([]);
const { loggerData } = storeToRefs(authSt);
const { allBillIds, harmSelectedPlistParts } = storeToRefs(pListsStore);
const billId = ref("");

// Props
const props = defineProps(["openPopup", "userId"]);
// Emits
const emits = defineEmits(["close_popup"]);

// Watchers
watch(
  () => dialog.value,
  () => {
    if (!dialog.value) {
      setTimeout(() => {
        emits("close_popup");
      }, 200);
    }
  }
);

// Methods
// const getParts = async () => {
//   const DoGetPopupParts = partStore.DoGetPopupParts;
//   await DoGetPopupParts();
// };

const submitReq = async () => {
  const callArray = [];
  for (let i = 0; i < selectedParts.value.length; i++) {
    const part = selectedParts.value[i];
    const amountRgx = /^(?!0)\d+$/;

    part.errMsg = "";

    if (!amountRgx.test(parseInt(part.harmedAmountInserted))) {
      return (part.errMsg = "كمية الهوالك غير صحيحة");
    }
    callArray.push({
      part: {
        id: part.id,
      },
      createdBy: {
        id: props.userId,
      },
      billId: billId.value,
      amount: parseInt(part.harmedAmountInserted),
    });
  }
  const doSubmitHarmedParts = productionStore.doSubmitHarmedParts;
  loading.value = true;

  const success = await doSubmitHarmedParts(callArray);

  loading.value = false;
  if (success) {
    for (let i = 0; i < selectedParts.value.length; i++) {
      const part = selectedParts.value[i];
      const saveNotif = notifsStore.saveNotif;
      const notification = {
        title: "ادخال هوالك",
        message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بادخال كمية هوالك ${part.harmedAmountInserted} من ${part.partName}`,
        readBy: loggerData.value.id.toString(),
        createdBy: {
          id: loggerData.value.id,
        },
        routeName: `/parts/get-harmed`,
        privilege: "haveReports",
      };

      await saveNotif(notification);
    }
    dialog.value = false;
  }
};

const getBillIds = async () => {
  const getAllPlistsIds = pListsStore.getAllPlistsIds;
  await getAllPlistsIds();
  console.log(allBillIds.value);
};
const getListParts = async () => {
  const getSelectedPlistParts = pListsStore.getSelectedPlistParts;
  await getSelectedPlistParts(billId.value);
};

// Hooks
onMounted(async () => {
  dialog.value = props.openPopup;
  await getBillIds();
});
</script>
