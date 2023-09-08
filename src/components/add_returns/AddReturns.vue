<template>
  <div class="add_returns">
    <v-dialog v-model="dialog" max-width="900">
      <v-container class="bg-white" style="overflow-y: auto">
        <v-card elevation="0" class="px-5 pb-5">
          <v-card-title class="px-0 mb-2">ادخال ارجاعات</v-card-title>
          <v-row v-if="popupParts.content">
            <v-col cols="12">
              <v-autocomplete
                :items="popupParts.content"
                item-title="partName"
                return-object
                label="الاجزاء"
                multiple
                chips
                variant="outlined"
                class="required"
                v-model="selectedParts"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" v-if="selectedParts.length">
              <v-tabs v-model="tab">
                <v-tab
                  v-for="(part, i) in selectedParts"
                  :key="part.partName"
                  :value="part.partName"
                  center-active
                  direction="vertical"
                  :class="[
                    'font-weight-bold',
                    ' px-4',
                    `${
                      part.errMsg || checkStoreErr == i
                        ? 'text-error'
                        : 'text-black'
                    }`,
                  ]"
                  :color="part.errMsg || checkStoreErr == i ? 'error' : 'blue'"
                  >{{ part.partName }}</v-tab
                >
              </v-tabs>
              <v-window v-model="tab" class="mt-6">
                <v-window-item
                  v-for="part in selectedParts"
                  :key="part.partName"
                  :value="part.partName"
                >
                  <v-row>
                    <v-col cols="5">
                      <v-select
                        v-model="part.selectedStores"
                        :items="part.stores"
                        item-title="storeName"
                        return-object
                        multiple
                        variant="outlined"
                        chips
                        label="اختر المخازن"
                        no-data-text="لاتوجد بيانات"
                        :error-messages="part.errMsg"
                      />
                    </v-col>
                    <v-col cols="7" v-if="part.selectedStores.length">
                      <ul style="list-style: none">
                        <div
                          class="d-flex justify-sm-space-between align-center pl-8"
                          style="
                            border: 1px solid #c2c2c2;
                            padding: 11px 5px 15px 3px;
                          "
                        >
                          <li class="pr-5 font-weight-bold">اسم المخزن</li>
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
                            {{ st.storeName }}
                          </p>
                          <v-text-field
                            :class="`mr-5 item-${st.id}-${part.id}`"
                            label="كمية الارجاع"
                            type="number"
                            variant="outlined"
                            min="0"
                            v-model="st.returnedAmount"
                            :error-messages="st.errMsg"
                          ></v-text-field>
                        </li>
                      </ul>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
          <v-col cols="12" class="text-center pb-0">
            <v-btn
              @click="submitReq"
              :loading="loading"
              color="blue"
              :disabled="!selectedParts.length"
              >تاكيد الادخال</v-btn
            >
            <v-btn @click="dialog = false" color="red" class="mr-5"
              >الغاء</v-btn
            >
          </v-col>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, defineEmits, computed } from "vue";
import { partsModule } from "@/stores/parts/parts";
import { productionReturns } from "@/stores/production_request/productionReturns";
import { storesModule } from "@/stores/the_stores/theStores";
import { storeToRefs } from "pinia";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";

// Init Stores
const partStore = partsModule();
const storeSt = storesModule();
const productionStore = productionReturns();
const authSt = authStore();
const notifsStore = notifsModule();

// Data
const dialog = ref(false);
const loading = ref(false);
const tab = ref("");
const selectedParts = ref([]);
const { popupParts } = storeToRefs(partStore);
const { popupStores } = storeToRefs(storeSt);
const { loggerData } = storeToRefs(authSt);

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

// Computed
const checkStoreErr = computed(() => {
  if (popupParts.value.content) {
    for (let i = 0; i < popupParts.value.content.length; i++) {
      const part = popupParts.value.content[i];
      if (part.selectedStores.length) {
        for (let j = 0; j < part.selectedStores.length; j++) {
          const store = part.selectedStores[j];
          if (store.errMsg) return i;
        }
      }
    }
  }
  return -1;
});

// Methods
const getParts = async () => {
  const DoGetPopupParts = partStore.DoGetPopupParts;
  await DoGetPopupParts();
};
const getStores = async () => {
  const doGetPopupStores = storeSt.doGetPopupStores;
  await doGetPopupStores();
};

const submitReq = async () => {
  const callArray = [];
  for (let i = 0; i < selectedParts.value.length; i++) {
    const part = selectedParts.value[i];
    part.errMsg = "";

    callArray.push({
      part: {
        id: part.id,
      },
      createdBy: {
        id: props.userId,
      },
      storeAmounts: [],
    });
    if (!part.selectedStores.length) return (part.errMsg = "قم باختيار المخزن");
    for (let j = 0; j < part.selectedStores.length; j++) {
      const store = part.selectedStores[j];
      const amountRgx = /^(?!0)\d+$/;

      store.errMsg = "";

      if (!amountRgx.test(parseInt(store.returnedAmount))) {
        return (store.errMsg = "كمية الارجاعات غير صحيحة");
      }
      callArray[i].storeAmounts.push({
        store: {
          id: store.id,
        },
        amount: parseInt(store.returnedAmount),
      });
    }
  }
  const doSubmitReturns = productionStore.doSubmitReturns;
  loading.value = true;

  const success = await doSubmitReturns(callArray);

  loading.value = false;
  if (success) {
    for (let i = 0; i < selectedParts.value.length; i++) {
      const part = selectedParts.value[i];
      for (let j = 0; j < part.selectedStores.length; j++) {
        const store = part.selectedStores[j];
        const saveNotif = notifsStore.saveNotif;
        const notification_1 = {
          title: "ادخال ارجاعات",
          message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بادخال كمية ارجاعات ${store.returnedAmount} من ${part.partName} وتحويلها الي ${store.storeName}`,
          readBy: loggerData.value.id.toString(),
          createdBy: {
            id: loggerData.value.id,
          },
          routeName: `/parts/get-returns`,
          privilege: "haveReports",
        };

        const notification_2 = {
          title: "ادخال ارجاعات",
          message: `تم ارجاع كمية ${store.returnedAmount} من ${part.partName} الي مخزنك`,
          readBy: loggerData.value.id.toString(),
          createdBy: {
            id: loggerData.value.id,
          },
          routeName: `/store/view-store`,
          privilege: "noPreviliges",
          receiver: store.user.id,
        };
        await Promise.all([
          saveNotif(notification_1),
          saveNotif(notification_2),
        ]);
      }
    }

    dialog.value = false;
  }
};

// Hooks
onMounted(async () => {
  dialog.value = props.openPopup;
  await Promise.all([getStores(), getParts()]);
  popupParts.value.content.forEach((part) => {
    part.stores = JSON.parse(JSON.stringify(popupStores.value.content));
  });
});
</script>
