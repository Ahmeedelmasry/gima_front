<template>
  <div class="login">
    <v-container fluid class="pa-0" style="height: fit-content">
      <v-row>
        <v-col cols="6" class="pt-0 pb-0 ma-0">
          <div class="d-flex align-center justify-center h-100 px-10">
            <div class="w-100 px-10">
              <div
                class="logo-container d-flex align-center justify-space-around mb-7"
              >
                <div class="SLOGAN text-center" style="color: #b1b1b1">
                  <h4 style="font-size: 30px">شركة جيما</h4>
                  <h4
                    style="
                      font-family: 'Material Design Icons';
                      font-size: 30px;
                    "
                  >
                    JIMMA COMPANY
                  </h4>
                </div>
                <img
                  style="
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    transition: 0.2s all ease-in-out;
                    border: 1px solid rgb(173, 173, 173);
                  "
                  :src="logo"
                  alt=""
                />
              </div>
              <form @submit.prevent="submitLogin">
                <v-text-field
                  label="اسم المستخدم"
                  variant="outlined"
                  v-model="loggerData.userName"
                  :error-messages="errs.userName"
                ></v-text-field>
                <v-text-field
                  label="كلمة السر"
                  type="password"
                  class="mt-3"
                  variant="outlined"
                  v-model="loggerData.password"
                  :error-messages="errs.pass"
                ></v-text-field>
                <span
                  class="login-err text-error v-alert"
                  style="
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: -10px;
                    display: block;
                  "
                  v-if="loginErr"
                  >{{ loginErr }}</span
                >

                <div class="actions mt-5">
                  <v-btn
                    color="rgb(69 22 70)"
                    size="larg"
                    class="me-4 pt-2 pb-3 w-100 text-white px-5 align-center d-flex"
                    type="submit"
                    :loading="loading"
                  >
                    تسجيل دخول
                    <v-icon size="25" class="mr-2 mt-2">mdi-login</v-icon>
                  </v-btn>
                </div>
              </form>
            </div>
          </div>
        </v-col>
        <v-col
          cols="6"
          class="pa-0 ma-0"
          :style="`height: ${props.windowHeight + 7.5}px`"
        >
          <img :src="sideImg" alt="" style="width: 100%; height: 100%" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "@/stores/auth/auth";
import { storeToRefs } from "pinia";

// Init Store
const store = authStore();

// Init Router
const router = useRouter();

// Data
const { loginErr } = storeToRefs(store);
const sideImg = require("@/assets/8487266.jpg");
const logo = require("@/assets/logo.jpg");

const loading = ref(false);

const errs = ref({
  userName: "",
  pass: "",
});

const loggerData = ref({
  userName: "",
  password: "",
});

// Props
const props = defineProps(["windowHeight"]);

// Methods
const doLogin = store.doLogin;
const submitLogin = async () => {
  errs.value = {
    userName: "",
    pass: "",
  };
  if (!loggerData.value.userName) {
    return (errs.value.userName = "قم بادخال اسم المستخدم");
  }
  if (!loggerData.value.password) {
    return (errs.value.pass = "قم بادخال كلمة السر");
  }
  loading.value = true;
  const userData = await doLogin(loggerData.value);
  loading.value = false;
  if (!loginErr.value) {
    if (userData.storeId) {
      router.push({ name: "viewStore" });
    } else {
      router.push({ name: "home" });
    }
  }
};
</script>
