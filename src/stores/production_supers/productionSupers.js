import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const supersModule = defineStore("supersModule", {
  state: () => ({
    supers: [],
    popupSupers: [],
    mainSt: mainStore(),
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetSupers(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/supervisor?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.supers = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupSupers(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/supervisor?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.popupSupers = res.data.content.filter((el) => !el.locked);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddSuper(superData) {
      let isAdded;
      await Axios.post(`${this.mainSt.$state.apiLink}/supervisor`, superData)
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
    async doUpdateSupervisor(supervisor) {
      let success = false;
      await Axios.patch(`${this.mainSt.$state.apiLink}/supervisor`, supervisor)
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
