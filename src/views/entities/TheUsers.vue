<template>
  <div class="users">
    <DataTable
      :data="users"
      :tableHeaders="tableHeaders"
      :defaultImg="userImg"
      :actions="actions"
      :rowCheck="'locked'"
      :windowHeight="windowHeight"
      :tableLoading="tableLoading"
      :ranges="[8, 16, 24, 40]"
      :page="page"
      :size="size"
      :resetPage="resetPage"
      :padding="2"
      @refresh="getUsers($event)"
      @editUserMethod="editUserMethod($event)"
      @doBlockUser="doBlockUser($event)"
      :bottomActions="bottomActions"
      @addUser="addUser = true"
      @printTable="printData"
      @downloadTable="exportExcel"
      @pageReset="getUsers"
    />
    <AddUser
      v-if="addUser"
      @close_adduser="addUser = false"
      @userAddedSuccessfully="resetPage = true"
    />
    <EditUser
      v-if="editUser"
      @close_edit="editUser = false"
      :user="toEditUser"
      @updatedSuccessfully="resetPage = true"
    />
    <BlockUser
      v-if="blockUser"
      :user="blockedUser"
      @close_window="blockUser = false"
      @update_success="getUsers"
      @doUpdate="deActivateUser($event)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { addUserStore } from "@/stores/users/users";
import { mainStore } from "@/stores";

// Table Component
import DataTable from "@/components/global/DataTable.vue";
import AddUser from "@/components/entities/users/AddUser.vue";
import EditUser from "@/components/entities/users/EditUser.vue";
import BlockUser from "@/components/entities/users/BlockUser.vue";
import { storeToRefs } from "pinia";
import router from "@/router";

// Store
const store = addUserStore();
const mainSt = mainStore();

// Data
const addUser = ref(false);
const editUser = ref(false);
const toEditUser = ref("");
const blockUser = ref(false);
const blockedUser = ref(null);
const tableLoading = ref(false);
const userImg = require("@/assets/user.png");
const { users } = storeToRefs(store);
const page = ref(1);
const size = ref(8);
const resetPage = ref(false);

const tableHeaders = ref([
  {
    text: "اسم المستخدم",
    value: "userName",
    type: "text",
  },
  {
    text: "الاسم الاول",
    value: "firstName",
    type: "text",
  },
  {
    text: "الاسم الثاني",
    value: "lastName",
    type: "text",
  },
  {
    text: "دور المستخدم",
    value: ["role", "id"],
    type: "role",
    nested: true,
  },
  {
    text: "الصورة الشخصية",
    value: "avatar",
    type: "img",
  },
]);

const actions = ref([
  {
    icon: ["mdi-lock-off", "mdi-lock"],
    check: "locked",
    text: ["فك حظر المستخدم", "حظر المستخدم"],
    emit: "doBlockUser",
    color: ["green", "red"],
    needPriv: true,
    priv: "blockUser",
  },
  {
    icon: "mdi-pencil",
    text: "تعديل بيانات المستخدم",
    emit: "editUserMethod",
    color: "blue",
    needPriv: true,
    priv: "editUser",
  },
]);

const bottomActions = ref([
  {
    icon: "mdi-plus",
    text: "اضافة مستخدم جديد",
    emit: "addUser",
    needPriv: true,
    priv: "addUser",
  },
  {
    icon: "mdi-printer",
    text: "طباعة الجدول",
    emit: "printTable",
    check: true,
  },
  {
    icon: "mdi-download",
    text: "تحميل الجدول",
    emit: "downloadTable",
    check: true,
  },
]);

// Props
defineProps(["windowHeight"]);

// Methods
const doGetAllUsers = store.doGetAllUsers;

const deActivateUser = async (userState) => {
  const doUpdateUser = store.doUpdateUser;
  blockedUser.value.changePassword = false;
  blockedUser.value.isLocked = userState;
  blockedUser.value.imgFile = false;

  const updateNow = await doUpdateUser(blockedUser.value);
  if (updateNow) {
    tableLoading.value = true;
    resetPage.value = true;
    await getUsers();
    tableLoading.value = false;
    blockUser.value = false;
    const userId = localStorage.getItem("logger");
    if (userState && blockedUser.value.id == userId) {
      localStorage.removeItem("logger");
      router.push({ name: "log_in" });
    }
    resetPage.value = false;
  }
};

const getUsers = async (data) => {
  let obj = {};
  if (data) {
    obj.page = data.page;
    obj.size = data.size;
  } else {
    obj.page = page.value;
    obj.size = size.value;
  }
  tableLoading.value = true;
  await doGetAllUsers(obj);
  tableLoading.value = false;
  if (resetPage.value) {
    resetPage.value = false;
  }
};

const editUserMethod = async (user) => {
  toEditUser.value = user;
  editUser.value = true;
};

const doBlockUser = (user) => {
  blockedUser.value = user;
  blockUser.value = true;
};

const exportExcel = () => {
  let theUsers = JSON.parse(JSON.stringify(users.value.content));
  let arr = [];
  theUsers.forEach((user) => {
    let obj = {
      "اسم المستخدم": user.userName,
      "الاسم الاول": user.firstName,
      "اسم العائلة": user.lastName,
      "دور المستخدم":
        user.role.id == 1
          ? "مسؤول"
          : user.role.id == 2
          ? "مساعد مسؤول"
          : "امين مخزن",
      الحظر: user.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  mainSt.exportExcel(arr, "المستخدمين", wscols);
};

const printData = () => {
  let stores = JSON.parse(JSON.stringify(users.value.content));
  let arr = [];
  stores.forEach((store) => {
    let obj = {
      "اسم المخزن": store.storeName,
      "امين المخزن": store.user.userName,
      الحالة: store.locked ? "محظور" : "متاح",
    };
    arr.push(obj);
  });
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
  mainSt.exportExcel(arr, "المخازن", wscols);
};

// Hooks
onMounted(async () => {
  await getUsers();
});
</script>
