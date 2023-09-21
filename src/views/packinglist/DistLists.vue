<template>
  <div class="dis_lists">
    <v-container>
      <v-row v-if="!loading && singleList.parts">
        <v-col cols="12">
          <v-card class="pa-4">
            <v-card-title class="my-3">الاجزاء المتاحة بالفاتورة</v-card-title>
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
                  <th>كمية التوريد</th>
                  <th>الكمية الموزعة</th>
                  <th>الكمية المتبقية</th>
                  <th>صورة الجزء</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(part, i) in singleList.parts"
                  :key="i"
                  :style="`${
                    part.fullDist
                      ? 'background: rgb(236 236 236); color: grey;'
                      : 'background: unset; color: unset;'
                  }`"
                >
                  <v-tooltip
                    v-if="part.fullDist"
                    location="bottom"
                    activator="parent"
                    >تم توزيع الكمية بالكامل</v-tooltip
                  >
                  <td style="width: 55px">
                    <v-checkbox
                      v-model="selectedPieces"
                      :value="part"
                      :disabled="part.fullDist"
                    ></v-checkbox>
                  </td>
                  <td>{{ part.part.partName }}</td>
                  <td>
                    {{
                      part.amount
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }}
                  </td>
                  <td>
                    {{
                      part.distAmount
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }}
                  </td>
                  <td>
                    {{
                      part.remainAmount
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }}
                  </td>
                  <td>
                    <img
                      :src="`data:image/jpg;base64, ${part.part.picture}`"
                      alt=""
                      width="30"
                      height="30"
                      :style="`border-radius: 50%; ${
                        part.remainAmount == 0 ? 'opacity: .7;' : 'opacity: 1;'
                      }}`"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card-title
            v-if="selectedPieces.length"
            class="text-start justify-start mb-3"
            >الاجزاء المختارة للتوزيع</v-card-title
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
                    <v-autocomplete
                      :items="filteredStores"
                      item-title="storeName"
                      item-value="id"
                      v-model="part.stores"
                      return-object
                      multiple
                      variant="outlined"
                      chips
                      label="اختر المخازن"
                    />
                  </v-col>
                  <v-col cols="7">
                    <p
                      class="w-75 mt-3"
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
                      الكمية المتاحة للتوزيع: {{ part.remainAmount }}
                    </p>
                    <ul style="list-style: none">
                      <div
                        class="d-flex justify-sm-space-between align-center"
                        style="
                          border: 1px solid #c2c2c2;
                          padding: 11px 5px 15px 3px;
                        "
                        v-if="part.stores && part.stores.length"
                      >
                        <li class="w-75 pr-5 font-weight-bold">اسم المخزن</li>
                        <li class="w-25 font-weight-bold">الكمية الموزعة</li>
                      </div>
                      <li
                        v-for="st in part.stores"
                        :key="`${part.id}${st.id}`"
                        class="d-flex pt-4 px-7"
                        style="
                          border: 1px solid #c2c2c2;
                          border-top: unset !important;
                          padding: 5px 5px 0 5px;
                        "
                      >
                        <p class="w-75 mt-3">{{ st.storeName }}</p>
                        <v-text-field
                          :class="`w-25 item-${part.part.id}-${st.id}`"
                          label="الكمية"
                          type="number"
                          variant="outlined"
                          min="1"
                          model-value="1"
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
            v-if="selectedPieces.length"
            >تاكيد التوزيع</v-btn
          >
          <v-btn
            color="red"
            class="mr-4 font-weight-bold pb-1"
            @click="router.go(-1)"
            :disabled="btnLoading"
            >عودة</v-btn
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
import { ref, onMounted, computed } from "vue";
import { pListModule } from "@/stores/packingList/packingList";
import { storesModule } from "@/stores/the_stores/theStores";
import { mainStore } from "@/stores";
import { notifsModule } from "@/stores/notifications/notifs";
import { authStore } from "@/stores/auth/auth";

import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

// Components
import DistError from "@/components/packinglist/DistError.vue";

// Init Store
const store = pListModule();
const storesSt = storesModule();
const mainSt = mainStore();
const notifsStore = notifsModule();
const authModule = authStore();

// Init route
const route = useRoute();
const router = useRouter();

// Data
const { singleList } = storeToRefs(store);
const { theStores } = storeToRefs(storesSt);
const { loggerData } = storeToRefs(authModule);
const selectedPieces = ref([]);
const loading = ref(false);
const btnLoading = ref(false);
const showValidationError = ref(false);
const validationMsg = ref("");
const tab = ref(null);

// Computed
const filteredStores = computed(() => {
  if (theStores.value.content) {
    return theStores.value.content.filter((el) => !el.locked);
  }
  return [];
});

const checkRemaining = computed(() => {
  let remaining = 0;
  if (theStores.value.content) {
    singleList.value.parts.forEach(
      (pt) => (remaining += parseInt(pt.remainAmount))
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
      (pt) => pt.remainAmount != 0
    );
  } else {
    selectedPieces.value = [];
  }
};

const submitDist = async () => {
  showValidationError.value = false;
  validationMsg.value = "";
  let isValid = true;
  // 1- Extract Data
  let filteredParts = [];
  selectedPieces.value.forEach((part) => {
    let singlePart = {
      stores: [],
    };
    for (const prop in part) {
      if (prop == "part") {
        const newPart = {};
        newPart.currentCost = part[prop].currentCost;
        newPart.id = part[prop].id;
        newPart.locked = part[prop].locked;
        newPart.partName = part[prop].partName;
        newPart.picture = part[prop].picture;
        singlePart.part = newPart;
      } else if (prop == "stores") {
        singlePart.stores = JSON.parse(JSON.stringify(part[prop]));
      } else {
        singlePart[prop] = part[prop];
      }
    }
    singlePart.stores.forEach((st) => {
      let store = st;
      const storeValue = document.querySelector(
        `.item-${part.part.id}-${st.id} .v-field .v-field__field input`
      ).value;
      store.amount = storeValue;
    });
    filteredParts.push(singlePart);
  });

  // 2- Validation
  firstLoop: for (let j = 0; j < filteredParts.length; j++) {
    // Check If Parts Has Stores
    if (!filteredParts[j].stores.length) {
      isValid = false;
      validationMsg.value = "قم باختيار المخازن المراد التوزيع اليها";
      showValidationError.value = true;
      break;
    }
    // Total dist amount
    let totalDist = 0;
    // Check if each store has valid amount
    for (let i = 0; i < filteredParts[j].stores.length; i++) {
      if (
        !filteredParts[j].stores[i].amount ||
        parseInt(filteredParts[j].stores[i].amount) <= 0
      ) {
        isValid = false;
        validationMsg.value =
          "تاكد من ادخال الكميات الموزعة علي المخازن بطريقة صحيحة";
        showValidationError.value = true;
        break firstLoop;
      }
      totalDist += parseInt(filteredParts[j].stores[i].amount);
    }
    if (filteredParts[j].remainAmount - totalDist < 0) {
      isValid = false;
      validationMsg.value = `الكمية الموزعة من ${filteredParts[j].part.partName} وهي ${totalDist} اكبر من الكمية المتبقية لهذا الجزء ${filteredParts[j].remainAmount}`;
      showValidationError.value = true;
      break;
    }
  }
  if (isValid) {
    for (let k = 0; k < filteredParts.length; k++) {
      const objectToSend = {
        supplyProcessPart: {
          id: parseInt(filteredParts[k].id),
        },
        storeRequests: [],
        distUserId: localStorage.getItem("logger"),
        statusId: 1,
      };
      filteredParts[k].stores.map((el) => {
        const stObj = {
          store: {
            id: parseInt(el.id),
          },
          amount: parseInt(el.amount),
        };
        objectToSend.storeRequests.push(stObj);
      });

      btnLoading.value = true;
      const doDistList = store.doDistList;
      const doDist = await doDistList(objectToSend);
      if (doDist) {
        await Promise.all([getStores(), getData()]);
        const showAlert = mainSt.showAlert;
        showAlert({ type: 1, msg: "تم التوزيع بنجاح" });
        for (let l = 0; l < filteredParts[k].stores.length; l++) {
          let partName = filteredParts[k].part.partName;
          let storeName = filteredParts[k].stores[l].storeName;
          let amountDist = filteredParts[k].stores[l].amount;
          let superId = filteredParts[k].stores[l].user.id;
          let storeId = filteredParts[k].stores[l].id;

          console.log(filteredParts[k]);

          const saveNotif = notifsStore.saveNotif;
          const notification_1 = {
            title: `توزيع فاتورة توريد رقم ${route.params.billId}`,
            message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بتوزيع ${amountDist} قطعة من ${partName} الي ${storeName} `,
            readBy: loggerData.value.id.toString(),
            createdBy: {
              id: loggerData.value.id,
            },
            routeName: "/packing-lists",
            privilege: "haveSupplierProcessDist",
          };
          const notification_2 = {
            title: "طلب توزيع فاتورة توريد",
            message: `تم ارسال طلب توزيع فاتورة توريد الي مخزنك بكمية ( ${amountDist} ) من ( ${partName} )`,
            readBy: loggerData.value.id.toString(),
            createdBy: {
              id: loggerData.value.id,
            },
            routeName: `/store/requests/supply-dist/pending/${storeId}/1`,
            privilege: "noPrevelige",
            receiver: parseInt(superId),
          };
          await Promise.all([
            saveNotif(notification_1),
            saveNotif(notification_2),
          ]);
        }
      }
      selectedPieces.value = [];
      btnLoading.value = false;
    }
  }
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
    padding: 0px 0 !important;
    font-size: 14px !important;
  }
  th {
    padding: 0px 0 !important;
    font-size: 14px !important;
  }
}
.v-expansion-panel-title {
  padding: 30px 20px;
}
</style>
