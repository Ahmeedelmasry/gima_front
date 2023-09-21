import { saveAs } from "@/plugins/filesaver";
import { defineStore } from "pinia";
// Import Xlsx
import * as XLSX from "xlsx";

export const mainStore = defineStore("mainStore", {
  state: () => ({
    apiLink: "http://localhost:8081/GimaStore",
    err: false,
    success: false,
    errMsg: "",
    successMsg: "",
    globalLoading: true,
  }),
  actions: {
    showAlert(alertData) {
      this.err = false;
      this.success = false;
      this.errMsg = "";
      this.successMsg = "";
      if (alertData.type == 1) {
        this.success = true;
        this.successMsg = alertData.msg;
      } else {
        this.err = true;
        this.errMsg = alertData.msg;
      }
    },
    closeAlert() {
      this.err = false;
      this.success = false;
      this.errMsg = "";
      this.successMsg = "";
    },
    printTable(items, props, tableTitle) {
      props.reverse();
      const finalProps = [...new Set(props)];
      const PrintThis = require("print-js");
      PrintThis({
        printable: items,
        type: "json",
        properties: finalProps,
        gridHeaderStyle: "font-size: 13px;padding: 5px;border: 1px solid",
        gridStyle:
          "font-size: 13px;padding: 5px;border: 1px solid;text-align: center",
        header: tableTitle,
        headerStyle: "text-align: end",
      });
    },
    saveExcel(buffer, fn) {
      const EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const data = new Blob([buffer], { type: EXCEL_TYPE });
      saveAs(data, fn + " - " + new Date().toLocaleDateString() + ".xlsx");
    },
    exportExcel(arr, fileName, wscols) {
      const worksheet = XLSX.utils.json_to_sheet(arr);

      worksheet["!cols"] = wscols;
      const workbook = {
        Sheets: {
          data: worksheet,
        },
        SheetNames: ["data"],
      };
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      this.saveExcel(excelBuffer, fileName);
    },
  },
});
