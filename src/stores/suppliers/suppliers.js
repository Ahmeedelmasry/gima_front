import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const suppliersModule = defineStore("suppliersModule", {
  state: () => ({
    addSupplierSuccess: false,
    addSupplierErr: false,
    suppliers: [],
    popupSuppliers: [],
    mainSt: mainStore(),
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetSuppliers(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/supplier?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.suppliers = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupSuppliers(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/supplier?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.popupSuppliers = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddSupplier(storeData) {
      this.addSupplierSuccess = false;
      this.addSupplierErr = false;
      storeData.locked = false;
      await Axios.post(`${this.mainSt.$state.apiLink}/supplier`, storeData)
        .then((res) => {
          this.addSupplierSuccess = true;
          this.addSupplierErr = false;
          this.showAlert(
            {
              type: 1,
              msg: res.data.message,
            },
            "hoba"
          );
        })
        .catch((err) => {
          this.addSupplierSuccess = false;
          this.addSupplierErr = true;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doDeleteSupplier(storeId) {
      await Axios.delete(`${this.mainSt.$state.apiLink}/supplier/${storeId}`)
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
    async doUpdateSupplier(supplier) {
      let success = false;
      await Axios.patch(`${this.mainSt.$state.apiLink}/supplier`, supplier)
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
  },
});
