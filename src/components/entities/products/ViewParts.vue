<template>
  <div class="view-parts">
    <v-dialog v-model="dialog" max-width="700px" persistent>
      <v-card class="pb-5 px-4 text-center" :loading="loading">
        <v-card-title class="font-weight-bold mb-2">اجزاء المنتج</v-card-title>
        <table>
          <caption
            style="
              background-color: rgb(114, 49, 116) !important;
              color: white;
              font-weight: bold;
              padding: 8px 0 10px;
              margin: 0 2px;
            "
          >
            {{
              props.toShowParts.productName
            }}
          </caption>
          <thead>
            <tr>
              <th>اسم الجزء</th>
              <th>الكمية المستخدمة</th>
              <th>صورة الجزء</th>
              <th>تكلفة الجزء</th>
            </tr>
          </thead>
          <tbody v-if="singleProduct.parts && singleProduct.parts.length">
            <tr v-for="part in singleProduct.parts" :key="part.id">
              <td>{{ part.part.partName }}</td>
              <td>
                {{
                  part.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
              <td>
                <img
                  v-if="part.part.picture"
                  width="30"
                  :src="`data:image/jpg;base64,${part.part.picture}`"
                  alt=""
                  style="border-radius: 50%"
                />
                <span v-else>لايوجد صورة</span>
              </td>
              <td>
                {{
                  part.part.currentCost
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }}
              </td>
            </tr>
          </tbody>
        </table>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="red" variant="outlined" @click="dialog = false">
            اغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { defineProps, onMounted, defineEmits, ref, watch } from "vue";
import { productModule } from "@/stores/products/products";
import { storeToRefs } from "pinia";

// Init Store
const productSt = productModule();
const { singleProduct } = storeToRefs(productSt);

// Data
const dialog = ref(false);
const loading = ref(false);

// Emits
const emits = defineEmits(["close_show"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_show");
      }, 200);
    }
  }
);

// Props
const props = defineProps(["toShowParts", "showParts"]);

// Methods
const getProductParts = async () => {
  const doGetProductParts = productSt.doGetProductParts;
  loading.value = true;
  await doGetProductParts(props.toShowParts.id);
  loading.value = false;
};

// Hooks
onMounted(async () => {
  await getProductParts();
  dialog.value = props.showParts;
});
</script>
