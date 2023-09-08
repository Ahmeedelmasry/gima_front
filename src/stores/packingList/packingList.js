import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const pListModule = defineStore("pListModule", {
  state: () => ({
    mainSt: mainStore(),
    pLists: [],
    singleList: "",
    returnedReports: [],
    allBillIds: [],
    harmSelectedPlistParts: [],
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doAddPlist(pListData) {
      let isAdded;
      const formData = new FormData();
      const file = pListData.imgFile;
      let info = pListData;

      delete info.imgFile;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "POST",
        url: `${mainStore().$state.apiLink}/supplyProcess`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          isAdded = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isAdded = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isAdded;
    },
    async doGetSingleList(listId) {
      let isFound;
      await Axios.get(`${mainStore().$state.apiLink}/supplyProcess/${listId}`)
        .then((res) => {
          let data = res.data.supplyProcessParts;
          let enableDelete = true;
          for (let i = 0; i < data.parts.length; i++) {
            if (data.parts[i].partialDist) {
              enableDelete = false;
              break;
            }
          }
          data.parts.forEach((part) => (part.stores = []));
          data.enableDelete = enableDelete;
          this.singleList = data;
          isFound = true;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          isFound = false;
        });
      return isFound;
    },
    async doUpdateList(pListData) {
      let isUpdated;
      const formData = new FormData();
      const file = pListData.imgFile ? pListData.imgFile : new File([""], "");
      let info = pListData;

      delete info.imgFile;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "PATCH",
        url: `${mainStore().$state.apiLink}/supplyProcess`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          isUpdated = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isUpdated = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isUpdated;
    },
    async doDeletePlist(listId) {
      let success;
      await Axios.delete(
        `${mainStore().$state.apiLink}/supplyProcess/${listId}`
      )
        .then((res) => {
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
          success = true;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          success = false;
        });
      return success;
    },
    async doGetSearchResults(searchData) {
      await Axios.get(
        `${mainStore().apiLink}/supplyProcess/searchSupplyProcess?page=${
          searchData.page - 1
        }&fromDate=${
          searchData.supplyProcessFromDate
            ? new Date(searchData.supplyProcessFromDate).toLocaleDateString()
            : ""
        }&size=${searchData.size}&toDate=${
          searchData.supplyProcessToDate
            ? new Date(
                Date.now(searchData.supplyProcessToDate) + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&supplierId=${
          searchData.supplierId ? searchData.supplierId : ""
        }&billId=${searchData.billId ? searchData.billId : ""}&status=${
          searchData.status == 1 ? true : searchData.status == 2 ? false : ""
        }`
      )
        .then((res) => {
          this.pLists = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doDistList(data) {
      let isDist;
      await Axios.post(`${mainStore().$state.apiLink}/supplyProcessDist`, data)
        .then(() => {
          isDist = true;
        })
        .catch((err) => {
          isDist = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isDist;
    },
    async doSubmitReturns(callData) {
      let success;
      await Axios.post(
        `${mainStore().$state.apiLink}/supplyProcess/supplyProcessReturns`,
        callData
      )
        .then(() => {
          success = true;
        })
        .catch(() => {
          success = false;
        });
      return success;
    },
    async doGetPlistsReturns(searchData) {
      await Axios.get(
        `${mainStore().apiLink}/report/getSupplyProcessPartsReturns?page=${
          searchData.page ? searchData.page - 1 : 0
        }&FromDate=${
          searchData.FromDate
            ? new Date(searchData.FromDate).toLocaleDateString()
            : ""
        }&size=${searchData.size}&ToDate=${
          searchData.ToDate
            ? new Date(
                new Date(searchData.ToDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&supplyProcessId=${
          searchData.supplyProcessId ? searchData.supplyProcessId : ""
        }&partId=${searchData.partId ? searchData.partId : ""}`
      )
        .then((res) => {
          this.returnedReports = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async getAllPlistsIds() {
      await Axios.get(
        `${mainStore().apiLink}/supplyProcess/getAllSupplyProcessBillIds`
      )
        .then((res) => {
          this.allBillIds = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    async getSelectedPlistParts(billId) {
      await Axios.get(
        `${
          mainStore().apiLink
        }/supplyProcess/getPartsBySupplyProcessBillId?billId=${billId}`
      )
        .then((res) => {
          this.harmSelectedPlistParts = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
});
