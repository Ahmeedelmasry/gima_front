<template>
  <div class="search_lists mt-5">
    <v-dialog max-width="700" v-model="dialog">
      <v-container fluid>
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-card class="pa-5" elevation="2" :loading="cardLoading">
                <v-table v-if="!cardLoading">
                  <caption
                    style="
                      background-color: rgb(114, 49, 116) !important;
                      color: white;
                      font-weight: bold;
                      padding: 8px 0 10px;
                      margin: 0;
                    "
                  >
                    رقم الطلب:&nbsp;
                    {{
                      props.reqId
                    }}
                  </caption>
                  <thead>
                    <tr>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        اسم الجزء
                      </th>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        الكمية المطلوبة
                      </th>
                      <th
                        style="
                          color: white !important;
                          height: 0 !important;
                          padding: 5px 0 !important;
                        "
                        class="text-center"
                      >
                        الكمية المخرجة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(part, i) in singleRequestParts" :key="i">
                      <td>{{ part.part.partName }}</td>
                      <td>{{ part.requestedAmount }}</td>
                      <td>{{ part.totalAmountOut }}</td>
                    </tr>
                  </tbody>
                </v-table>
                <v-btn
                  class="mx-auto d-block mt-5"
                  color="red"
                  variant="outlined"
                  @click="dialog = false"
                  >اغلاق</v-btn
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
import { ref, defineProps, onMounted, defineEmits, watch } from "vue";
import { productionReq } from "@/stores/production_request/productionReq";
import { storeToRefs } from "pinia";

// Init Store
const productioSt = productionReq();
const { singleRequestParts } = storeToRefs(productioSt);

// Data
const dialog = ref(true);
const cardLoading = ref(false);

// Props
const props = defineProps(["reqId", "isCompleted"]);

// Emits
const emits = defineEmits(["close_popup"]);

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
const getParts = async () => {
  const doGetRequestParts = productioSt.doGetRequestParts;
  cardLoading.value = true;
  await doGetRequestParts(props.reqId);
  cardLoading.value = false;
};

// Hooks
onMounted(() => {
  getParts();
});
</script>
