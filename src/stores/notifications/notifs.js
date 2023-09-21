import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const notifsModule = defineStore("notifsModule", {
  state: () => ({
    allNotifs: [],
    pageNotifs: "",
  }),
  actions: {
    async saveNotif(notif) {
      await Axios.post(`${mainStore().$state.apiLink}/notification`, notif)
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          const showAlert = mainStore().showAlert;
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return this.loggerData;
    },
    async getAllNotifs(userId) {
      await Axios.get(
        `${
          mainStore().$state.apiLink
        }/notification/notifyByUser?userId=${userId}&size=10&page=0`
      ).catch((err) => {
        const showAlert = mainStore().showAlert;
        showAlert({
          type: 2,
          msg: err.response ? err.response.data.message : "مشكلة بالخادم",
        });
      });
      return this.loggerData;
    },
    async getPageNotifs(data) {
      await Axios.get(
        `${
          mainStore().$state.apiLink
        }/notification/getAllNotifications?userId=${data.userId}&size=${
          data.size ? data.size : 1000
        }&page=${data.page ? data.page - 1 : 0}`
      )
        .then((res) => {
          res.data.content.forEach((notif) => {
            let readStatus = notif.readBy
              .split(",")
              .filter((el) => el == localStorage.getItem("logger"));
            if (readStatus.length) {
              notif.isRead = true;
            } else {
              notif.isRead = false;
            }
          });
          this.pageNotifs = res.data;
        })
        .catch((err) => {
          const showAlert = mainStore().showAlert;
          showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return this.loggerData;
    },
    fillData(notifs) {
      notifs.notifications.forEach((notif) => {
        let readStatus = notif.readBy
          .split(",")
          .filter((el) => el == localStorage.getItem("logger"));
        if (readStatus.length) {
          notif.isRead = true;
        } else {
          notif.isRead = false;
        }
        notif.bar = true;
      });
      notifs.notifications = notifs.notifications.slice(0, 3);
      this.allNotifs = notifs;
      console.log(this.allNotifs);
    },
    async doUpdateNotif(data) {
      await Axios.patch(
        `${
          mainStore().$state.apiLink
        }/notification/updateNotification?notificationId=${
          data.notifId
        }&userId=${data.userId}`
      )
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
    },
  },
});
