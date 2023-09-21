<template>
  <div class="profile">
    <v-container class="lower_container mt-5">
      <div class="lower" :style="`min-height: ${props.windowHeight - 180}px`">
        <div class="pic">
          <div class="img-div">
            <img
              :src="`data:image/jpg;base64,${userData.avatar}`"
              alt="profile picture"
              v-if="userData.avatar && !imgUrl"
            />
            <img :src="imgUrl" alt="profile picture" v-if="imgUrl" />
            <img
              :src="defaultImg"
              alt="profile picture"
              v-if="!userData.avatar && !imgUrl"
            />

            <input
              type="file"
              @change="changePic"
              accept="image/jpg, image/jpeg, image/png"
              :disabled="!startEdit"
            />
            <div
              class="img_overlay"
              :style="!startEdit ? 'display: none' : 'display: block'"
            ></div>
          </div>
        </div>
        <v-form
          style="padding-left: 20px; padding-right: 20px"
          @submit.prevent="submitEdit"
          class="text-center"
        >
          <v-row style="margin: 0">
            <v-col cols="12" sm="6" style="margin: 0">
              <v-text-field
                label="اسم المستخدم"
                variant="outlined"
                disabled
                v-model="userData.userName"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" style="margin: 0">
              <v-text-field
                label="دور المستخدم"
                disabled
                :model-value="
                  userData.role.id == 1
                    ? 'مسؤول'
                    : userData.role.id == 2
                    ? 'مساعد مسؤول'
                    : 'امين مخزن'
                "
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" style="margin: 0">
              <v-text-field
                label="الاسم الاول"
                variant="outlined"
                :readonly="!startEdit"
                outlined
                v-model="userData.firstName"
                :error-messages="errs.firstName"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" style="margin: 0">
              <v-text-field
                label="اسم العائلة"
                variant="outlined"
                :readonly="!startEdit"
                outlined
                v-model="userData.lastName"
                :error-messages="errs.lastName"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              style="margin: 0"
              v-if="changePass && startEdit"
            >
              <v-text-field
                type="password"
                label="كلمة السر القديمة"
                name="oldPass"
                variant="outlined"
                id="oldPass"
                outlined
                v-model="oldPassword"
                :error-messages="errs.oldPassword"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              style="margin: 0"
              v-if="changePass && startEdit"
            >
              <v-text-field
                label="كلمة السر الجديدة"
                type="password"
                name="newPass"
                variant="outlined"
                id="newPass"
                outlined
                v-model="newPassword"
                :error-messages="errs.newPassword"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              style="margin: 0"
              v-if="changePass && startEdit"
            >
              <v-text-field
                label="تاكيد كلمة السر"
                type="password"
                outlined
                name="confirmPass"
                variant="outlined"
                id="confirmPass"
                v-model="confirmPassword"
                :error-messages="errs.confirmPassword"
              ></v-text-field>
            </v-col>
            <v-col cols="12" v-if="startEdit && changePass" class="pt-0">
              <v-icon
                @click="changePass = false"
                style="padding: 5px; border-radius: 50%; border: 1px solid"
                >mdi-chevron-up</v-icon
              >
            </v-col>
            <v-col cols="12">
              <v-btn
                type="button"
                class="pb-8"
                style="
                  background-color: rgb(0, 157, 255);
                  font-weight: 700;
                  color: white !important;
                  padding: 7px 25px;
                  border-radius: 10px;
                "
                v-if="!startEdit"
                @click="startEdit = true"
                >تعديل</v-btn
              >
              <v-btn
                type="submit"
                style="border-radius: 10px"
                color="rgb(60 22 68)"
                class="font-weight-bold text-white"
                v-if="startEdit"
                :loading="loading"
                >حفظ</v-btn
              >
              <v-btn
                type="button"
                style="border-radius: 10px; background-color: indianred"
                class="font-weight-bold mr-2 text-white"
                v-if="startEdit"
                @click="cancelEdit"
                >الغاء</v-btn
              >
              <p
                style="cursor: pointer; font-size: 14px"
                @click="changePass = true"
                v-if="!changePass && startEdit"
                class="mt-2"
              >
                تغيير كلمة السر؟
              </p>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { storeToRefs } from "pinia";
