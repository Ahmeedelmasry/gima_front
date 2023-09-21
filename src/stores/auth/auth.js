import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const authStore = defineStore("authStore", {
  state: () => ({
    loggerData: "",
    loginErr: "",
  }),
  actions: {
    async doLogin(credetials) {
      this.loginErr = "";
      await Axios.post(
        `${mainStore().$state.apiLink}/login?username=${
          credetials.userName
        }&password=${credetials.password}`
      )
        .then((res) => {
          this.loggerData = res.data;
          localStorage.setItem("logger", res.data.id);
        })
        .catch((err) => {
          this.loginErr = err.response.data.message;
        });
      return this.loggerData;
    },
    async doGetLoggerData(uId) {
      let success;
      await Axios.get(`${mainStore().$state.apiLink}/user/${uId}`)
        .then((res) => {
          this.loggerData = res.data;
          success = true;
        })
        .catch((err) => {
          const showAlert = mainStore().showAlert;
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
          success = false;
        });
      return success;
    },
  },
});
