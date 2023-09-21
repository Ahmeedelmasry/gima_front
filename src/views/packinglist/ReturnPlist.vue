<template>
  <div class="return_list">
    <v-container>
      <v-row v-if="!loading && singleList.parts">
        <v-col cols="12">
          <v-card class="pa-4">
            <v-card-title class="my-3">الاجزاء المسجلة بالفاتورة</v-card-title>
            <table style="width: 100%">
              <thead>
                <tr>
                  <th>
                    <v-checkbox
                      @change="selectAll"
                      :disabled="checkRemaining == 0"
                    >
                      <v-tooltip activator="parent" location="bottom">{{
                        selectedPieces.length == singleList.parts.length
                          ? "الغاء تحديد الكل"
                          : "تحديد الكل"
                      }}</v-tooltip>
                    </v-checkbox>
                  </th>
                  <th>اسم الجزء</th>
                  <th>كمية متاحة للارجاع</th>
                  <th>صورة الجزء</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(part, i) in singleList.parts" :key="i">
                  <td style="width: 55px">
                    <v-checkbox
                      v-model="selectedPieces"
                      :value="part"
                      :disabled="part.amountAfterReturn <= 0"
                    ></v-checkbox>
                  </td>
                  <td>{{ part.part.partName }}</td>
                  <td>
                    {{ part.amountAfterReturn }}
                  </td>
                  <td>
                    <img
                      :src="`data:image/jpg;base64,${part.part.picture}`"
                      alt=""
                      width="40"
                      style="border-radius: 50%"
                      v-if="part.part.picture"
                    />
                    <span v-else>لايوجد</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </v-card>
        </v-col>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            @click="getRelatedStores"
            color="green"
            class="font-weight-bold pb-1"
            :disabled="!selectedPieces.length"
            >عرض النتائج</v-btn
          >
        </v-col>
        <v-col cols="12" v-if="showReturnedParts">
          <v-card-title
            v-if="selectedPieces.length"
            class="text-start justify-start mb-3"
            >الاجزاء المختارة للارجاع</v-card-title
          >
          <v-card
            class="pa-4 mb-5"
            v-if="selectedPieces.length"
            :loading="btnLoading"
          >
            <v-tabs v-model="tab">
              <v-tab
                v-for="part in selectedPieces"
                :key="part.part.partName"
                :value="part.part.partName"
                center-active
                direction="vertical"
                class="font-weight-bold px-4"
                color="blue"
                >{{ part.part.partName }}</v-tab
              >
            </v-tabs>
            <v-window v-model="tab" class="mt-6">
              <v-window-item
                v-for="part in selectedPieces"
                :key="part.part.partName"
                :value="part.part.partName"
              >
                <v-row>
                  <v-col cols="5">
                    <v-select
                      v-model="part.selectedStores"
                      :items="part.stores"
                      item-title="store.storeName"
                      item-value="id"
                      return-object
                      multiple
                      variant="outlined"
                      chips
                      label="اختر المخازن"
                      no-data-text="لاتوجد بيانات"
                    />
                  </v-col>
                  <v-col
                    cols="7"
                    v-if="part.selectedStores && part.selectedStores.length"
                  >
                    <p
                      class="w-75"
                      v-if="part.stores && part.stores.length"
                      style="
                        width: 100% !important;
                        border: 1px solid rgb(194, 194, 194);
                        padding: 9px;
                        border-bottom: none;
                        text-align: center;
                        font-weight: bold;
                      "
                    >
                      كمية متاحة للارجاع: {{ part.amountAfterReturn }}
                    </p>
                    <ul style="list-style: none">
                      <div
                        class="d-flex justify-sm-space-between align-center pl-8"
                        style="
                          border: 1px solid #c2c2c2;
                          padding: 11px 5px 15px 3px;
                        "
                      >
                        <li class="pr-5 font-weight-bold">اسم المخزن</li>
                        <li class="pr-5 font-weight-bold">الكمية بالمخزن</li>
                        <li class="font-weight-bold">كمية الارجاع</li>
                      </div>
                      <li
                        v-for="st in part.selectedStores"
                        :key="`${part.id}${st.id}`"
                        class="d-flex pt-4 px-7 justify-space-between"
                        style="
                          border: 1px solid #c2c2c2;
                          border-top: unset !important;
                          padding: 5px 5px 0 5px;
                        "
                      >
                        <p class="mt-3" style="width: 33.333%">
                          {{ st.store.storeName }}
                        </p>
                        <v-text-field
                          :class="`item-${part.part.id}-${st.id}`"
                          label="الكمية بالمخزن"
                          type="number"
                          variant="outlined"
                          :model-value="st.amount"
                          style="width: 80px"
                          readonly
                        ></v-text-field>
                        <v-text-field
                          :class="`mr-5 item-${st.id}-${part.part.id}`"
                          label="كمية الارجاع"
                          type="number"
                          variant="outlined"
                          min="0"
                          v-model="st.returnedAmount"
                          style="width: 80px"
                        ></v-text-field>
                      </li>
                    </ul>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
        <v-col cols="12" class="text-center">
          <v-btn
            @click="submitDist"
            color="blue"
            class="font-weight-bold pb-1"
            :disabled="btnLoading"
            v-if="showReturnedParts"
            >تاكيد الارجاع</v-btn
          >
          <v-btn
            color="red"
            class="mr-4 font-weight-bold pb-1"
            @click="(selectedPieces = []), (showReturnedParts = false)"
            v-if="showReturnedParts"
            >الغاء</v-btn
          >
        </v-col>
      </v-row>
      <div
        class="loading_parent"
        style="
          position: fixed;
          right: 50px;
          top: 50px;
          width: 100%;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: white;
          height: 100%;
        "
        v-else
      >
        <v-progress-circular
          color="primary"
          indeterminate
          reverse
          size="50"
        ></v-progress-circular>
      </div>
    </v-container>
    <DistError
      v-if="showValidationError"
      :showValidationError="showValidationError"
      :message="validationMsg"
      @close_popup="(showValidationError = false), (validationMsg = '')"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { pListModule } from "@/stores/packingList/packingList";
