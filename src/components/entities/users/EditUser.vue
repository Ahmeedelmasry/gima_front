<template>
  <div class="edit_user">
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card class="pb-5">
        <v-card-title class="font-weight-bold"
          >تعديل بيانات المستخدم</v-card-title
        >
        <v-card-text>
          <v-container class="pb-0">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  variant="outlined"
                  label="اسم المستخدم"
                  v-model="userData.userName.value"
                  :error-messages="errs.userName"
                  class="required"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :type="showPass ? 'text' : 'password'"
                  variant="outlined"
                  label="كلمة السر"
                  v-model="userData.password.value"
                  :error-messages="errs.password"
                  :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="togglePassType"
                  class="required"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  variant="outlined"
                  label="الاسم الاول"
                  v-model="userData.firstName.value"
                  :error-messages="errs.firstName"
                  class="required"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  variant="outlined"
                  label="الاسم الثاني"
                  v-model="userData.lastName.value"
                  :error-messages="errs.lastName"
                  class="required"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  :items="userRoles"
                  variant="outlined"
                  label="دور المستخدم"
                  v-model="userData.role.value"
                  :error-messages="errs.role"
                  no-data-text="لاتوجد بيانات"
                  class="required"
                />
              </v-col>
              <v-col cols="12" v-if="userData.userPrivileges">
                <h3>صلاحيات المستخدم</h3>
                <v-expansion-panels class="mt-5">
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >مدخلات النظام</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>المستخدمين</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveUser"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveUser">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addUser"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveUser">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editUser"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveUser">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockUser"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>المخازن</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveStore"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveStore">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addStore"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveStore">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editStore"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveStore">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockStore"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>

                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>الاجزاء</span>
                            <v-switch
                              v-model="userData.userPrivileges.havePart"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.havePart">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addPart"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.havePart">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editPart"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.havePart">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockPart"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>المنتجات</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveProduct"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveProduct">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addProduct"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveProduct">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editProduct"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveProduct">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockProduct"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>امناء المخازن</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveSupervisor"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupervisor">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addSupervisor"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupervisor">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editSupervisor"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupervisor">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockSupervisor"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>الاقسام</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveDepartment"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveDepartment">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addDepartment"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveDepartment">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editDepartment"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveDepartment">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockDepartment"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>الموردين</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveSupplier"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupplier">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addSupplier"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupplier">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editSupplier"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveSupplier">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.blockSupplier"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title>التوريدات</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>عرض الصفحة</span>
                            <v-switch
                              v-model="
                                userData.userPrivileges.haveSupplierProcess
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveSupplierProcess"
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.addSupplierProcess
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveSupplierProcess"
                          >
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.editSupplierProcess
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveSupplierProcess"
                          >
                            <span>توزيع</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.haveSupplierProcessDist
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveSupplierProcess"
                          >
                            <span>ارجاع</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.returnSupplierProcess
                              "
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >اذونات الصرف</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>عرض الصفحة</span>
                            <v-switch
                              v-model="
                                userData.userPrivileges.haveProductionProcess
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveProductionProcess"
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.addProductionProcess
                              "
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >تفاصيل المخازن</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>عرض الصفحة</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveStoreDetails"
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveStoreDetails"
                          >
                            <span>تسوية</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.settlementStore"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userData.userPrivileges.haveStoreDetails"
                          >
                            <span>توزيع مخزني</span>
                            <v-checkbox
                              v-model="
                                userData.userPrivileges.haveStorePartsDist
                              "
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >اذونات البيع</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="outlined"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>عرض الصفحة</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveProductOut"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveProductOut">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.addProductOut"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userData.userPrivileges.haveProductOut">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userData.userPrivileges.editProductOut"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >ادخال ارجاعات / هوالك</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="text"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>السماح بادخال الارجاعات والهوالك</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveReturns"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel class="mb-5" elevation="1">
                    <v-expansion-panel-title
                      >عرض التقارير</v-expansion-panel-title
                    >
                    <v-expansion-panel-text>
                      <v-card
                        width="100%"
                        variant="text"
                        class="pr-5 pt-5 mt-4"
                      >
                        <v-row>
                          <v-col>
                            <span>السماح بالوصول لصفحات التقارير</span>
                            <v-switch
                              v-model="userData.userPrivileges.haveReports"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <div class="d-flex justify-start w-100 pr-8">
            <v-btn
              color="blue-darken-1"
              variant="outlined"
              :loading="loading"
              @click="updateUser"
            >
              حفظ
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
import { ref, defineProps, onMounted, defineEmits, watch } from "vue";
import { addUserStore } from "@/stores/users/users";

