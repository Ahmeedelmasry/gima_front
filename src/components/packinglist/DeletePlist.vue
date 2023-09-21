<template>
  <div class="del-plist">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="text-center pb-5">
        <v-card-title class="font-weight-bold">حذف الفاتورة</v-card-title>
        <div class="text-center">
          <v-icon
            style="
              font-size: 50px;
              color: #e89e47;
              padding: 10px;
              border-radius: 50%;
              border: 1px solid #e89e47;
              width: 70px;
              height: 70px;
            "
            >mdi-alert</v-icon
          >
        </div>
        <v-card-text>هل انت متاكد من حذف الفاتورة؟</v-card-text>
        <v-card-actions>
          <div class="d-flex justify-center w-100">
            <v-btn
              variant="outlined"
              color="blue"
              class="ml-2"
              :loading="btnLoading"
              @click="deleteList"
            >
              تاكيد
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
import { ref, watch, defineEmits, defineProps } from "vue";
import { pListModule } from "@/stores/packingList/packingList";
import { notifsModule } from "@/stores/notifications/notifs";
import { authStore } from "@/stores/auth/auth";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

// Init Store
const store = pListModule();
const notifsStore = notifsModule();
const authSt = authStore();

// Init Router
const router = useRouter();

// Data
const { loggerData } = storeToRefs(authSt);

const dialog = ref(true);
const btnLoading = ref(false);

// Props
const props = defineProps(["listId", "pListBillId"]);

// Emits
const emits = defineEmits(["close_popup"]);

// Watchers
watch(
  () => dialog.value,
  () => {
    setTimeout(() => {
      emits("close_popup");
    }, 200);
  }
);

// Methods
const deleteList = async () => {
  btnLoading.value = true;
  const doDeletePlist = store.doDeletePlist;
  const success = await doDeletePlist(props.listId);
  if (success) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: "حذف فاتورة توريد",
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بحذف فاتورة توريد برقم ${props.pListBillId}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: "/packing-lists",
      privilege: "editSupplierProcess",
    };
    await saveNotif(notification);

    btnLoading.value = false;
    dialog.value = false;
    setTimeout(() => {
      router.push({
        name: "pLists",
        query: {
          supplyProcessFromDate: "",
          supplyProcessToDate: "",
          supplierId: "",
          billId: "",
          page: 1,
          size: 7,
          isSearched: false,
        },
      });
    }, 1000);
  }
};
</script>
