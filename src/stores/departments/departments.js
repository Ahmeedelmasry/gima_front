import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const departmentsModule = defineStore("departmentsModule", {
  state: () => ({
    departments: [],
    popupDeps: [],
    mainSt: mainStore(),
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetDepartments(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/department?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.departments = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupDeps(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/department?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.popupDeps = res.data.content.filter((el) => !el.locked);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddDepartment(department) {
      let isAdded;
      await Axios.post(`${this.mainSt.$state.apiLink}/department`, department)
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
    async doUpdateDepartment(department) {
      let success = false;
      await Axios.patch(`${this.mainSt.$state.apiLink}/department`, department)
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
