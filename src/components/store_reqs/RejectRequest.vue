<template>
  <div class="search_requests mt-5">
    <v-dialog max-width="500" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pb-5 px-5 text-center" elevation="2">
                <v-card-title>رفض الطلب</v-card-title>
                <v-card-text>قم بتوضيح سبب رفضك للطلب</v-card-text>
                <v-textarea
                  no-resize
                  variant="outlined"
                  v-model="notes"
                  rows="2"
                  :error-messages="noteErr"
                  class="mb-2 required"
                ></v-textarea>
                <v-btn @click="rejectReq" color="blue">تاكيد</v-btn>
                <v-btn class="mr-3" color="red" @click="dialog = false"
                  >الغاء</v-btn
                >
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
import { storeRequests } from "@/stores/store_requests/storeRequests";
import { authStore } from "@/stores/auth/auth";
import { storeToRefs } from "pinia";
import { notifsModule } from "@/stores/notifications/notifs";

// Init Store
const storeReqs = storeRequests();
const authSt = authStore();
const notifsStore = notifsModule();

// Data
const btnLoading = ref(false);
const dialog = ref(false);
const notes = ref("");
const { loggerData } = storeToRefs(authSt);
const noteErr = ref("");

// Emits
const emits = defineEmits(["doGetSearchedLists", "closePopup"]);

// Props
const props = defineProps(["openReject", "rejectedId", "rejectedFullData"]);

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
const rejectReq = async () => {
  noteErr.value = "";
  if (!notes.value) return (noteErr.value = "قم بكتابة سبب رفضك للطلب");
  const doRejectRequest = storeReqs.doRejectRequest;
  const rejectReq = await doRejectRequest({
    userId: loggerData.value.id,
    requestId: props.rejectedId,
    notes: notes.value,
  });
  if (rejectReq) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: `طلب توزيع فاتورة توريد رقم ${props.rejectedFullData.supplyProcessPart.supplyProcess.billId}`,
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} امين ${props.rejectedFullData.store.storeName} برفض طلب توزيع كمية ${props.rejectedFullData.amount} من ${props.rejectedFullData.supplyProcessPart.part.partName}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: `/store/admin-requests?statusId=3&storeId=${props.rejectedFullData.store.id}`,
      privilege: "haveReports",
    };
    await saveNotif(notification);

    emits("doGetSearchedLists", {
      fromDate: "",
      toDate: "",
      partId: "",
    });
  }
  btnLoading.value = true;
  setTimeout(() => {
    dialog.value = false;
  }, 200);
};

// Hooks
onMounted(async () => {
  dialog.value = props.openReject;
});
</script>
