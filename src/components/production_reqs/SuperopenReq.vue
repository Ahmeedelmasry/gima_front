<template>
  <div class="open_req">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card
                class="pa-5"
                elevation="0"
                max-height="450"
                style="border-radius: 0; overflow-y: scroll"
              >
                <h2 class="mb-6">الاجزاء المطلوبة</h2>
                <table>
                  <thead>
                    <tr>
                      <th>اسم الجزء</th>
                      <th>اجمالي الكمية المطلوبة</th>
                      <th>الكمية المخرجة</th>
                      <th>المطلوب حاليا</th>
                      <th>الكمية المدخلة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="part in reqParts" :key="part.id">
                      <td>{{ part.part.partName }}</td>
                      <td>{{ part.requestedAmount }}</td>
                      <td>{{ part.outedAmount }}</td>
                      <td>{{ part.requestedAmount - part.outedAmount }}</td>
                      <td style="width: 25%">
                        <v-text-field
                          label="الكمية المدخلة"
                          type="number"
                          variant="outlined"
                          min="0"
                          v-model="part.enteredAmount"
                          :error-messages="part.errorMsg"
                          class="mx-5 required"
                          style="transform: translateY(10px)"
                        ></v-text-field>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
        <v-card
          class="bg-white py-3"
          style="border-radius: 0; border-top: 1px solid rgb(173, 173, 173)"
        >
          <v-card-actions class="align-center justify-center">
            <v-btn
              variant="elevated"
              @click="submitInsert"
              color="blue"
              class="ml-5"
              :disabled="totalInsertedAmount <= 0"
              >تاكيد</v-btn
            >
            <v-btn
              variant="elevated"
              @click="dialog = false"
              color="red"
              class="text-white"
              >الغاء</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, defineProps, onMounted, computed } from "vue";
import { productionReq } from "@/stores/production_request/productionReq";
import { storeToRefs } from "pinia";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";

// Init Store
const reqStore = productionReq();
const authSt = authStore();
const notifsStore = notifsModule();

// Data
const { reqParts } = storeToRefs(reqStore);
const { loggerData } = storeToRefs(authSt);
const dialog = ref(true);

// Emits
const emits = defineEmits(["close_popup", "regetItems"]);

// Props
const props = defineProps(["reqId", "storeId", "userId"]);

// Computed

const totalInsertedAmount = computed(() => {
  let counter = 0;
  if (reqParts.value && reqParts.value.length) {
    reqParts.value.forEach((part) => {
      counter += parseInt(part.enteredAmount);
    });
  }
  return counter;
});

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
const openReq = async () => {
  const doShowReqParts = reqStore.doShowReqParts;
  await doShowReqParts({ storeId: props.storeId, requestId: props.reqId });
};

const submitInsert = async () => {
  const amountRgx = /^\d+$/;
  let isValid = true;

  for (let i = 0; i < reqParts.value.length; i++) {
    const part = reqParts.value[i];
    part.errorMsg = "";
    if (!amountRgx.test(part.enteredAmount)) {
      isValid = false;
      return (part.errorMsg = "كمية غير صحيحة");
    }
    if (
      parseInt(part.enteredAmount) >
      part.requestedAmount - part.outedAmount
    ) {
      isValid = false;
      return (part.errorMsg = "الكمية المدخلة اكبر من الكمية المطلوبة حاليا");
    }
  }
  if (isValid) {
    for (let i = 0; i < reqParts.value.length; i++) {
      const part = reqParts.value[i];

      const callObj = {
        id: part.id,
        outedAmount: parseInt(part.enteredAmount),
        lastUpdatedBy: {
          id: props.userId,
        },
      };

      const doSubmitReqPartInserts = reqStore.doSubmitReqPartInserts;
      const success = await doSubmitReqPartInserts(callObj);
      if (success) {
        if (parseInt(part.enteredAmount) > 0) {
          console.log(part);

          const saveNotif = notifsStore.saveNotif;

          const notification = {
            title: `مخرجات اذن صرف ${part.productionRequest.requestID}`,
            message: `قام ${part.store.user.firstName} ${
              part.store.user.lastName
            } امين ${part.store.storeName} باخراج كمية ( ${
              part.enteredAmount
            } ) من ( ${part.part.partName} ) من مخزنه لاذن صرف ${
              part.productionRequest.requestID
            } من اصل كمية ${part.requestedAmount - part.outedAmount}, ${
              part.requestedAmount -
                (part.outedAmount + parseInt(part.enteredAmount)) ==
              0
                ? "تم اخراج الكمية المطلوبة بالكامل"
                : `متبقي كمية ${
                    part.requestedAmount -
                    (part.outedAmount + parseInt(part.enteredAmount))
                  }`
            }`,
            readBy: loggerData.value.id.toString(),
            createdBy: {
              id: loggerData.value.id,
            },
            routeName: `/production-requests`,
            privilege: "haveProductionProcess",
          };
          await saveNotif(notification);
        }
      }
    }
  }
  emits("regetItems");
  dialog.value = false;
};

// Hooks
onMounted(() => {
  openReq();
  return reqParts;
});
</script>
