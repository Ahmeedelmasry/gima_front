import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const storesModule = defineStore("storesModule", {
  state: () => ({
    addStoreSuccess: false,
    addStoreErr: false,
    theStores: [],
    popupStores: [],
    supervisors: [],
    popupSupervisors: [],
    singleStore: "",
    mainSt: mainStore(),
    settlementReport: "",
  }),
  actions: {
    async doGetSupervisors() {
      await Axios.get(`${this.mainSt.apiLink}/user/getByRoleId/3`)
        .then((res) => {
          this.supervisors = res.data;
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupSupers() {
      await Axios.get(`${this.mainSt.apiLink}/user/getByRoleId/3`)
        .then((res) => {
          this.popupSupervisors = res.data;
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async dogetAllStores(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/store?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.theStores = res.data;
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupStores(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/store?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          res.data.content.forEach((st) => (st.errMsg = ""));
          this.popupStores = res.data;
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddStore(storeData) {
      this.addStoreSuccess = false;
      this.addStoreErr = false;
      storeData.locked = false;
      await Axios.post(`${this.mainSt.$state.apiLink}/store`, storeData)
        .then((res) => {
          this.addStoreSuccess = true;
          this.addStoreErr = false;
          this.mainSt.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          this.addStoreSuccess = false;
          this.addStoreErr = true;
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doDeleteStore(storeId) {
      await Axios.delete(`${this.mainSt.$state.apiLink}/store/${storeId}`)
        .then((res) => {
          this.mainSt.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doUpdateStore(store) {
      let success = false;
      await Axios.patch(`${this.mainSt.$state.apiLink}/store`, store)
        .then((res) => {
          success = true;
          this.mainSt.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          success = false;
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return success;
    },
    async doViewStore(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/store/getStoreParts?storeId=${
          callData.storeId
        }&page=${callData.page - 1}&size=${callData.size}
       `
      )
        .then((res) => {
          if (res.data.content.length) {
            res.data.content.map((el) => (el.currentAmount = el.amount));
          }
          this.singleStore = res.data;
        })
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doSettleStore(callData) {
      let success = false;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/store/storePartsSettlement`,
        callData
      )
        .then((res) => {
          success = true;
          this.mainSt.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          success = false;
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return success;
    },
    async doGetSettlementsReports(reqData) {
      await Axios.get(
        `${mainStore().apiLink}/report/settlementReport?storeId=${
          reqData.storeId
        }&page=${reqData.page - 1}&FromDate=${
          reqData.FromDate
            ? new Date(reqData.FromDate).toLocaleDateString()
            : ""
        }&size=${reqData.size}&ToDate=${
          reqData.ToDate
            ? new Date(
                new Date(reqData.ToDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }`
      )
        .then((res) => (this.settlementReport = res.data))
        .catch((err) => {
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetStoreByPart(partId) {
      let result;
      await Axios.get(
        `${mainStore().apiLink}/store/getStoresByPart?partId=${partId}`
      )
        .then((res) => {
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].returnedAmount = 0;
          }
          result = res.data;
        })
        .catch((err) => {
          result = "";
          this.mainSt.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return result;
    },
  },
});
