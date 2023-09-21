<template>
  <div class="add_user">
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card class="pb-5">
        <v-card-title class="font-weight-bold">انشاء مستخدم جديد</v-card-title>
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
                  :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                  v-model="userData.password.value"
                  @click:append="togglePassType"
                  :error-messages="errs.password"
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
              <v-col cols="12" v-if="userData.role.value">
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
                              v-model="userPrivileges.user.haveUser"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userPrivileges.user.haveUser">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.user.addUser"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.user.haveUser">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.user.editUser"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.user.haveUser">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userPrivileges.user.blockUser"
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
                              v-model="userPrivileges.store.haveStore"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userPrivileges.store.haveStore">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.store.addStore"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.store.haveStore">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.store.editStore"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.store.haveStore">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userPrivileges.store.blockStore"
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
                              v-model="userPrivileges.part.havePart"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userPrivileges.part.havePart">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.part.addPart"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.part.havePart">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.part.editPart"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.part.havePart">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userPrivileges.part.blockPart"
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
                              v-model="userPrivileges.product.haveProduct"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userPrivileges.product.haveProduct">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.product.addProduct"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.product.haveProduct">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.product.editProduct"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.product.haveProduct">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userPrivileges.product.blockProduct"
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
                              v-model="userPrivileges.supervisor.haveSupervisor"
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.supervisor.haveSupervisor"
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.supervisor.addSupervisor"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.supervisor.haveSupervisor"
                          >
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.supervisor.editSupervisor"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.supervisor.haveSupervisor"
                          >
                            <span>حظر</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.supervisor.blockSupervisor
                              "
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
                              v-model="userPrivileges.department.haveDepartment"
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.department.haveDepartment"
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.department.addDepartment"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.department.haveDepartment"
                          >
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.department.editDepartment"
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.department.haveDepartment"
                          >
                            <span>حظر</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.department.blockDepartment
                              "
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
                              v-model="userPrivileges.supplier.haveSupplier"
                            ></v-switch>
                          </v-col>
                          <v-col v-if="userPrivileges.supplier.haveSupplier">
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="userPrivileges.supplier.addSupplier"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.supplier.haveSupplier">
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="userPrivileges.supplier.editSupplier"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="userPrivileges.supplier.haveSupplier">
                            <span>حظر</span>
                            <v-checkbox
                              v-model="userPrivileges.supplier.blockSupplier"
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
                                userPrivileges.supplierProcess
                                  .haveSupplierProcess
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="
                              userPrivileges.supplierProcess.haveSupplierProcess
                            "
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.supplierProcess
                                  .addSupplierProcess
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="
                              userPrivileges.supplierProcess.haveSupplierProcess
                            "
                          >
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.supplierProcess
                                  .editSupplierProcess
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="
                              userPrivileges.supplierProcess.haveSupplierProcess
                            "
                          >
                            <span>توزيع</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.supplierProcess
                                  .haveSupplierProcessDist
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="
                              userPrivileges.supplierProcess.haveSupplierProcess
                            "
                          >
                            <span>ارجاع</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.supplierProcess
                                  .returnSupplierProcess
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
                                userPrivileges.productionProcess
                                  .haveProductionProcess
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="
                              userPrivileges.productionProcess
                                .haveProductionProcess
                            "
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.productionProcess
                                  .addProductionProcess
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
                              v-model="
                                userPrivileges.storeDetails.haveStoreDetails
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.storeDetails.haveStoreDetails"
                          >
                            <span>تسوية</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.storeDetails.settlementStore
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.storeDetails.haveStoreDetails"
                          >
                            <span>توزيع مخزني</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.storeDetails.haveStorePartsDist
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
                              v-model="
                                userPrivileges.sellingProcess.haveProductOut
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.sellingProcess.haveProductOut"
                          >
                            <span>اضافة</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.sellingProcess.addProductOut
                              "
                            ></v-checkbox>
                          </v-col>
                          <v-col
                            v-if="userPrivileges.sellingProcess.haveProductOut"
                          >
                            <span>تعديل</span>
                            <v-checkbox
                              v-model="
                                userPrivileges.sellingProcess.editProductOut
                              "
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
                              v-model="userPrivileges.returns.haveReturns"
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
                              v-model="userPrivileges.reports.haveReports"
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
              @click="addNewUser"
              :loading="loading"
            >
              انشاء
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
import { ref, defineEmits, watch } from "vue";
import { addUserStore } from "@/stores/users/users";
import { storeToRefs } from "pinia";

