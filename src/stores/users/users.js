import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

const mainSt = mainStore();

// popup actions
const showAlert = mainSt.showAlert;

export const addUserStore = defineStore("userStore", {
  state: () => ({
    users: [],
    addUserSuccess: false,
    addUserErr: false,
  }),
  actions: {
    async doGetAllUsers(callData) {
      this.addUserSuccess = false;
      this.addUserErr = false;
      await Axios.get(
        `${mainSt.$state.apiLink}/user?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.users = res.data;
        })
        .catch((err) => {
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddUser(uInfo) {
      this.addUserSuccess = false;
      this.addUserErr = false;
      const formData = new FormData();
      const file = new File([""], "");
      delete uInfo.avatar;
      uInfo.isLocked = false;
      const info = uInfo;
      formData.append("avatar", file);
      formData.append("stringDto", JSON.stringify(info));
      await Axios({
        data: formData,
        method: "POST",
        url: `${mainSt.$state.apiLink}/user`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          this.addUserSuccess = true;
          this.addUserErr = false;

          showAlert({ type: 1, msg: res.data.message });
        })
        .catch((err) => {
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doUpdateUser(uInfo) {
      let updatedSucces = false;
      const formData = new FormData();
      const file = uInfo.imgFile ? uInfo.imgFile : new File([""], "");
      let info = uInfo;
      delete info.imgFile;
      delete info.avatar;

      formData.append("avatar", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "PATCH",
        url: `${mainSt.$state.apiLink}/user`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
        .then((res) => {
          showAlert({ type: 1, msg: res.data.message });
          updatedSucces = true;
        })
        .catch((err) => {
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          updatedSucces = false;
        });
      return updatedSucces;
    },
  },
});
