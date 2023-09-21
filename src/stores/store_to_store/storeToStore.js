import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const storeToStoreModule = defineStore("storeToStoreModule", {
  state: () => ({
    mainSt: mainStore(),
    requests: [],
    storePending: [],
    storeAccepted: [],
    storeRejected: [],
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetStoreToStoreRequests(reqData) {
      this.requests = [];
      let pageType = reqData.pageType;
      delete reqData.pageType;
      await Axios.get(
        `${mainStore().apiLink}/storesPartsDist/getDistRequests?storeIdTo=${
          reqData.storeId
        }&statusId=${reqData.statusId}&page=${reqData.page - 1}&partId=${
          reqData.partId
        }&fromDate=${
          reqData.fromDate
            ? new Date(reqData.fromDate).toLocaleDateString()
            : ""
        }&size=${reqData.size}&toDate=${
          reqData.toDate
            ? new Date(
                Date.now(reqData.toDate) + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }`
      )
        .then((res) => {
          if (pageType == "storePending") {
            this.storePending = res.data;
          }
          if (pageType == "storeAccepted") {
            this.storeAccepted = res.data;
          }
          if (pageType == "storeRejected") {
            this.storeRejected = res.data;
          }
          this.requests = res.data;
        })
        .catch((err) =>
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          })
        );
    },
    async doConfirmDist(data) {
      let isConfirmed = false;
      await Axios.post(`${mainStore().apiLink}/storesPartsDist`, data)
        .then((res) => {
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
          isConfirmed = true;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          isConfirmed = false;
        });
      return isConfirmed;
    },
    async doAcceptStoreDistReq(callData) {
      let isAccepted;
      await Axios.post(
        `${mainStore().apiLink}/storesPartsDist/acceptDistRequest?userId=${
          callData.userId
        }&requestId=${callData.requestId}&notes=''`
      )
        .then((res) => {
          isAccepted = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isAccepted = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isAccepted;
    },
    async doRejectStoreDistReq(callData) {
      let isAccepted;
      await Axios.post(
        `${mainStore().apiLink}/storesPartsDist/rejectDistRequest?userId=${
          callData.userId
        }&requestId=${callData.requestId}&notes=${callData.notes}`
      )
        .then((res) => {
          isAccepted = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isAccepted = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isAccepted;
    },
  },
});
