import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const productionReturns = defineStore("productionReturns", {
  state: () => ({
    remainingParts: [],
    allIds: [],
    returnErr: "",
    submitErr: "",
    mainSt: mainStore(),
    allHarmed: [],
    totalHarmed: [],
    allReturned: [],
    totalReturns: [],
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doSubmitHarmedParts(callData) {
      let success = false;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/returns/addHarmedParts`,
        callData
      )
        .then((res) => {
          success = true;
          this.showAlert({
            type: 1,
            msg: res.data,
          });
        })
        .catch((err) => {
          success = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return success;
    },
    async doSubmitReturns(callData) {
      let success = false;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/returns/addReturnedParts`,
        callData
      )
        .then((res) => {
          success = true;
          this.showAlert({
            type: 1,
            msg: res.data,
          });
        })
        .catch((err) => {
          success = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return success;
    },
    async doGetHarmedParts(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/returns/getHarmedParts?FromDate=${
          callData.fromDate
            ? new Date(callData.fromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.toDate
            ? new Date(
                new Date(callData.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&partId=${callData.partId ? callData.partId : ""}&page=${
          callData.page ? callData.page - 1 : 0
        }&size=${callData.size ? callData.size : 1000}`
      )
        .then((res) => {
          this.allHarmed = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetReturns(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/returns/getReturnedParts?FromDate=${
          callData.fromDate
            ? new Date(callData.fromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.toDate
            ? new Date(
                new Date(callData.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&partId=${callData.partId ? callData.partId : ""}&storeId=${
          callData.storeId ? callData.storeId : ""
        }&page=${callData.page ? callData.page - 1 : 0}&size=${
          callData.size ? callData.size : 1000
        }`
      )
        .then((res) => {
          this.allReturned = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetReturnsTotal(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/returns/getTotalReturnedParts?FromDate=${
          callData.fromDate
            ? new Date(callData.fromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.toDate
            ? new Date(
                new Date(callData.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&partId=${callData.partId ? callData.partId : ""}&page=${
          callData.page ? callData.page - 1 : 0
        }&size=${callData.size ? callData.size : 1000}`
      )
        .then((res) => {
          this.totalReturns = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetTotalHarmed(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/returns/getTotalHarmedParts?FromDate=${
          callData.fromDate
            ? new Date(callData.fromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.toDate
            ? new Date(
                new Date(callData.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&partId=${callData.partId ? callData.partId : ""}&page=${
          callData.page ? callData.page - 1 : 0
        }&size=${callData.size ? callData.size : 1000}`
      )
        .then((res) => {
          this.totalHarmed = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    resetData() {
      this.submitErr = "";
      this.productDetailsErr = "";
      this.remainingParts = [];
    },
  },
});
