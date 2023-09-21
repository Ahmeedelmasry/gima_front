import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const storeRequests = defineStore("storeRequests", {
  state: () => ({
    mainSt: mainStore(),
    requests: [],
    supplyPending: [],
    supplyAccepted: [],
    supplyRejected: [],
    storePending: [],
    storeAccepted: [],
    storeRejected: [],
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetStoreRequests(reqData) {
      this.requests = [];
      let pageType = reqData.pageType;
      delete reqData.pageType;
      await Axios.get(
        `${mainStore().apiLink}/supplyProcessDist/getDistRequests?storeId=${
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
          if (pageType == "supplyPending") {
            this.supplyPending = res.data;
          }
          if (pageType == "supplyAccepted") {
            this.supplyAccepted = res.data;
          }
          if (pageType == "supplyRejected") {
            this.supplyRejected = res.data;
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
    async doAcceptRequest(callData) {
      let isAccepted;
      await Axios.post(
        `${mainStore().apiLink}/supplyProcessDist/acceptDistRequest?userId=${
          callData.userId
        }&requestId=${callData.requestId}&notes=`
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
    async doRejectRequest(callData) {
      let isAccepted;
      await Axios.post(
        `${mainStore().apiLink}/supplyProcessDist/rejectDistRequest?userId=${
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