// Init Store
const store = addUserStore();

// Data
const dialog = ref(true);
const loading = ref(false);
const showPass = ref(false);
const errs = ref({
  userName: "",
  firstName: "",
  lastName: "",
  password: "",
  role: "",
});
const userData = ref({
  id: "",
  userName: {
    value: "",
    required: "ادخل اسم المستخدم",
  },
  firstName: {
    value: "",
    required: "ادخل الاسم الاول للمستخدم",
  },
  lastName: {
    value: "",
    required: "ادخل الاسم الثاني للمستخدم",
  },
  password: {
    value: "",
    required: "ادخل كلمة سر المستخدم",
  },
  role: {
    value: "",
    required: "ادخل دور المستخدم",
  },
});

const userRoles = [
  {
    title: "مسؤول",
    value: 1,
  },
  {
    title: "مساعد مسؤول",
    value: 2,
  },
  {
    title: "امين مخزن",
    value: 3,
  },
];

// Props
const props = defineProps(["user"]);
// Emits
const emits = defineEmits(["close_edit", "updatedSuccessfully"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_edit");
      }, 200);
    }
  }
);

// Methods
const togglePassType = () => {
  showPass.value = !showPass.value;
};
const doUpdateUser = store.doUpdateUser;
const updateUser = async () => {
  errs.value = {
    userName: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "",
  };
  let user = userData.value;
  let isVaildated = true;
  for (let val of Object.entries(user)) {
    if (val[0] !== "userPrivileges") {
      if (!val[1].value && val[0] != "id") {
        errs.value[val[0]] = val[1].required;
        isVaildated = false;
      } else {
        if (val[0] == "password" && val[1].value && val[1].value.length < 6) {
          errs.value[val[0]] = "يجب ادخال كلمة سر اكبر من 6 مدخلات";
          isVaildated = false;
        }
      }
    }
  }
  if (isVaildated) {
    if (
      !userData.value.userPrivileges.haveUser &&
      !userData.value.userPrivileges.haveProduct &&
      !userData.value.userPrivileges.haveStore &&
      !userData.value.userPrivileges.haveSupplier &&
      !userData.value.userPrivileges.havePart &&
      !userData.value.userPrivileges.haveSupervisor &&
      !userData.value.userPrivileges.haveDepartment
    ) {
      userData.value.userPrivileges.haveEntities = false;
    } else {
      userData.value.userPrivileges.haveEntities = true;
    }

    loading.value = true;
    const uInfo = {
      id: user.id,
      userName: user.userName.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      password: user.password.value,
      role: {
        id: userData.value.role.value,
      },
      avatar: user.avatar,
      changePassword: false,
      isLocked: props.user.locked ? true : false,
      userPrivileges: userData.value.userPrivileges,
    };
    const doUpdate = await doUpdateUser(uInfo);
    if (doUpdate) {
      emits("updatedSuccessfully");
      dialog.value = false;
    }
    loading.value = false;
  }
};

// Hooks
onMounted(() => {
  userData.value.id = props.user.id;
  userData.value.userName.value = props.user.userName;
  userData.value.firstName.value = props.user.firstName;
  userData.value.lastName.value = props.user.lastName;
  userData.value.password.value = props.user.password;
  userData.value.role.value = props.user.role.id;
  userData.value.userPrivileges = props.user.userPrivileges;
});
</script>