import { storesModule } from "@/stores/the_stores/theStores";
import { mainStore } from "@/stores";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";

import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

// Components
import DistError from "@/components/packinglist/DistError.vue";

// Init Store
const store = pListModule();
const storesSt = storesModule();
const mainSt = mainStore();
const authSt = authStore();
const notifsStore = notifsModule();

// Init route
const route = useRoute();

// Data
const { singleList } = storeToRefs(store);
const { theStores } = storeToRefs(storesSt);
const { loggerData } = storeToRefs(authSt);

const selectedPieces = ref([]);
const loading = ref(false);
const showReturnedParts = ref(false);
const btnLoading = ref(false);
const showValidationError = ref(false);
const validationMsg = ref("");
const tab = ref(null);

// Watchers
watch(
  () => selectedPieces.value.length,
  (newVal) => {
    if (!newVal) {
      showReturnedParts.value = false;
    }
    if (showReturnedParts.value) {
      showReturnedParts.value = false;
    }
  },
  { deep: true }
);

// Computed
const checkTotalReturned = computed(() => {
  let totalReturned = 0;
  if (selectedPieces.value.length) {
    for (let i = 0; i < selectedPieces.value.length; i++) {
      if (selectedPieces.value[i].selectedStores) {
        for (
          let j = 0;
          j < selectedPieces.value[i].selectedStores.length;
          j++
        ) {
          if (
            parseInt(selectedPieces.value[i].selectedStores[j].returnedAmount)
          ) {
            totalReturned += parseInt(
              selectedPieces.value[i].selectedStores[j].returnedAmount
            );
          }
        }
      }
    }
  }
  return totalReturned;
});

const checkRemaining = computed(() => {
  let remaining = 0;
  if (theStores.value.content) {
    singleList.value.parts.forEach(
      (pt) => (remaining += parseInt(pt.amountAfterReturn))
    );
  }
  return remaining;
});

// Methods
const getData = async () => {
  const doGetSingleList = store.doGetSingleList;
  await doGetSingleList(route.params.plistId);
};
const getStores = async () => {
  const dogetAllStores = storesSt.dogetAllStores;
  await dogetAllStores();
};

const selectAll = (e) => {
  if (e.target.checked) {
    selectedPieces.value = singleList.value.parts.filter(
      (pt) => pt.amountAfterReturn != 0
    );
  } else {
    selectedPieces.value = [];
  }
};

const getRelatedStores = async () => {
  if (selectedPieces.value.length) {
    selectedPieces.value.map((part) => {
      delete part.selectedStores;
    });
  }
  showReturnedParts.value = false;
  const doGetStoreByPart = storesSt.doGetStoreByPart;
  for (let i = 0; i < selectedPieces.value.length; i++) {
    const apiCall = await doGetStoreByPart(selectedPieces.value[i].part.id);
    if (!apiCall) {
      return;
    }
    selectedPieces.value[i].stores = apiCall;
  }
  showReturnedParts.value = true;
};

