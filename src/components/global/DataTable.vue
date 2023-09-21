<template>
  <div class="data_table">
    <v-container class="mt-4" fluid>
      <div
        class="table_parent bg-white"
        :style="`height: ${props.windowHeight - 230}px;`"
      >
        <v-table
          class="w-100 text-center"
          v-if="
            !tableLoading && props.data.content && props.data.content.length
          "
          density="compact"
          fixed-header
          :height="props.windowHeight - 240"
        >
          <thead>
            <tr>
              <th
                v-for="(heading, i) in props.tableHeaders"
                :key="i"
                :class="(heading.type == 'img' && 'hide_on_excel') || ''"
              >
                {{ heading.text }}
              </th>
              <th class="hide_on_excel" v-if="props.actions.length">
                اتخاذ اجراء
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in props.data.content"
              :key="item.id"
              :style="`${
                props.rowCheck
                  ? item[props.rowCheck]
                    ? 'background: #dfdfdf; opacity: 0.5'
                    : 'unset'
                  : 'unset'
              }`"
            >
              <td
                v-for="(heading, i) in props.tableHeaders"
                :key="i"
                :style="`padding: ${props.padding}px 0px !important; direction: ltr !important`"
              >
                <span v-if="heading.type == 'text'">
                  <span v-if="heading.nested">
                    <span
                      v-if="
                        item[heading.value[0]][heading.value[1]][
                          heading.value[2]
                        ]
                      "
                    >
                      {{
                        item[heading.value[0]][heading.value[1]][
                          heading.value[2]
                        ].length > 29
                          ? item[heading.value[0]][heading.value[1]][
                              heading.value[2]
                            ].substring(0, 29)
                          : item[heading.value[0]][heading.value[1]][
                              heading.value[2]
                            ]
                      }}
                    </span>
                    <span
                      v-if="
                        !item[heading.value[0]][heading.value[1]][
                          heading.value[2]
                        ] && item[heading.value[0]][heading.value[1]]
                      "
                    >
                      {{
                        item[heading.value[0]][heading.value[1]].length > 29
                          ? item[heading.value[0]][heading.value[1]].substring(
                              0,
                              29
                            )
                          : item[heading.value[0]][heading.value[1]]
                      }}
                    </span>
                  </span>
                  <span v-else>
                    {{
                      item[heading.value].length > 30
                        ? item[heading.value].substring(0, 29) + "..."
                        : item[heading.value]
                    }}
                  </span>
                </span>
                <span v-else-if="heading.type == 'role'">
                  {{
                    heading.nested
                      ? item[heading.value[0]][heading.value[1]] == 1
                        ? "مسؤول"
                        : item[heading.value[0]][heading.value[1]] == 2
                        ? "مساعد مسؤول"
                        : "امين مخزن"
                      : item[heading.value]
                  }}
                </span>
                <span v-else-if="heading.type == 'date'">
                  {{
                    heading.nested
                      ? new Date(item[heading.value[0]][[heading.value[1]]])
                          .toISOString()
                          .split("T")[0]
                      : new Date(item[heading.value])
                          .toISOString()
                          .split("T")[0]
                  }}
                </span>
                <span v-else-if="heading.type == 'status'">
                  <span
                    v-if="heading.nested"
                    :style="`${
                      item[heading.value[0]][heading.value[1]] == 1
                        ? 'color: orange'
                        : item[heading.value[0]][heading.value[1]] == 2
                        ? 'color: green'
                        : 'color: red'
                    }`"
                  >
                    {{
                      item[heading.value[0]][heading.value[1]] == 1
                        ? "معلقة"
                        : item[heading.value[0]][heading.value[1]] == 2
                        ? "مقبولة"
                        : "مرفوضة"
                    }}
                  </span>
                  <span v-else>
                    {{
                      item[heading.check]
                        ? heading.checkText[0]
                        : heading.checkText[1]
                    }}
                  </span>
                </span>
                <span v-else-if="heading.type == 'number'">
                  {{
                    item[heading.value]
                      ? item[heading.value]
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : 0
                  }}
                </span>
                <span v-else>
                  <span v-if="heading.nested">
                    <img
                      v-if="
                        item[heading.value[0]][heading.value[1]][
                          heading.value[2]
                        ]
                      "
                      style="border-radius: 50%"
                      :src="
                        item[heading.value[0]][heading.value[1]][
                          [heading.value[2]]
                        ]
                          ? `data:image/jpg;base64,${
                              item[heading.value[0]][heading.value[1]][
                                [heading.value[2]]
                              ]
                            }`
                          : defaultImg
                      "
                      width="30"
                      height="30"
                      alt=""
                    />
                    <img
                      v-if="
                        !item[heading.value[0]][heading.value[1]][
                          heading.value[2]
                        ] && item[heading.value[0]][heading.value[1]]
                      "
                      style="border-radius: 50%"
                      :src="
                        item[heading.value[0]][heading.value[1]]
                          ? `data:image/jpg;base64,${
                              item[heading.value[0]][heading.value[1]]
                            }`
                          : defaultImg
                      "
                      width="30"
                      height="30"
                      alt=""
                    />
                    <span v-if="!item[heading.value[0]][heading.value[1]]"
                      >لايوجد</span
                    >
                  </span>
                  <span v-else>
                    <img
                      v-if="item[heading.value]"
                      style="border-radius: 50%"
                      :src="
                        item[heading.value]
                          ? `data:image/jpg;base64,${item[heading.value]}`
                          : defaultImg
                      "
                      width="30"
                      height="30"
                      alt=""
                    />
                    <span v-else>لايوجد</span>
                  </span>
                </span>
              </td>
              <td
                class="hide_on_excel"
                :style="`padding: ${props.padding}px 0px !important; width: 9%`"
                v-if="props.actions.length"
              >
                <v-icon
                  :id="`actionsMenu_${item.id}`"
                  color="blue"
                  style="cursor: pointer"
                  >mdi-dots-vertical</v-icon
                >
                <v-menu :activator="`#actionsMenu_${item.id}`" offset="15">
                  <v-list class="pa-2" elevation="3">
                    <div v-for="(action, i) in props.actions" :key="i">
                      <v-list-item
                        @click="$emit(action['emit'], item)"
                        :disabled="
                          action.checkProp
                            ? action.changeStatus
                              ? item[action.checkProp] == false
                                ? true
                                : false
                              : action.multiCheck
                              ? item[action.multi[0]] || !item[action.multi[1]]
                                ? true
                                : false
                              : item[action.checkProp]
                              ? true
                              : false
                            : false
                        "
                        v-if="
                          !action.needPriv ||
                          (action.needPriv &&
                            loggerData.userPrivileges &&
                            loggerData.userPrivileges[action.priv])
                        "
                      >
                        <v-list-item-title>
                          <v-icon
                            class="ml-3"
                            :color="
                              action['check']
                                ? item[action['check']]
                                  ? action['color'][0]
                                  : action['color'][1]
                                : action['color']
                            "
                            >{{
                              action["check"]
                                ? item[action["check"]]
                                  ? action["icon"][0]
                                  : action["icon"][1]
                                : action["icon"]
                            }}</v-icon
                          >
                          {{
                            action["check"]
                              ? item[action["check"]]
                                ? action["text"][0]
                                : action["text"][1]
                              : action["text"]
                          }}
                        </v-list-item-title>
                      </v-list-item>
                    </div>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div
          v-if="
            (!props.data.content && !tableLoading) ||
            (props.data.content && !props.data.content.length && !tableLoading)
          "
          :style="`min-height: ${props.windowHeight - 250}px`"
          class="no_data"
        >
          <p>لا توجد بيانات</p>
        </div>
        <v-progress-linear
          style="width: 100%"
          indeterminate
          color="rgb(69, 22, 70)"
          v-if="tableLoading"
        ></v-progress-linear>
      </div>
      <v-divider color="black"></v-divider>
      <v-row class="pt-4 align-center bg-white">
        <v-col cols="3" class="pt-2">
          <v-select
            :items="ranges"
            v-model="size"
            variant="outlined"
            :disabled="tableLoading"
            label="عدد النتائج"
            @update:model-value="
              (page = 1), $emit('refresh', { page: 1, size: size })
            "
            class="mr-3"
            style="transform: translateY(8px); width: 100px"
            v-if="props.data.content && props.data.content.length"
          />
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="props.data.content ? props.data.totalPages : 2"
            :total-visible="props.data.content ? props.data.size : 5"
            :disabled="tableLoading"
            prev-icon="mdi-chevron-right"
            next-icon="mdi-chevron-left"
            v-if="props.data.content && props.data.content.length"
            @update:model-value="$emit('refresh', { page: page, size: size })"
          >
          </v-pagination>
        </v-col>
      </v-row>
    </v-container>
    <v-menu activator="#menu-activator">
      <v-list elevation="3">
        <span v-for="(action, i) in bottomActions" :key="i">
          <v-list-item
            v-if="!action.check && !action.needPriv"
            :prepend-icon="action.icon"
            @click="$emit(action.emit)"
          >
            <v-list-item-title>{{ action.text }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="
              !action.check &&
              action.needPriv &&
              loggerData.userPrivileges &&
              loggerData.userPrivileges[action.priv]
            "
            :prepend-icon="action.icon"
            @click="$emit(action.emit)"
          >
            <v-list-item-title>{{ action.text }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="action.check && data.content && data.content.length"
            :prepend-icon="action.icon"
            @click="$emit(action.emit)"
          >
            <v-list-item-title>{{ action.text }}</v-list-item-title>
          </v-list-item>
        </span>
      </v-list>
    </v-menu>
    <v-icon
      id="menu-activator"
      style="
        position: fixed;
        left: 20px;
        bottom: 40px;
        z-index: 2;
        border-radius: 50%;
        padding: 30px;
        box-shadow: 0px 0px 15px -2px black;
        cursor: pointer;
        background: rgb(69, 22, 70);
        color: white;
      "
      >mdi-menu</v-icon
    >
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted, watch, defineEmits } from "vue";
import { authStore } from "@/stores/auth/auth";
import { storeToRefs } from "pinia";

// Init Stores
const authSt = authStore();
const { loggerData } = storeToRefs(authSt);

const page = ref(1);
const size = ref(8);
const ranges = ref([8, 16, 24, 40]);

// Props
const props = defineProps([
  "windowHeight",
  "data",
  "defaultImg",
  "tableHeaders",
  "actions",
  "bottomActions",
  "tableLoading",
  "ranges",
  "page",
  "size",
  "resetPage",
  "rowCheck",
  "padding",
]);

const emits = defineEmits("pageReset");

// Watchers
watch(
  () => props.resetPage,
  (newVal) => {
    if (newVal) {
      page.value = props.page;
      size.value = props.size;
      emits("pageReset");
    }
  }
);

// // Methods
// const timeFormat = (date) => {
//   var hours = date.getHours();
//   var minutes = date.getMinutes();
//   var ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12;
//   hours = hours ? hours : 12; // the hour '0' should be '12'
//   minutes = minutes < 10 ? "0" + minutes : minutes;
//   var strTime = `${hours}:${minutes} ${ampm}`;
//   return strTime;
// };

onMounted(() => {
  ranges.value = props.ranges;
  page.value = props.page;
  size.value = props.size;
});
</script>

<style lang="scss">
.data_table {
  .v-pagination__list {
    justify-content: flex-start;
  }
  .pagins_parent {
    padding: 0 10px 0 35px;
  }
  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      font-size: 25px;
      color: rgb(80, 80, 80);
    }
  }
  .v-table {
    font-size: 14px;
    thead {
      tr {
        th {
          text-align: center !important;
          background-color: rgb(121, 34, 138) !important;
          color: white !important;
          font-weight: bold !important;
        }
      }
    }
  }
}

.v-list-item__prepend > .v-icon {
  margin-inline-end: 10px !important;
}
</style>
