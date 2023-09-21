import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const productionReq = defineStore("productionReq", {
  state: () => ({
    allRequests: [],
    productParts: [],
    productDetailsErr: "",
    submitErr: "",
    singleRequestParts: [],
    usedParts: [],
    extraWasteParts: [],
    mainSt: mainStore(),
    reqParts: "",
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetAllReqs(callData) {
      this.allRequests = [];
      await Axios.get(
        `${
          this.mainSt.$state.apiLink
        }/productProcess/getAllProductionRequestByStore?storeId=${
          callData.storeId ? callData.storeId : ""
        }`
      )
        .then((res) => {
          this.allRequests = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetAllAdminReqs(callData) {
      this.allRequests = [];
      await Axios.get(
        `${
          this.mainSt.$state.apiLink
        }/productProcess/getAllProductionRequest?FromDate=${
          callData.fromDate
            ? new Date(callData.fromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.toDate
            ? new Date(
                new Date(callData.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&productId=${callData.productId ? callData.productId : ""}&requestId=${
          callData.requestId ? callData.requestId : ""
        }&isFullOut=${
          typeof callData.isFullOut != "undefined" ? callData.isFullOut : ""
        }`
      )
        .then((res) => {
          this.allRequests = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetProductDetails(callData) {
      this.productDetailsErr = "";
      this.productParts = [];
      await Axios.get(
        `${this.mainSt.$state.apiLink}/productProcess/productParts?productId=${callData.productId}&expectedAmount=${callData.amount}&storeId=${callData.storeId}`
      )
        .then((res) => {
          res.data.forEach((part) => {
            part.stores.forEach((store) => {
              store.selectedAmount = 0;
              store.errorMsg = "";
            });
            if (part.stores.length == 1) {
              part.selectedStores = part.stores;
            }
          });
          this.productParts = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          if (err.response) {
            this.productDetailsErr = err.response.data.message;
          } else {
            this.showAlert({
              type: 2,
              msg: err.response ? err.response.data.message : "مشكلة بالخادم",
            });
          }
        });
    },
    async doGetUsedParts(callData) {
      this.productDetailsErr = "";
      this.usedParts = [];
      await Axios.get(
        `${this.mainSt.$state.apiLink}/productProcess/productParts?productId=${callData.productId}&expectedAmount=${callData.amount}&storeId=${callData.storeId}`
      )
        .then((res) => {
          this.usedParts = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          if (err.response) {
            this.productDetailsErr = err.response.data.message;
          } else {
            this.showAlert({
              type: 2,
              msg: err.response ? err.response.data.message : "مشكلة بالخادم",
            });
          }
        });
    },
    async doGetExtraMinusParts(callData) {
      this.productDetailsErr = "";
      this.extraWasteParts = [];
      await Axios.get(
        `${this.mainSt.$state.apiLink}/productProcess/productParts?productId=${callData.productId}&expectedAmount=${callData.amount}&storeId=${callData.storeId}`
      )
        .then((res) => {
          this.extraWasteParts = res.data;
        })
        .catch((err) => {
          if (err.response) {
            this.productDetailsErr = err.response.data.message;
          } else {
            this.showAlert({
              type: 2,
              msg: err.response ? err.response.data.message : "مشكلة بالخادم",
            });
          }
        });
    },
    async doSubmitReq(callData) {
      let isSuccess;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/productProcess/productionRequest`,
        callData
      )
        .then((res) => {
          isSuccess = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isSuccess = false;
          if (err.response) {
            this.submitErr = err.response.data.message;
          } else {
            this.showAlert({
              type: 2,
              msg: err.response ? err.response.data.message : "مشكلة بالخادم",
            });
          }
        });
      return isSuccess;
    },
    async doCompleteReq(callData) {
      let isSuccess;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/productProcess/confirmProductionRequest?requestId=${callData.reqId}
        &exactlyAmount=${callData.exactlyAmount}`
      )
        .then((res) => {
          isSuccess = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isSuccess = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isSuccess;
    },
    async doGetRequestParts(reqId) {
      this.singleRequestParts = [];
      let isSuccess;
      await Axios.get(
        `${this.mainSt.$state.apiLink}/productProcess/getProductPartsByRequestId?requestId=${reqId}`
      )
        .then((res) => {
          isSuccess = true;
          this.singleRequestParts = res.data;
        })
        .catch((err) => {
          isSuccess = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isSuccess;
    },
    async doShowReqParts(callData) {
      let isSuccess;
      await Axios.get(
        `${this.mainSt.$state.apiLink}/productProcess/getRequestsByStoreAndRequestId?storeId=${callData.storeId}&requestId=${callData.requestId}`
      )
        .then((res) => {
          let filteredParts = res.data.filter((el) => !el.fullOut);
          filteredParts.forEach((part) => {
            part.enteredAmount = 0;
            part.errorMsg = "";
          });
          this.reqParts = filteredParts;
        })
        .catch((err) => {
          isSuccess = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isSuccess;
    },
    async doSubmitReqPartInserts(callData) {
      let isSuccess;
      await Axios.post(
        `${this.mainSt.$state.apiLink}/productProcess/confirmProductionRequestInStore`,
        callData
      )
        .then((res) => {
          isSuccess = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isSuccess = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isSuccess;
    },
    resetData() {
      this.submitErr = "";
      this.productDetailsErr = "";
      this.productParts = [];
    },
  },
});