const submitDist = async () => {
  validationMsg.value = "";
  let isValid;
  for (let i = 0; i < selectedPieces.value.length; i++) {
    let totalReturned = 0;
    if (selectedPieces.value[i].selectedStores) {
      for (let j = 0; j < selectedPieces.value[i].selectedStores.length; j++) {
        totalReturned += parseInt(
          selectedPieces.value[i].selectedStores[j].returnedAmount
        );
        if (
          selectedPieces.value[i].selectedStores[j].amount <
          parseInt(selectedPieces.value[i].selectedStores[j].returnedAmount)
        ) {
          isValid = false;
          validationMsg.value = `الكمية المرجعة من ${selectedPieces.value[i].selectedStores[j].part.partName} اكبر من الكمية المتاحة ب ${selectedPieces.value[i].stores[j].store.storeName}`;
          showValidationError.value = true;
          break;
        } else if (
          !selectedPieces.value[i].selectedStores[j].returnedAmount ||
          selectedPieces.value[i].selectedStores[j].returnedAmount <= 0
        ) {
          isValid = false;
          validationMsg.value = `${selectedPieces.value[i].part.partName} لم يتم ادخال كمية الارجاع له`;
          showValidationError.value = true;
          return;
        } else {
          isValid = true;
        }
      }
    } else {
      isValid = false;
      validationMsg.value = `${selectedPieces.value[i].part.partName} لم يتم ادخال بياناته للارجاع`;
      showValidationError.value = true;
      return;
    }
    if (totalReturned > selectedPieces.value[i].amountAfterReturn) {
      isValid = false;
      validationMsg.value = `الكمية المرجعة من الجزء ${selectedPieces.value[i].part.partName} اكبر من الكمية المتاحة للارجاع`;
      showValidationError.value = true;
      return;
    }
    if (!isValid) return;
    if (checkTotalReturned.value <= 0) {
      isValid = false;
      validationMsg.value = `لم يتم ادخال اي ارجاعات`;
      showValidationError.value = true;
      return;
    }
  }
  if (!isValid) return;
  const callData = {
    supplyProcess: {
      id: parseInt(route.params.plistId),
    },
    createdBy: {
      id: parseInt(localStorage.getItem("logger")),
    },
    creationDate: new Date(),
    parts: [],
  };
  selectedPieces.value.map((part) => {
    const obj = {
      part: {
        id: part.part.id,
      },
      amountIncoming: parseInt(part.amount),
      amountReturn: 0,
      storeAmounts: [],
    };
    part.selectedStores.map((st) => {
      console.log(st);
      obj.amountReturn += parseInt(st.returnedAmount);
      let storeObj = {
        store: {
          id: st.store.id,
        },
        amount: parseInt(st.returnedAmount),
      };
      obj.storeAmounts.push(storeObj);
    });
    callData.parts.push(obj);
  });
  const doSubmitReturns = store.doSubmitReturns;
  btnLoading.value = true;
  const success = await doSubmitReturns(callData);
  if (success) {
    const saveNotif = notifsStore.saveNotif;
    for (let i = 0; i < selectedPieces.value.length; i++) {
      let part = selectedPieces.value[i];
      for (let j = 0; j < part.selectedStores.length; j++) {
        const theStore = part.selectedStores[j];
        const returnedNum = parseInt(theStore.returnedAmount);
        const partName = theStore.part.partName;
        const storeName = theStore.store.storeName;

        const notification = {
          title: `ارجاع فاتورة توريد رقم ${route.params.billId}`,
          message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بارجاع كمية ${returnedNum} من ${partName} وسحبهم من ${storeName}`,
          readBy: loggerData.value.id.toString(),
          createdBy: {
            id: loggerData.value.id,
          },
          routeName: "/packing-lists",
          privilege: "addProductionProcess",
        };

        await saveNotif(notification);
      }
    }
    await getData();
    const showAlert = mainSt.showAlert;
    showAlert({ type: 1, msg: "تم الارجاع بنجاح" });
  }
  selectedPieces.value = [];
  showReturnedParts.value = false;
  btnLoading.value = false;
};

// Hooks
onMounted(async () => {
  loading.value = true;
  await Promise.all([getStores(), getData()]);
  loading.value = false;
});
</script>

<style lang="scss">
table .v-selection-control.v-checkbox-btn {
  justify-content: center;
  align-items: center;
  margin-bottom: -25px !important;
}
.dis_lists {
  td {
    padding: 0px 0px !important;
    font-size: 14px !important;
  }
  th {
    padding: 0px 0px !important;
    font-size: 14px !important;
  }
}
.v-expansion-panel-title {
  padding: 30px 20px;
}
</style>
