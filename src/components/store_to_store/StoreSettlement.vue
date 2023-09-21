<template>
  <div class="settle_store mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pb-5 px-5 text-center" elevation="2">
                <v-card-title>تسوية المخزن</v-card-title>
                <v-card
                  elevation="0"
                  max-height="400"
                  style="overflow-y: auto"
                  class="mt-4"
                >
                  <table class="w-100">
                    <thead>
                      <tr>
                        <th>اسم الجزء</th>
                        <th>الكمية الدفترية</th>
                        <th>الكمية الفعلية</th>
                        <th>عجز / زيادة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="part in singleStore.content" :key="part.id">
                        <td>{{ part.part.partName }}</td>
                        <td>{{ part.amount }}</td>
                        <td class="pa-4">
                          <input
                            type="number"
                            style="
                              text-align: center;
                              border: 1px solid rgb(156, 156, 156);
                              outline: none;
                              padding: 4px 0;
                              border-radius: 3px;
                            "
                            v-model="part.currentAmount"
                          />
                        </td>
                        <td
                          :style="`color: ${
                            part.currentAmount - part.amount > 0
                              ? 'orange'
                              : part.currentAmount - part.amount == 0
                              ? 'green'
                              : 'red'
                          }`"
                        >
                          {{ part.currentAmount - part.amount }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-card>
                <v-card-actions class="mt-5">
                  <v-btn
                    @click="submitSettle"
                    :loading="loading"
                    color="blue"
                    variant="elevated"
                    >تاكيد</v-btn
                  >
                  <v-btn
                    @click="dialog = false"
                    :disabled="loading"
                    variant="elevated"
                    color="red"
                    >الغاء</v-btn
                  >
                </v-card-actions>
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
import { storesModule } from "@/stores/the_stores/theStores";
import { authStore } from "@/stores/auth/auth";
import { notifsModule } from "@/stores/notifications/notifs";
import { storeToRefs } from "pinia";

// Init Store
const storeModule = storesModule();
const authModule = authStore();
const notifsStore = notifsModule();

// Data
const dialog = ref(false);
const loading = ref(false);
const { singleStore } = storeToRefs(storeModule);
const { loggerData } = storeToRefs(authModule);

// Emits
const emits = defineEmits(["doGetSearchedLists", "closePopup"]);

// Props
const props = defineProps(["openPopup", "storeId", "storeName"]);

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

const submitSettle = async () => {
  const callObj = {
    store: {
      id: props.storeId,
    },
    createdBy: {
      id: loggerData.value.id,
    },
    creationDate: new Date(),
    parts: [],
  };
  singleStore.value.content.map((el) => {
    const obj = {
      part: {
        id: el.part.id,
      },
      amountPrevious: el.amount,
      amountUpdate: el.currentAmount,
      amountDiff: el.currentAmount - el.amount,
    };
    callObj.parts.push(obj);
  });
  const doSettleStore = storeModule.doSettleStore;
  loading.value = true;
  const success = await doSettleStore(callObj);
  loading.value = false;
  if (success) {
    for (let i = 0; i < singleStore.value.content.length; i++) {
      let singlePart = singleStore.value.content[i];
      const saveNotif = notifsStore.saveNotif;
      const notification = {
        title: "تسوية مخزن",
        message: `قام ${loggerData.value.firstName} ${
          loggerData.value.lastName
        } بتسوية المخزن ${props.storeName} من ${
          singlePart.part.partName
        } لتصبح كميته ${singlePart.currentAmount} من اصل ${singlePart.amount} ${
          singlePart.currentAmount - singlePart.amount > 0
            ? `بزيادة ${singlePart.currentAmount - singlePart.amount}`
            : singlePart.currentAmount - singlePart.amount < 0
            ? `بعجز ${singlePart.currentAmount - singlePart.amount}`
            : ""
        }`,
        readBy: loggerData.value.id.toString(),
        createdBy: {
          id: loggerData.value.id,
        },
        routeName: `/store/admin-stores?storeId=${props.storeId}`,
        privilege: "settlementStore",
      };
      await saveNotif(notification);
    }

    emits("doGetSearchedLists");
    dialog.value = false;
  }
};

// Hooks
onMounted(async () => {
  dialog.value = props.openPopup;
});
</script>

<style lang="scss">
.settle_store {
  table {
    overflow-y: scroll;
    background-color: white;
    thead {
      font-size: 14px;
      tr {
        box-shadow: 0px 0px 3px -2px black;
      }
    }
    tbody {
      tr {
        box-shadow: 0px 0px 3px -2px black;
        th {
          padding: 10px 0 !important;
        }
        td {
          padding: 0 !important;
        }
      }
    }
  }
}
</style>
