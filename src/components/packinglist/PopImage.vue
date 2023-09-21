<template>
  <div class="edit-plist-part">
    <v-dialog v-model="dialog" max-width="600px" max-height="90vh">
      <v-card class="text-center pb-0 px-0">
        <div class="d-flex justify-space-between">
          <v-card-title class="font-weight-bold pb-0 mb-0"
            >صورة الفاتورة</v-card-title
          >
          <v-icon
            class="mt-5 ml-5"
            color="red"
            size="25"
            style="cursor: pointer"
            @click="dialog = false"
            >mdi-close</v-icon
          >
        </div>
        <v-container>
          <v-row>
            <v-col cols="12" class="pa-0">
              <v-img
                @mouseover="mouseOver"
                @mouseout="mouseOut"
                @mousemove="mouseMove"
                :src="supplyImg"
                aspect-ratio="1.7"
                data-scale="2.4"
                max-height="80vh"
              ></v-img>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch } from "vue";

// Data
const dialog = ref(true);

// Props
defineProps(["supplyImg"]);

// Emits
const emits = defineEmits(["close_popup"]);

// Watch
watch(
  () => dialog.value,
  () => {
    setTimeout(() => {
      emits("close_popup");
    }, 200);
  }
);

// Methods
const mouseOver = (e) => {
  if (e.target.classList.contains("v-img__img")) {
    var xx =
      ((e.pageX - e.target.parentNode.offsetLeft) / e.target.offsetWidth) * 60 +
      "% " +
      ((e.pageY - e.target.parentNode.offsetTop) / e.target.offsetHeight) * 60 +
      "%";
    e.target.parentNode.querySelector("img").style.transformOrigin = xx;
    e.target.parentNode.querySelector("img").style.transform = "scale(1.3)";
  }
};
const mouseOut = (e) => {
  e.target.parentNode.querySelector("img").style.transform = "scale(1)";
};
const mouseMove = (e) => {
  var xx =
    ((e.pageX - e.target.parentNode.offsetLeft) / e.target.offsetWidth) * 60 +
    "% " +
    ((e.pageY - e.target.parentNode.offsetTop) / e.target.offsetHeight) * 60 +
    "%";
  e.target.parentNode.querySelector("img").style.transformOrigin = xx;
  e.target.parentNode.querySelector("img").style.transform = "scale(1.3)";
};
</script>