const store = addUserStore();

// Data
const { addUserSuccess } = storeToRefs(store);
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

const userPrivileges = ref({
  showEntities: {
    haveEntities: false,
  },
  user: {
    haveUser: false,
    addUser: false,
    editUser: false,
    blockUser: false,
  },
  store: {
    haveStore: false,
    addStore: false,
    editStore: false,
    blockStore: false,
  },
  part: {
    havePart: false,
    addPart: false,
    editPart: false,
    blockPart: false,
  },
  product: {
    haveProduct: false,
    addProduct: false,
    editProduct: false,
    blockProduct: false,
  },
  supervisor: {
    haveSupervisor: false,
    addSupervisor: false,
    editSupervisor: false,
    blockSupervisor: false,
  },
  department: {
    haveDepartment: false,
    addDepartment: false,
    editDepartment: false,
    blockDepartment: false,
  },
  supplier: {
    haveSupplier: false,
    addSupplier: false,
    editSupplier: false,
    blockSupplier: false,
  },
  supplierProcess: {
    haveSupplierProcess: false,
    addSupplierProcess: false,
    editSupplierProcess: false,
    haveSupplierProcessDist: false,
    returnSupplierProcess: false,
  },
  productionProcess: {
    haveProductionProcess: false,
    addProductionProcess: false,
  },
  storeDetails: {
    haveStoreDetails: false,
    settlementStore: false,
    haveStorePartsDist: false,
  },
  sellingProcess: {
    haveProductOut: false,
    addProductOut: false,
    editProductOut: false,
  },
  returns: {
    haveReturns: false,
  },
  reports: {
    haveReports: false,
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

// Emits
const emits = defineEmits(["close_adduser", "userAddedSuccessfully"]);

// Watch
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_adduser");
      }, 200);
    }
  }
);

watch(
  () => userData.value.role.value,
  (newVal) => {
    if (newVal == 1) {
      for (const key in userPrivileges.value) {
        for (const keyTwo in userPrivileges.value[key]) {
          userPrivileges.value[key][keyTwo] = true;
        }
      }
    } else {
      for (const key in userPrivileges.value) {
        for (const keyTwo in userPrivileges.value[key]) {
          userPrivileges.value[key][keyTwo] = false;
        }
      }
    }
  }
);

// Methods
const togglePassType = () => {
  showPass.value = !showPass.value;
};

const doAddUser = store.doAddUser;

const addNewUser = async () => {
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
    if (!val[1].value) {
      errs.value[val[0]] = val[1].required;
      isVaildated = false;
    } else {
      if (val[0] == "password" && val[1].value && val[1].value.length < 6) {
        errs.value[val[0]] = "يجب ادخال كلمة سر اكبر من 6 مدخلات";
        isVaildated = false;
      }
    }
  }
  if (isVaildated) {
    loading.value = true;
    const uInfo = {
      userName: user.userName.value,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      password: user.password.value,
      role: {
        id: userData.value.role.value,
      },
      avatar: "",
      userPrivileges: {},
    };
    if (
      !userPrivileges.value.user.haveUser &&
      !userPrivileges.value.product.haveProduct &&
      !userPrivileges.value.store.haveStore &&
      !userPrivileges.value.supplier.haveSupplier &&
      !userPrivileges.value.part.havePart &&
      !userPrivileges.value.supervisor.haveSupervisor &&
      !userPrivileges.value.department.haveDepartment
    ) {
      userPrivileges.value.showEntities.haveEntities = false;
    } else {
      userPrivileges.value.showEntities.haveEntities = true;
    }
    for (const key in userPrivileges.value) {
      for (const keyTwo in userPrivileges.value[key]) {
        uInfo.userPrivileges[keyTwo] = userPrivileges.value[key][keyTwo];
      }
    }
    await doAddUser(uInfo);
    if (addUserSuccess) {
      emits("userAddedSuccessfully");
      dialog.value = false;
    }
    loading.value = false;
  }
};
</script>