import { authStore } from "@/stores/auth/auth";
import { addUserStore } from "@/stores/users/users";
import { onBeforeRouteLeave } from "vue-router";

// Init Store
const store = authStore();
const userModule = addUserStore();
const { loggerData } = storeToRefs(store);

// Data
const userData = loggerData;
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const imgFile = ref("");
const imgUrl = ref("");
const loading = ref(false);
const changePass = ref(false);
const startEdit = ref(false);
const defaultImg = require("@/assets/user.png");

const errs = ref({
  userName: "",
  firstName: "",
  lastName: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Props
const props = defineProps(["windowHeight"]);

// Methods
const doUpdateUser = userModule.doUpdateUser;
const doGetLoggerData = store.doGetLoggerData;

const changePic = (e) => {
  if (!e.target.files[0]) {
    imgUrl.value = "";
    imgFile.value = "";
    return;
  }
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    imgUrl.value = e.target.result;
    imgFile.value = file;
  };
  reader.readAsDataURL(file);
};

const cancelEdit = () => {
  startEdit.value = false;
  changePass.value = false;
};

const submitEdit = async () => {
  errs.value = {
    userName: "",
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  if (!userData.value.firstName) {
    errs.value.firstName = "قم بادخال الاسم الاول";
  }
  if (!userData.value.lastName) {
    errs.value.lastName = "قم بادخال اسم العائلة";
  }
  if (changePass.value) {
    if (!oldPassword.value) {
      errs.value.oldPassword = "ادخل كلمة السر القديمة";
    }
    if (!newPassword.value) {
      errs.value.newPassword = "ادخل كلمة السر الجديدة";
    }
    if (newPassword.value && newPassword.value.length < 6) {
      errs.value.newPassword = "يجب ان تتكون كلمة السر من 6 مدخلات علي الاقل";
    }
    if (!confirmPassword.value) {
      errs.value.confirmPassword = "قم بتاكيد كلمة السر";
    }
    if (confirmPassword.value != newPassword.value) {
      errs.value.confirmPassword = "قم بتاكيد كلمة السر بطريقة صحيحة";
    }
  }
  // Check if valid
  let isValid = false;
  for (let val of Object.entries(errs.value)) {
    if (errs.value[val[0]]) {
      isValid = false;
      break;
    } else {
      isValid = true;
    }
  }
  if (isValid) {
    let dataToSend = userData.value;
    if (changePass.value) {
      dataToSend.changePassword = true;
      dataToSend.oldPassword = oldPassword.value;
      dataToSend.password = newPassword.value;
    } else {
      dataToSend.changePassword = false;
    }
    dataToSend.isLocked = false;
    dataToSend.imgFile = imgUrl.value ? imgFile.value : false;
    loading.value = true;
    const updateProfile = await doUpdateUser(dataToSend);
    loading.value = false;
    if (updateProfile) {
      await doGetLoggerData(localStorage.getItem("logger"));
      startEdit.value = false;
      changePass.value = false;
    }
  }
};

// Hooks
onBeforeRouteLeave(async () => {
  await doGetLoggerData(localStorage.getItem("logger"));
});
</script>

<style lang="scss">
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  background-size: cover;
  background-position: center center;
  .lower {
    width: 70%;
    text-align: center;
    margin-right: auto;
    margin-left: auto;
    background-color: white;
    padding: 15px 0;
    margin-bottom: 20px;
    border-radius: 15px;
    box-shadow: 0px 0px 17px -4px #8d8d8d;
    background-size: cover;
    background-position: left top;
    .pic {
      border-radius: 50%;
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.693);
      .img-div {
        position: relative;
        img {
          width: 100%;
        }
        input {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 2;
        }
        .img_overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(2, 2, 2, 0.538);
          z-index: 1;
          opacity: 0;
          transition: 0.2s all;
        }
        &:hover .img_overlay {
          opacity: 1;
        }
      }
    }
  }
  .v-messages__message {
    display: flex !important;
  }
}

// Media
@media (max-width: 980px) {
  .lower_container {
    padding-left: 50px;
    padding-right: 50px;
  }
}

@media (max-width: 600px) {
  .username h2,
  .email h2 {
    font-size: 20px !important;
  }
}
</style>
