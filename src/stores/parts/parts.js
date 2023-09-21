import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const partsModule = defineStore("partsModule", {
  state: () => ({
    addPartSuccess: false,
    addPartErr: false,
    theParts: [],
    popupParts: [],
    partHistory: "",
    mainSt: mainStore(),
    partsReports: "",
    singlePart: "",
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetAllParts(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/part?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.theParts = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async DoGetPopupParts(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/part?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          res.data.content.forEach((part) => {
            part.errMsg = "";
            part.harmedAmountInserted = 0;
            part.selectedStores = [];
          });
          this.popupParts = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetSinglePart(partId) {
      let gotData = false;
      await Axios.get(`${this.mainSt.$state.apiLink}/part/${partId}`)
        .then((res) => {
          this.singlePart = res.data;
          gotData = true;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          gotData = false;
        });
      return gotData;
    },
    async doAddPart(part) {
      this.addPartSuccess = false;
      this.addPartErr = false;

      const formData = new FormData();
      const file = part.imgFile ? part.imgFile : new File([""], "");
      let info = part;
      info.isLocked = false;

      delete info.imgFile;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "POST",
        url: `${this.mainSt.$state.apiLink}/part`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          this.addPartSuccess = true;
          this.addPartErr = false;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          this.addPartSuccess = false;
          this.addPartErr = true;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doDeltePart(partId) {
      await Axios.delete(`${this.mainSt.$state.apiLink}/part/${partId}`)
        .then((res) => {
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
    },
    async doUpdatePart(part) {
      let updatedSucces = false;

      const formData = new FormData();
      const file = part.imgFile ? part.imgFile : new File([""], "");
      let info = part;
      delete info.imgFile;
      delete info.picture;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "PATCH",
        url: `${this.mainSt.$state.apiLink}/part`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          updatedSucces = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          updatedSucces = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return updatedSucces;
    },
    async doGetPartsReports(callData) {
      await Axios.get(
        `${
          this.mainSt.$state.apiLink
        }/supplyProcess/searchSupplyProcessByPart?partId=${
          callData.partId
        }&size=${callData ? callData.size : 10000}&page=${
          callData ? callData.page - 1 : 0
        }&FromDate=${
          callData.FromDate
            ? new Date(callData.FromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.ToDate
            ? new Date(
                new Date(callData.ToDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }&supplierId=${callData.supplierId ? callData.supplierId : ""}&billId=${
          callData.billId ? callData.billId : ""
        }`
      )
        .then((res) => {
          this.partsReports = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPartFullHistory(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/report/getFullPartDetails?partId=${
          callData.partId
        }&FromDate=${
          callData.FromDate
            ? new Date(callData.FromDate).toLocaleDateString()
            : ""
        }&ToDate=${
          callData.ToDate
            ? new Date(
                new Date(callData.ToDate).getTime() + 24 * 60 * 60 * 1000
              ).toLocaleDateString()
            : ""
        }`
      )
        .then((res) => {
          this.partHistory = res.data;
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
