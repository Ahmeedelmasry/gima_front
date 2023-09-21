import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const productsExport = defineStore("productsExport", {
  state: () => ({
    mainSt: mainStore(),
    allReqs: "",
    reqExportedProducts: [],
    soldInDetails: [],
    soldTotal: "",
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetAllExportReqs(data) {
      await Axios.get(
        `${mainStore().apiLink}/productOut/getAllProductOut?page=${
          data.page ? data.page - 1 : 0
        }&size=${data.size ? data.size : 1000}&FromDate=${
          data.fromDate ? new Date(data.fromDate).toLocaleDateString() : ""
        }&ToDate=${
          data.toDate
            ? new Date(
                new Date(data.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&requestId=${data.requestId ? data.requestId : ""}&driverName=${
          data.driverName ? data.driverName : ""
        }&responsibleBy=${data.responsibleBy ? data.responsibleBy : ""}`
      )
        .then((res) => {
          this.allReqs = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddNewExportReq(callData) {
      let isAdded;
      await Axios.post(`${mainStore().apiLink}/productOut`, callData)
        .then((res) => {
          isAdded = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isAdded;
    },
    async doGetReqExportedProducts(reqId) {
      this.reqExportedProducts = [];
      await Axios.get(`${mainStore().apiLink}/productOut/${reqId}`)
        .then((res) => {
          this.reqExportedProducts = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doUpdateExportingReq(callData) {
      let success = false;
      await Axios.patch(`${this.mainSt.$state.apiLink}/productOut`, callData)
        .then((res) => {
          success = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
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
    // Reports
    async doGetSoldProductsInDetails(data) {
      await Axios.get(
        `${mainStore().apiLink}/report/getProductsOut?page=${
          data.page ? data.page - 1 : 0
        }&size=${data.size ? data.size : 1000}&FromDate=${
          data.fromDate ? new Date(data.fromDate).toLocaleDateString() : ""
        }&ToDate=${
          data.toDate
            ? new Date(
                new Date(data.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&productId=${data.productId ? data.productId : ""}`
      )
        .then((res) => {
          this.soldInDetails = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetSoldProductsInTotal(data) {
      await Axios.get(
        `${mainStore().apiLink}/report/getProductBalance?FromDate=${
          data.fromDate ? new Date(data.fromDate).toLocaleDateString() : ""
        }&ToDate=${
          data.toDate
            ? new Date(
                new Date(data.toDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&productId=${data.productId ? data.productId : ""}`
      )
        .then((res) => {
          this.soldTotal = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
  },
});
