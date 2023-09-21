<template>
  <div class="plist_details position-relative">
    <div
      class="loading_parent"
      style="
        position: fixed;
        right: 50px;
        top: 50px;
        width: 100%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        height: 100%;
      "
      v-if="pageLoading"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        reverse
        size="50"
        v-if="pageLoading"
      ></v-progress-circular>
    </div>
    <v-container class="mt-5">
      <v-card class="pb-5">
        <form action="" @submit.prevent>
          <v-card-title class="font-weight-bold text-start"
            >تفاصيل فاتورة توريد</v-card-title
          >
          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="7" style="height: 100%">
                  <v-row class="pa-0">
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-text-field
                        variant="outlined"
                        label="رقم التوريد"
                        type="text"
                        min="0"
                        :model-value="
                          singleList ? singleList.supplyProcess.id : ''
                        "
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit">
                      رقم التوريد:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit">
                      {{ singleList ? singleList.supplyProcess.id : "" }}
                    </v-col>
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-text-field
                        variant="outlined"
                        label="مسؤول التوريد"
                        type="text"
                        min="0"
                        :model-value="
                          singleList
                            ? singleList.supplyProcess.createdBy.userName
                            : ''
                        "
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit">
                      مسؤول التوريد:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit">{{
                      singleList
                        ? singleList.supplyProcess.createdBy.userName
                        : ""
                    }}</v-col>
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-autocomplete
                        variant="outlined"
                        label="اسم المورد"
                        v-model="selectedSupplier"
                        :items="filteredSuppliers"
                        :loading="selectLoading"
                        item-title="supplierName"
                        item-value="id"
                        no-data-text="لاتوجد بيانات"
                        return-object
                        :error-messages="errs.supplierName"
                        :readonly="!showEdit"
                      />
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit">
                      اسم المورد:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit">
                      {{
                        selectedSupplier ? selectedSupplier.supplierName : ""
                      }}</v-col
                    >
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-file-input
                        accept="image/*"
                        label="صورة الفاتورة"
                        variant="outlined"
                        prepend-icon="mdi-camera"
                        @update:model-value="uploadPic"
                      ></v-file-input>
                    </v-col>
                    <v-col cols="12" class="py-0" v-if="showEdit">
                      <v-text-field
                        variant="outlined"
                        label="رقم الفاتورة"
                        type="text"
                        v-model="packingList.billId"
                        :error-messages="errs.billId"
                        min="0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit">
                      رقم الفاتورة:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit">
                      {{ packingList.billId }}
                    </v-col>
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-text-field
                        variant="outlined"
                        label="تاريخ الاستلام"
                        type="date"
                        v-model="packingList.date"
                        :error-messages="errs.date"
                        :readonly="!showEdit"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit"
                      >تاريخ الاستلام:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit"
                      >{{ packingList.date }}
                    </v-col>
                    <v-col cols="12" md="6" class="py-0" v-if="showEdit">
                      <v-text-field
                        variant="outlined"
                        label="وقت الاستلام"
                        v-model="packingList.time"
                        type="time"
                        :error-messages="errs.time"
                        :readonly="!showEdit"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit"
                      >وقت الاستلام:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit">
                      <span>{{
                        timeFormat(
                          new Date(`${packingList.date} ${packingList.time}`)
                        )
                      }}</span>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit"
                      >اجمالى المبلغ:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit"
                      >{{ filterTotalCost }}
                    </v-col>
                    <v-col cols="12" class="py-0" v-if="showEdit">
                      <v-textarea
                        variant="outlined"
                        v-model="packingList.notes"
                        label="ملاحظات"
                        :readonly="!showEdit"
                        style="height: 100px !important"
                        :rows="2"
                        no-resize
                      ></v-textarea>
                    </v-col>
                    <v-col cols="3" style="font-size: 17px" v-if="!showEdit"
                      >الملاحظات:
                    </v-col>
                    <v-col cols="9" style="font-size: 17px" v-if="!showEdit"
                      >{{
                        packingList.notes ? packingList.notes : "لايوجد ملاحظات"
                      }}
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="5" class="py-0">
                  <div
                    class="img_parent"
                    style="
                      border-radius: 4px;
                      overflow: hidden;
                      height: 22.2rem;
                      border: 1px solid rgb(111, 111, 111);
                    "
                  >
                    <img
                      :src="
                        uploadUrl
                          ? uploadUrl
                          : `data:image/jpg;base64, ${imgUrl}`
                      "
                      style="width: 100%; height: 100%; cursor: pointer"
                      alt=""
                      @click="showImg = `data:image/jpg;base64, ${imgUrl}`"
                    />
                    <v-tooltip activator="parent" location="bottom"
                      >عرض الصورة</v-tooltip
                    >
                  </div>
                </v-col>
                <v-divider color="black" class="mt-10"></v-divider>
                <v-divider color="black"></v-divider>
                <v-col cols="12" class="pb-0">
                  <v-card-text class="my-0 py-0 pr-0"
                    ><h4>الاجزاء بالفاتورة</h4></v-card-text
                  >
                  <v-btn
                    color="rgb(60 22 68)"
                    class="pb-1 px-3 text-white mt-2"
                    @click="toggleInsertPieces = !toggleInsertPieces"
                    variant="elevated"
                    v-if="!toggleInsertPieces && showEdit"
                  >
                    <v-icon size="20" class="mt-1">mdi-plus</v-icon>
                    اضافة اجزاء
                  </v-btn>
                  <v-row v-if="toggleInsertPieces" class="mt-4">
                    <v-col cols="7">
                      <v-row>
                        <v-col cols="6" class="py-0">
                          <v-autocomplete
                            variant="outlined"
                            label="اختر الجزء"
                            return-object
                            v-model="selectedPiece"
                            :error-messages="errs.pieceName"
                            :items="filteredParts"
                            item-title="partName"
                            item-value="id"
                          />
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-text-field
                            variant="outlined"
                            label="العدد"
                            type="number"
                            v-model="selectedNumber"
                            :error-messages="errs.number"
                            min="0"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="3" class="py-0">
                          <v-text-field
                            variant="outlined"
                            label="التكلفة"
                            type="number"
                            v-model="partCost"
                            min="0"
                            :error-messages="errs.cost"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" class="py-0">
                          <div
                            class="d-flex justify-start mt-1"
                            style="gap: 12px"
                          >
                            <v-btn
                              color="green"
                              @click="addPieces()"
                              variant="outlined"
                            >
                              <v-icon size="20" class="mt-1">mdi-check</v-icon>
                              اضافة
                            </v-btn>
                            <v-btn
                              color="red"
                              class="pb-1 mb-4"
                              @click="toggleInsertPieces = !toggleInsertPieces"
                              v-if="toggleInsertPieces"
                              variant="outlined"
                            >
                              <v-icon size="20" class="mt-1">mdi-close</v-icon>
                              الغاء
                            </v-btn>
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col v-if="productPieces.length" cols="12">
                  <table class="w-100">
                    <thead>
                      <tr>
                        <th>اسم الجزء</th>
                        <th>كمية التوريد</th>
                        <th>الكمية الموزعة</th>
                        <th>الكمية المتبقية</th>
                        <th>تكلفة القطعة</th>
                        <th>صورة الجزء</th>
                        <th v-if="showEdit">اتخاذ اجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(piece, index) in productPieces"
                        :key="piece.id"
                      >
                        <td>{{ piece.part.partName }}</td>
                        <td>{{ piece.amount }}</td>
                        <td>{{ piece.distAmount }}</td>
                        <td>{{ piece.remainAmount }}</td>
                        <td>{{ piece.cost }}</td>
                        <td>
                          <img
                            :src="`data:image/jpg;base64,${piece.part.picture}`"
                            alt=""
                            width="30"
                            height="30"
                            style="border-radius: 50%"
                          />
                        </td>
                        <td style="width: 10%" v-if="showEdit">
                          <v-icon
                            style="cursor: pointer"
                            :id="`item_actions_${index}`"
                            >mdi-dots-vertical</v-icon
                          >
                          <v-menu :activator="`#item_actions_${index}`">
                            <v-list elevation="3">
                              <v-list-item @click="updatePart(piece)">
                                <v-icon
                                  style="
                                    border-radius: 50%;
                                    margin-right: 8px;
                                    margin-top: 2px;
                                  "
                                  size="20"
                                  class="ma-0 ml-1"
                                  color="blue"
                                  >mdi-pencil</v-icon
                                >
                                تعديل بيانات الجزء
                              </v-list-item>
                              <v-list-item
                                @click="deletePiece(index)"
                                :style="`
                                margin-top: 2px;
                                pointer-events: ${
                                  piece.partialDist ? 'none' : 'unset'
                                };opacity: ${piece.partialDist ? '0.5' : '1'};`"
                              >
                                <v-icon size="20" class="ma-0 ml-1" color="red"
                                  >mdi-delete</v-icon
                                >
                                حذف الجزء
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <div class="pr-8" v-if="errs.global">
            <span class="text-error font-weight-bold" style="font-size: 15px">{{
              errs.global
            }}</span>
          </div>

          <!--  -->
          <v-menu activator="#show-dist-activator" v-if="!showEdit">
            <v-list elevation="3">
              <v-list-item
                color="green"
                @click="
                  router.push({
                    name: 'distLists',
                    params: {
                      plistId: singleList.supplyProcess.id,
                      billId: singleList.supplyProcess.billId,
                    },
                  })
                "
                :disabled="singleList.supplyProcess.fullDist"
                v-if="
                  loggerData.userPrivileges &&
                  loggerData.userPrivileges['haveSupplierProcessDist']
                "
              >
                <template v-slot:prepend>
                  <v-icon style="color: green"
                    >mdi-align-horizontal-distribute</v-icon
                  >
                </template>
                <v-list-item-title>توزيع الفاتورة</v-list-item-title>
              </v-list-item>
              <v-list-item :loading="loading" @click="printData">
                <template v-slot:prepend>
                  <v-icon color="#9000e4">mdi-printer</v-icon>
                </template>
                <v-list-item-title>طباعة اجزاء الفاتورة</v-list-item-title>
              </v-list-item>
              <v-list-item
                :loading="loading"
                @click="showEdit = true"
                :disabled="!showDelete"
                v-if="
                  loggerData.userPrivileges &&
                  loggerData.userPrivileges['editSupplierProcess']
                "
              >
                <template v-slot:prepend>
                  <v-icon style="color: #0072ff">mdi-pencil</v-icon>
                </template>
                <v-list-item-title>تعديل الفاتورة</v-list-item-title>
              </v-list-item>
              <v-list-item
                prepend-icon="mdi-delete"
                @click="
                  (showDelDialog = true), (pListBillId = packingList.billId)
                "
                :disabled="!showDelete"
                v-if="
                  loggerData.userPrivileges &&
                  loggerData.userPrivileges['editSupplierProcess']
                "
              >
                <template v-slot:prepend>
                  <v-icon style="color: red">mdi-delete</v-icon>
                </template>
                <v-list-item-title>حذف الفاتورة</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-icon
            id="show-dist-activator"
            v-if="!showEdit"
            style="
              position: fixed;
              left: 20px;
              bottom: 40px;
              z-index: 2;
              border-radius: 50%;
              padding: 30px;
              box-shadow: 0px 0px 15px -2px black;
              cursor: pointer;
              background: rgb(69, 22, 70);
              color: white;
            "
            >mdi-menu</v-icon
          >
          <!--  -->

          <v-card-actions class="mt-5 pt-0" v-if="showEdit">
            <div class="d-flex justify-center w-100 pr-6">
              <v-btn
                color="blue-darken-1"
                variant="elevated"
                type="button"
                :loading="loading"
                @click="submitList"
                class="px-3"
              >
                <v-icon>mdi-update</v-icon>
                حفظ
              </v-btn>
              <v-btn
                type="button"
                color="red"
                @click="cancelEdit"
                variant="elevated"
                class="px-3"
              >
                <v-icon>mdi-cancel</v-icon>
                الغاء
              </v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </v-container>
    <DeletePlist
      :listId="listId"
      :pListBillId="pListBillId"
      v-if="showDelDialog"
      @close_popup="showDelDialog = false"
    />
    <EditPart
      v-if="showEditPartDialog"
      @close_popup="showEditPartDialog = false"
      :list_part="list_part"
      @confirmUpdate="getUpdatedPart($event)"
    />
    <PopImage
      v-if="showImg"
      @close_popup="showImg = ''"
      :img="showImg"
      :supplyImg="showImg"
    />
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, onMounted, computed } from "vue";
import { suppliersModule } from "@/stores/suppliers/suppliers";
import { partsModule } from "@/stores/parts/parts";
import { storeToRefs } from "pinia";
import { pListModule } from "@/stores/packingList/packingList";
import { authStore } from "@/stores/auth/auth";
import { mainStore } from "@/stores";
import { notifsModule } from "@/stores/notifications/notifs";

import { useRoute, useRouter } from "vue-router";
import DeletePlist from "@/components/packinglist/DeletePlist.vue";
import EditPart from "@/components/packinglist/EditPart.vue";
import PopImage from "@/components/packinglist/PopImage.vue";

// Init Stores
const supplierSt = suppliersModule();
const partSt = partsModule();
const pListStore = pListModule();
const authModule = authStore();
const mainSt = mainStore();
const notifsStore = notifsModule();

// Init Route
const route = useRoute();
const router = useRouter();

// Data
const { suppliers } = storeToRefs(supplierSt);
const { singleList } = storeToRefs(pListStore);
const { theParts } = storeToRefs(partSt);
const { loggerData } = storeToRefs(authModule);
const dialog = ref(true);
const showDelDialog = ref(false);
const showEditPartDialog = ref(false);
const selectLoading = ref(false);
const toggleInsertPieces = ref(false);
const listId = ref("");
const pListBillId = ref("");
const list_part = ref("");
const showImg = ref("");

const errs = ref({
  supplierName: "",
  time: "",
  date: "",
  pieces: "",
  pieceName: "",
  number: "",
  cost: "",
  billId: "",
  global: "",
});
const packingList = ref({
  pieces: [],
  time: "",
  date: "",
  notes: "",
  billId: "",
  id: "",
});

// Img Files
const imgFile = ref("");
const imgUrl = ref("");
const uploadUrl = ref("");

// Form Actions
const showEdit = ref(false);
const showDelete = ref(false);

const selectedSupplier = ref(null);
const selectedPiece = ref(null);
const selectedNumber = ref(0);
const partCost = ref(0);
const productPieces = ref([]);
const loading = ref(false);
const pageLoading = ref(false);

// Emits
const emits = defineEmits(["close_packinglist"]);

// Watchers
watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        emits("close_packinglist");
      }, 200);
    }
  }
);

// Computed
const filteredSuppliers = computed(() => {
  if (suppliers.value.content) {
    return suppliers.value.content.filter((el) => !el.locked);
  }
  return [];
});

const filteredParts = computed(() => {
  if (theParts.value.content) {
    return theParts.value.content.filter((el) => !el.locked);
  }
  return [];
});

const filterTotalCost = computed(() => {
  if (productPieces.value.length) {
    let total = 0;
    productPieces.value.forEach((el) => {
      total += parseFloat(el.cost) * parseInt(el.amount);
    });
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return 0;
});

// Methods
const updatePart = (part) => {
  list_part.value = part;
  showEditPartDialog.value = true;
};

const getUpdatedPart = (part) => {
  productPieces.value.map((el) => {
    if (el.part.id == part.part.id) {
      el = part;
    }
  });
};

const cancelEdit = () => {
  showEdit.value = false;
  toggleInsertPieces.value = false;
  errs.value.global = "";
};
const doGetSingleList = pListStore.doGetSingleList;

const uploadPic = (e) => {
  if (!e.length) {
    imgFile.value = "";
    uploadUrl.value = "";
  } else {
    imgFile.value = e[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      uploadUrl.value = reader.result;
    });
    reader.readAsDataURL(e[0]);
  }
};

const timeFormat = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = `${hours}:${minutes} ${ampm}`;
  return strTime;
};

const getParts = async () => {
  selectLoading.value = true;
  const doGetAllParts = partSt.doGetAllParts;
  await doGetAllParts();
  selectLoading.value = false;
};
const getSuppliers = async () => {
  selectLoading.value = true;
  const doGetSuppliers = supplierSt.doGetSuppliers;
  await doGetSuppliers();
  selectLoading.value = false;
};

const addPieces = () => {
  errs.value = {
    supplierName: "",
    time: "",
    date: "",
    pieces: "",
    pieceName: "",
    number: "",
    cost: "",
    global: "",
    billId: "",
  };

  if (!selectedPiece.value) return (errs.value.pieceName = "قم باختيار الجزء");
  if (!selectedNumber.value || selectedNumber.value <= 0)
    return (errs.value.number = "قم بادخال عدد الاجزاء");

  if (!partCost.value || partCost.value <= 0)
    return (errs.value.cost = "قم بادخال تكلفة الجزء");

  if (selectedNumber.value && selectedPiece.value && partCost.value) {
    const checkExists = productPieces.value.filter(
      (el) => el.part.id == selectedPiece.value.id
    );
    if (checkExists.length)
      return (errs.value.pieceName = "لقد قمت بادخال هذا الجزء بالفعل");
    let piece = {
      amount: selectedNumber.value,
      cost: partCost.value,
      part: {
        id: selectedPiece.value.id,
        partName: selectedPiece.value.partName,
        currentCost: selectedPiece.value.currentCost,
        picture: selectedPiece.value.picture,
        locked: selectedPiece.value.locked,
      },
      fullDist: false,
      partialDist: false,
    };
    productPieces.value.push(piece);
    selectedPiece.value = null;
    selectedNumber.value = 0;
    partCost.value = 0;
  }
};

const deletePiece = (i) => {
  productPieces.value.splice(i, 1);
};

// Send Data
const submitList = async () => {
  errs.value = {
    supplierName: "",
    time: "",
    date: "",
    pieces: "",
    pieceName: "",
    number: "",
    cost: "",
    global: "",
    billId: "",
  };
  //
  if (!selectedSupplier.value)
    return (errs.value.supplierName = "قم بادخال اسم المورد");

  if (!packingList.value.billId)
    return (errs.value.billId = "قم بادخال رقم الفاتورة");
  if (!packingList.value.time) return (errs.value.time = "قم بادخال الوقت");
  if (!packingList.value.date) return (errs.value.date = "قم بادخال التاريخ");
  if (!productPieces.value.length)
    return (errs.value.global = "قم بادخال الاجزاء المستلمة");

  const partArr = [];
  productPieces.value.map((el) => {
    let obj = {
      cost: el.cost,
      amount: parseInt(el.amount),
      part: {
        id: el.part.id,
      },
    };
    partArr.push(obj);
  });

  let pList = {
    supplyProcessDTO: {
      supplier: {
        id: selectedSupplier.value.id,
      },
      createdBy: {
        id: parseInt(localStorage.getItem("logger")),
      },
      notes: packingList.value.notes,
      billId: packingList.value.billId,
      locked: false,
      isFullDist: false,
      creationDate: new Date(
        `${packingList.value.date} ${packingList.value.time}`
      ),
      id: packingList.value.id,
      file: null,
    },
    partList: partArr,
    imgFile: imgFile.value ? imgFile.value : "",
  };
  loading.value = true;
  const doUpdateList = pListStore.doUpdateList;
  const reqCall = await doUpdateList(pList);
  if (reqCall) {
    const getSingle = await doGetSingleList(route.params.plistId);
    if (getSingle) {
      showEdit.value = false;
      loading.value = false;
    }
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: "تعديل فاتورة توريد",
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بتعديل فاتورة توريد برقم ${packingList.value.billId}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: "/packing-lists",
      privilege: "editSupplierProcess",
    };
    await saveNotif(notification);
  }
};

const printData = () => {
  let data = JSON.parse(JSON.stringify(singleList.value.parts));
  let arr = [];
  let props = [
    "اسم الجزء",
    "كمية التوريد",
    "الكمية الموزعة",
    "الكمية المتبقية",
    "تكلفة القطعة",
  ];
  data.forEach((list) => {
    let obj = {
      "اسم الجزء": list.part.partName,
      "كمية التوريد": list.amount,
      "الكمية الموزعة": list.distAmount,
      "الكمية المتبقية": list.remainAmount,
      "تكلفة القطعة": list.cost,
    };
    arr.push(obj);
  });
  mainSt.printTable(
    arr,
    props,
    `اجزاء المسجلة بالفاتورة ${singleList.value.supplyProcess.billId}`
  );
};
// Hooks
onMounted(async () => {
  pageLoading.value = true;
  const getSingle = await doGetSingleList(route.params.plistId);
  if (!getSingle) {
    router.go(-1);
  } else {
    await Promise.all([getSuppliers(), getParts()]);

    packingList.value.id = singleList.value.supplyProcess.id;

    productPieces.value = singleList.value.parts ? singleList.value.parts : [];
    packingList.value.notes = singleList.value.supplyProcess
      ? singleList.value.supplyProcess.notes
      : "";
    packingList.value.billId = singleList.value.supplyProcess
      ? singleList.value.supplyProcess.billId
      : "";
    selectedSupplier.value = singleList.value.supplyProcess
      ? singleList.value.supplyProcess.supplier
      : "";
    imgUrl.value = singleList.value.supplyProcess
      ? singleList.value.supplyProcess.picture
      : "";
    listId.value = singleList.value.supplyProcess
      ? singleList.value.supplyProcess.id
      : "";
    const dateNow = new Date(singleList.value.supplyProcess.creationDate);
    packingList.value.time = `${
      dateNow.getHours().toString().length != 2
        ? "0" + dateNow.getHours()
        : dateNow.getHours()
    }:${
      dateNow.getMinutes().toString().length != 2
        ? "0" + dateNow.getMinutes()
        : dateNow.getMinutes()
    }`;
    packingList.value.date = `${dateNow.getFullYear()}-${
      dateNow.getMonth().toString().length != 2
        ? "0" + (dateNow.getMonth() + 1)
        : dateNow.getMonth() + 1
    }-${
      dateNow.getDate().toString().length != 2
        ? "0" + dateNow.getDate()
        : dateNow.getDate()
    }`;

    pageLoading.value = false;
    if (singleList.value.enableDelete) {
      showDelete.value = true;
    } else {
      showDelete.value = false;
    }
  }
});
</script>

<style lang="scss">
table {
  border-top: 1px solid #c3c3c3;
  border-right: 1px solid #c3c3c3;
  text-align: center;
  overflow-y: scroll !important;
  background-color: white !important;
  thead {
    border-top: 1px solid #c3c3c3;
    border-right: 1px solid #c3c3c3;
    background: rgb(114 49 116);
    color: white;
  }
  tbody {
    border-top: 1px solid #c3c3c3;
    border-right: 1px solid #c3c3c3;
  }

  td,
  th {
    padding: 12px 0 !important;
    border-left: 1px solid #c3c3c3;
    border-bottom: 1px solid #c3c3c3;
  }
  // th:last-child {

  // }
}
</style>
