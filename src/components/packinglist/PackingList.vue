<template>
  <div class="packing_list">
    <v-dialog v-model="dialog" max-width="800" persistent>
      <v-card class="pb-5">
        <form action="" @submit.prevent>
          <div class="d-flex justify-space-between">
            <v-card-title class="font-weight-bold"
              >ادخال فاتورة توريد</v-card-title
            >
            <v-icon
              color="red"
              size="25"
              class="pa-7"
              style="cursor: pointer"
              @click="dialog = false"
              >mdi-close</v-icon
            >
          </div>

          <v-card-text>
            <v-container class="pb-0">
              <v-row>
                <v-col cols="12" md="6" class="pb-0">
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
                    class="required"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    variant="outlined"
                    label="رقم الفاتورة"
                    type="text"
                    v-model="packingList.billId"
                    :error-messages="errs.billId"
                    min="0"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    accept="image/*"
                    label="صورة الفاتورة"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @update:model-value="uploadPic"
                    :error-messages="errs.billingImg"
                    class="required"
                  ></v-file-input>
                </v-col>
                <v-col cols="12" sm="6" class="pt-0">
                  <v-text-field
                    variant="outlined"
                    label="وقت الاستلام"
                    v-model="packingList.time"
                    type="time"
                    :error-messages="errs.time"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="pt-0">
                  <v-text-field
                    variant="outlined"
                    label="تاريخ الاستلام"
                    type="date"
                    v-model="packingList.date"
                    :error-messages="errs.date"
                    class="required"
                  ></v-text-field>
                </v-col>
                <v-col cols="12 pt-0">
                  <v-card-text class="my-0 pt-0 pr-0"
                    ><h4>الاجزاء المستلمة</h4></v-card-text
                  >
                  <v-btn
                    color="rgb(60 22 68)"
                    class="pb-1"
                    @click="toggleInsertPieces = !toggleInsertPieces"
                    v-if="!toggleInsertPieces"
                    variant="outlined"
                  >
                    <v-icon size="20" class="mt-1">mdi-plus</v-icon>
                    ادخال الاجزاء
                  </v-btn>
                  <v-row v-if="toggleInsertPieces">
                    <v-col cols="5" class="pb-0">
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
                    <v-col cols="3" class="pb-0">
                      <v-text-field
                        variant="outlined"
                        label="العدد"
                        type="number"
                        v-model="selectedNumber"
                        :error-messages="errs.number"
                        min="0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2" class="pb-0" v-if="selectedPiece">
                      <v-text-field
                        variant="outlined"
                        label="التكلفة الحالية"
                        type="number"
                        v-model="selectedPiece.currentCost"
                        min="0"
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2" class="pb-0" v-if="selectedPiece">
                      <v-text-field
                        variant="outlined"
                        label="التكلفة الجديدة"
                        type="number"
                        v-model="partCost"
                        min="0"
                        :error-messages="errs.cost"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" style="margin-top: -10px">
                      <div class="d-flex justify-start" style="gap: 5px">
                        <v-btn
                          color="green"
                          @click="addPieces()"
                          variant="outlined"
                        >
                          <v-icon size="20" class="mt-1">mdi-check</v-icon>
                        </v-btn>
                        <v-btn
                          color="red"
                          class="pb-1 mb-4"
                          @click="toggleInsertPieces = !toggleInsertPieces"
                          v-if="toggleInsertPieces"
                          variant="outlined"
                        >
                          <v-icon size="20" class="mt-1">mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col v-if="productPieces.length" cols="12">
                  <table class="w-100">
                    <thead>
                      <tr>
                        <th>اسم الجزء</th>
                        <th>عدد القطع</th>
                        <th>تكلفة القطعة</th>
                        <th>اجمالي التكلفة</th>
                        <th>صورة الجزء</th>
                        <th>اتخاذ اجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(piece, index) in productPieces"
                        :key="piece.id"
                      >
                        <td>{{ piece.partName }}</td>
                        <td>{{ piece.number }}</td>
                        <td>{{ piece.cost }}</td>
                        <td>{{ piece.cost * piece.number }}</td>
                        <td>
                          <img
                            :src="`data:image/jpg;base64,${piece.picture}`"
                            alt=""
                            width="30"
                            height="30"
                            style="border-radius: 50%"
                          />
                        </td>
                        <td>
                          <v-icon
                            style="
                              border-radius: 50%;
                              margin-right: 8px;
                              margin-top: 2px;
                              color: indianred;
                            "
                            size="20"
                            class="ma-0"
                            @click="deletePiece(index)"
                            >mdi-delete</v-icon
                          >
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2">اجمالى المبلغ</td>
                        <td colspan="4">{{ filterTotalCost }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-textarea
                    variant="outlined"
                    v-model="packingList.notes"
                    label="ملاحظات"
                    rows="2"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <div class="text-center" v-if="errs.global">
            <span class="text-error" style="font-size: 13px">{{
              errs.global
            }}</span>
          </div>

          <v-card-actions class="mt-0 pt-0">
            <div class="d-flex justify-start w-100 pr-6">
              <v-btn
                color="blue-darken-1"
                variant="outlined"
                type="button"
                :loading="loading"
                @click="submitList"
              >
                ادخال
              </v-btn>
              <v-btn
                type="button"
                color="red"
                variant="outlined"
                @click="dialog = false"
              >
                الغاء
              </v-btn>
            </div>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, onMounted, computed } from "vue";
