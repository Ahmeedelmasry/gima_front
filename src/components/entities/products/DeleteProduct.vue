<template>
  <div class="delete_product">
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="pb-5 text-center">
        <v-card-title class="font-weight-bold">حظر المنتج</v-card-title>
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
        <v-card-text>
          هل تريد تاكيد {{ props.product.locked ? "فك حظر" : "حظر" }}
          {{ props.product.productName }} ؟
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              @click="deleteProduct(props.product)"
              :loading="loading"
            >
              تاكيد
            </v-btn>
            <v-btn color="red" variant="outlined" @click="dialog = false">
              الغاء
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, defineEmits } from "vue";
import { productModule } from "@/stores/products/products";

// Init Store
const productSt = productModule();

// Data
const dialog = ref(true);
const loading = ref(false);

// Props
const props = defineProps(["product"]);

// Emits
const emits = defineEmits(["close_delete", "regetData"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_delete");
      }, 200);
    }
  }
);

// Methods
const deleteProduct = async (product) => {
  const doDeleteProduct = productSt.doDeleteProduct;
  loading.value = true;
  const isDeleted = await doDeleteProduct(product.id);
  loading.value = false;
  if (isDeleted) {
    emits("regetData", { page: 1, size: 8 });
    dialog.value = false;
  }
};
</script>
