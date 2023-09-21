import { defineStore } from "pinia";
import { mainStore } from "@/stores";
import Axios from "axios";

export const productModule = defineStore("productModule", {
  state: () => ({
    products: [],
    popupProducts: [],
    mainSt: mainStore(),
    singleProduct: "",
  }),
  actions: {
    showAlert(data) {
      this.mainSt.showAlert(data);
    },
    async doGetAllProducts(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/product?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.products = res.data;
          console.log(res.data);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doGetPopupProducts(callData) {
      await Axios.get(
        `${this.mainSt.$state.apiLink}/product?size=${
          callData ? callData.size : 10000
        }&page=${callData ? callData.page - 1 : 0}`
      )
        .then((res) => {
          this.popupProducts = res.data.content.filter((el) => !el.locked);
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doAddProduct(product) {
      let isAdded;
      const formData = new FormData();
      const file = product.picture;
      let info = product;

      delete info.picture;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "POST",
        url: `${this.mainSt.$state.apiLink}/product`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
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
    async doDeleteProduct(productId) {
      let isDeleted;
      await Axios.delete(`${this.mainSt.$state.apiLink}/product/${productId}`)
        .then((res) => {
          isDeleted = true;
          this.showAlert({
            type: 1,
            msg: res.data.message,
          });
        })
        .catch((err) => {
          isDeleted = false;
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
      return isDeleted;
    },
    async doGetProductParts(productId) {
      this.singleProduct = "";
      await Axios.get(`${this.mainSt.$state.apiLink}/product/${productId}`)
        .then((res) => {
          this.singleProduct = res.data;
        })
        .catch((err) => {
          this.showAlert({
            type: 2,
            msg: err.response ? err.response.data.message : "مشكلة بالخادم",
          });
        });
    },
    async doUpdateProduct(product) {
      let isAdded;
      const formData = new FormData();
      const file = product.picture;
      let info = product;

      delete info.picture;

      formData.append("picture", file);
      formData.append("stringDto", JSON.stringify(info));

      await Axios({
        data: formData,
        method: "PATCH",
        url: `${this.mainSt.$state.apiLink}/product`,
        headers: {
          Accept: "application/json",
          "Content-type": "*multi/form-data",
        },
      })
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
  },
});