import { suppliersModule } from "@/stores/suppliers/suppliers";
import { partsModule } from "@/stores/parts/parts";
import { notifsModule } from "@/stores/notifications/notifs";
import { authStore } from "@/stores/auth/auth";
import { storeToRefs } from "pinia";
import { pListModule } from "@/stores/packingList/packingList";

const supplierSt = suppliersModule();
const notifsStore = notifsModule();
const partSt = partsModule();
const authSt = authStore();
const pListStore = pListModule();

// Data
const { suppliers } = storeToRefs(supplierSt);
const { theParts } = storeToRefs(partSt);
const { loggerData } = storeToRefs(authSt);
const dialog = ref(true);
const selectLoading = ref(false);
const toggleInsertPieces = ref(false);

const errs = ref({
  supplierName: "",
  time: "",
  date: "",
  pieces: "",
  pieceName: "",
  number: "",
  cost: "",
  billId: "",
  billingImg: "",
  global: "",
});
const packingList = ref({
  pieces: [],
  time: "",
  date: "",
  notes: "",
  billId: "",
});

// Img Files
const imgFile = ref("");

const selectedSupplier = ref(null);
const selectedPiece = ref(null);
const selectedNumber = ref(0);
const partCost = ref(0);
const productPieces = ref([]);
const loading = ref(false);

// Emits
const emits = defineEmits(["close_packinglist", "regetItems"]);

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
    productPieces.value.forEach(
      (el) => (total += parseFloat(el.cost) * parseInt(el.number))
    );
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return 0;
});

// Methods

const uploadPic = (e) => {
  if (!e.length) {
    imgFile.value = "";
  } else {
    imgFile.value = e[0];
  }
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
    billingImg: "",
    global: "",
    billId: "",
  };
  const amountRgx = /^(?!0)\d+$/;
  const costRgx = /^[1-9]\d*(\.\d+)?$/;

  if (!selectedPiece.value) return (errs.value.pieceName = "قم باختيار الجزء");

  if (!amountRgx.test(selectedNumber.value)) {
    return (errs.value.number = "قم بادخال عدد الاجزاء");
  }

  if (!costRgx.test(partCost.value)) {
    return (errs.value.cost = "قم بادخال تكلفة الجزء");
  }

  if (selectedNumber.value && selectedPiece.value && partCost.value) {
    const checkExists = productPieces.value.filter(
      (el) => el.id == selectedPiece.value.id
    );
    if (checkExists.length)
      return (errs.value.pieceName = "لقد قمت بادخال هذا الجزء بالفعل");
    let piece = selectedPiece.value;
    piece.number = selectedNumber.value;
    piece.cost = partCost.value;
    productPieces.value.push(piece);
    selectedPiece.value = null;
    selectedNumber.value = 0;
    partCost.value = 0;
  }
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
    billingImg: "",
    billId: "",
  };
  //
  if (!selectedSupplier.value)
    return (errs.value.supplierName = "قم بادخال اسم المورد");

  if (!packingList.value.billId)
    return (errs.value.billId = "قم بادخال رقم الفاتورة");
  if (!imgFile.value) return (errs.value.billingImg = "قم برفع صورة الفاتورة");
  if (!packingList.value.time) return (errs.value.time = "قم بادخال الوقت");
  if (!packingList.value.date) return (errs.value.date = "قم بادخال التاريخ");
  if (!productPieces.value.length)
    return (errs.value.global = "قم بادخال الاجزاء المستلمة");

  let pList = {
    supplyProcessDTO: {
      supplier: {
        id: selectedSupplier.value.id,
      },
      createdBy: {
        id: JSON.parse(localStorage.getItem("logger")),
      },
      notes: packingList.value.notes,
      billId: packingList.value.billId,
      locked: false,
      isFullDist: false,
      creationDate: new Date(
        `${packingList.value.date} ${packingList.value.time}`
      ),
    },
    partList: [],
    imgFile: imgFile.value,
  };
  productPieces.value.forEach((el) => {
    let pieceObj = {
      part: {
        id: el.id,
      },
      cost: parseFloat(el.cost),
      amount: parseFloat(el.number),
      isDist: false,
    };
    pList.partList.push(pieceObj);
  });
  loading.value = true;
  const doAddPlist = pListStore.doAddPlist;
  const reqCall = await doAddPlist(pList);
  loading.value = false;
  if (reqCall) {
    const saveNotif = notifsStore.saveNotif;
    const notification = {
      title: "فاتورة توريد جديدة",
      message: `قام ${loggerData.value.firstName} ${loggerData.value.lastName} بادخال توريدة جديدة برقم ${packingList.value.billId}`,
      readBy: loggerData.value.id.toString(),
      createdBy: {
        id: loggerData.value.id,
      },
      routeName: "/packing-lists",
      privilege: "addSupplierProcess",
    };
    await saveNotif(notification);
    emits("regetItems");
    dialog.value = false;
  }
};

// Hooks
onMounted(async () => {
  getSuppliers();
  getParts();
  const dateNow = new Date();
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
});

const deletePiece = (i) => {
  productPieces.value.splice(i, 1);
};
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
    background-color: rgb(114 49 116) !important;
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
