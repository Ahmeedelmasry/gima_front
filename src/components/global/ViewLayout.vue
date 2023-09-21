<template>
  <div class="layout">
    <v-card class="w-100">
      <v-layout>
        <v-navigation-drawer
          location="right"
          class="text-white"
          color="rgb(60 22 68)"
          :rail="rail"
          permanent
          v-model="drawer"
        >
          <div
            class="logo-container d-flex align-center justify-space-around pt-5"
          >
            <div class="SLOGAN text-center" style="color: #b1b1b1" v-if="!rail">
              <h4>شركة جيما</h4>
              <h4 style="font-family: 'Material Design Icons'">
                JIMMA COMPANY
              </h4>
            </div>
            <img
              :style="`${
                rail ? 'width: 40px; height: 40px' : 'width: 60px; height: 60px'
              }; border-radius: 50%; transition: 0.2s all ease-in-out;
              filter: contrast(0.6);`"
              :src="logo"
              alt=""
            />
          </div>
          <v-divider class="mt-3" color="white"></v-divider>
          <!-- Drawer Routes -->
          <v-list nav>
            <div v-for="route in singleRoutes" :key="route.name">
              <v-list-item
                :prepend-icon="route.meta.icon"
                :title="route.meta.pageTitle"
                v-if="
                  (route.meta.insert && !route.meta.needPriv) ||
                  (route.meta.insert &&
                    route.meta.needPriv &&
                    loggerData.userPrivileges[route.meta.priv])
                "
                @click="router.push({ name: route.name })"
              >
              </v-list-item>
            </div>

            <!--  -->
            <v-list-group
              v-if="
                loggerData.userPrivileges &&
                loggerData.userPrivileges['haveReturns']
              "
            >
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-keyboard-return"
                  title="ادخال ارجاعات / هوالك"
                  value="ادخال ارجاعات / هوالك"
                ></v-list-item>
              </template>
              <v-list-item
                @click="openAddReturns = true"
                :style="`${rail ? 'padding-right: 10px !important' : ''}`"
              >
                <div class="d-flex align-center">
                  <v-list-item-title>ارجاعات</v-list-item-title>
                </div>
                <template v-slot:prepend>
                  <v-icon>mdi-keyboard-return</v-icon>
                </template>
              </v-list-item>
              <v-list-item
                @click="openAddHarmed = true"
                :style="`${rail ? 'padding-right: 10px !important' : ''}`"
              >
                <div class="d-flex align-center">
                  <v-list-item-title>هوالك</v-list-item-title>
                </div>
                <template v-slot:prepend>
                  <v-icon>mdi-minus-circle</v-icon>
                </template>
              </v-list-item>
            </v-list-group>
            <!--  -->

            <v-list-group v-if="!isAdmin">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-file-document-plus-outline"
                  title="طلبات توزيع توريدات"
                  value="طلبات توزيع توريدات"
                ></v-list-item>
              </template>
              <v-list-item
                v-for="route in groupedStRequestsRoutes"
                :key="route.name"
                @click="
                  router.push({
                    name: route.name,
                    params: { storeId: loggerData.storeId, statusId: 1 },
                  })
                "
                :style="`${rail ? 'padding-right: 10px !important' : ''}`"
              >
                <div class="d-flex align-center">
                  <v-list-item-title>{{ route.meta.title }}</v-list-item-title>
                </div>
                <template v-slot:prepend>
                  <v-icon>{{ route.meta.icon }}</v-icon>
                </template>
              </v-list-item>
            </v-list-group>
            <v-list-group v-if="!isAdmin">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-store-plus"
                  title="طلبات توزيع من مخزن"
                  value="طلبات توزيع من مخزن"
                ></v-list-item>
              </template>
              <v-list-item
                v-for="route in groupedStToStReqs"
                :key="route.name"
                @click="
                  router.push({
                    name: route.name,
                    params: { storeId: loggerData.storeId, statusId: 1 },
                  })
                "
                :style="`${rail ? 'padding-right: 10px !important' : ''}`"
              >
                <div class="d-flex align-center">
                  <v-list-item-title>{{ route.meta.title }}</v-list-item-title>
                </div>
                <template v-slot:prepend>
                  <v-icon>{{ route.meta.icon }}</v-icon>
                </template>
              </v-list-item>
            </v-list-group>
            <v-list-group
              v-if="
                loggerData.userPrivileges &&
                loggerData.userPrivileges['haveReports']
              "
            >
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-file-document-plus"
                  title="التقارير"
                  value="التقارير"
                ></v-list-item>
              </template>
              <v-list-item
                v-for="route in groupedReportsRoutes"
                :key="route.name"
                @click="router.push({ name: route.name })"
                :style="`${rail ? 'padding-right: 10px !important' : ''}`"
              >
                <div class="d-flex align-center">
                  <v-list-item-title>{{ route.meta.title }}</v-list-item-title>
                </div>
                <template v-slot:prepend>
                  <v-icon>{{ route.meta.icon }}</v-icon>
                </template>
              </v-list-item>
            </v-list-group>
            <v-list-group
              v-if="
                loggerData.userPrivileges &&
                loggerData.userPrivileges.haveEntities
              "
            >
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-folder-plus"
                  title="مدخلات النظام"
                  value="مدخلات النظام"
                ></v-list-item>
              </template>

              <div v-for="route in groupedAttatchRoutes" :key="route.name">
                <v-list-item
                  @click="router.push({ name: route.name })"
                  :style="`${rail ? 'padding-right: 10px !important' : ''}`"
                  v-if="loggerData.userPrivileges[route.meta.priv]"
                >
                  <div class="d-flex align-center">
                    <v-list-item-title>{{
                      route.meta.title
                    }}</v-list-item-title>
                  </div>
                  <template v-slot:prepend>
                    <v-icon>{{ route.meta.icon }}</v-icon>
                  </template>
                </v-list-item>
              </div>
            </v-list-group>
          </v-list>
          <!-- Drawer Routes -->
        </v-navigation-drawer>
        <v-main
          :style="`height: ${props.windowHeight}px;padding-top: 90px;overflow-y: auto`"
        >
          <slot></slot>
        </v-main>
        <v-app-bar
          color="rgb(60 22 68)"
          class="text-white py-2"
          density="compact"
          :style="`box-shadow: unset;
            border-bottom: 1px solid rgb(129, 129, 129);
            background-image: url(${barImg});
            background-size: cover;background-position: left top;`"
        >
          <template v-slot:prepend>
            <v-icon @click="toggleDrawer" v-if="!rail"
              >mdi-chevron-double-right</v-icon
            >
            <v-app-bar-nav-icon
              @click="toggleDrawer"
              v-else
            ></v-app-bar-nav-icon>
          </template>

          <!-- Notifications -->
          <v-btn size="xl" class="mx-5" id="openNotifsMenu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24.052"
              height="24.052"
              viewBox="0 0 20.552 21"
            >
              <g
                id="message_1_"
                data-name="message (1)"
                transform="translate(1 1)"
              >
                <g id="bell">
                  <line
                    id="Line_3"
                    data-name="Line 3"
                    x2="3"
                    transform="translate(8 19)"
                    fill="none"
                    stroke="#fff"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                  <path
                    id="Path_2642"
                    data-name="Path 2642"
                    d="M22.552,19.179H4a3.044,3.044,0,0,0,1.687-2.732V11.59A7.59,7.59,0,0,1,13.276,4h0a7.59,7.59,0,0,1,7.59,7.59v4.857a3.044,3.044,0,0,0,1.687,2.732Z"
                    transform="translate(-4 -4)"
                    fill="none"
                    stroke="#fff"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </g>
              </g>
            </svg>
            <v-badge
              :content="allNotifs.totalUnread"
              location="left top"
              offset-y="-12"
              color="red-darken-3"
              max="9"
              v-if="allNotifs.totalUnread"
            ></v-badge>
          </v-btn>
          <v-menu
            activator="#openNotifsMenu"
            offset="22"
            max-height="400"
            class="px-0"
            max-width="400"
          >
            <v-list
              v-if="allNotifs.notifications && allNotifs.notifications.length"
              class="pa-0"
            >
              <v-list-item
                v-for="notif in allNotifs.notifications"
                :key="notif.id"
                @click="updateNotif(notif)"
                class="px-1 py-0 my-2"
              >
                <v-card
                  class="px-3 py-0 my-2"
                  elevation="0"
                  :color="notif.isRead ? 'white' : 'red-darken-3'"
                  style="border: 1px solid rgb(171, 171, 171) !important"
                >
                  <v-card-title style="font-size: 17px; font-weight: bold">{{
                    notif.title
                  }}</v-card-title>
                  <v-card-text class="pb-2">
                    {{ notif.message }}
                  </v-card-text>
                  <v-divider
                    color="white"
                    length="100%"
                    class="mr-5 mt-2 mb-1"
                  ></v-divider>
                  <v-card-text
                    class="pt-0"
                    style="font-size: 11px; line-height: 1rem"
                  >
                    {{ new Date(notif.creationDate).toLocaleDateString() }}
                    <br />
                    {{
                      new Intl.DateTimeFormat("default", {
                        hour12: true,
                        hour: "numeric",
                        minute: "numeric",
                      }).format(new Date(notif.creationDate))
                    }}
                  </v-card-text>
                </v-card>
              </v-list-item>
              <v-list-item
                class="text-center my-3 text-black"
                @click="router.push({ name: 'theNotifications' })"
                base-color="red-darken-3"
                :active="true"
              >
                <v-list-item-title>عرض جميع الاشعارات</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-card v-else>
              <v-card-text>لا يوجد اشعارات</v-card-text>
            </v-card>
          </v-menu>

          <div v-for="(notif, i) in unreadNotifs" :key="notif.id">
            <v-snackbar
              v-model="notif.bar"
              location="right bottom"
              :style="`bottom: ${i * 180}px !important`"
              width="500"
              color="red-darken-3"
              class="pa-0"
            >
              <template v-slot:actions>
                <v-icon @click="notif.bar = false">mdi-close</v-icon>
              </template>
              <div
                @click="router.push(notif.routeName)"
                style="cursor: pointer"
              >
                <v-card-title
                  class="mb-2"
                  style="font-size: 17px; font-weight: bold"
                  >{{ notif.title }}</v-card-title
                >
                <v-card-text>{{ notif.message }}</v-card-text>
                <v-divider color="white"></v-divider>
                <v-divider color="white"></v-divider>
                <v-card-text
                  class="pt-1"
                  style="font-size: 11px; line-height: 1rem"
                >
                  {{ new Date(notif.creationDate).toLocaleDateString() }}
                  <br />
                  {{
                    new Intl.DateTimeFormat("default", {
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }).format(new Date(notif.creationDate))
                  }}
                </v-card-text>
              </div>
            </v-snackbar>
          </div>
          <!-- Notifications -->

          <v-avatar id="userMenu" class="ml-5" style="cursor: pointer">
            <v-img
              :src="
                loggerData.avatar
                  ? `data:image/jpg;base64,${loggerData.avatar}`
                  : avatarDefault
              "
              alt="John"
            ></v-img>
          </v-avatar>
          <v-menu activator="#userMenu" offset="15">
            <v-list class="pt-0" elevation="3">
              <v-list-item>
                <v-list-item-title>
                  مرحبا {{ loggerData.firstName }}
                  <img
                    :src="welcomeHand"
                    width="20"
                    alt=""
                    class="mr-1"
                    style="margin-bottom: -5px"
                  />
                </v-list-item-title>
              </v-list-item>
              <hr style="opacity: 0.5" />
              <v-list-item
                v-for="route in navRoutes"
                :key="route.name"
                @click="router.push({ name: route.name })"
              >
                <v-list-item-title>
                  <v-icon color="blue" class="ml-2">{{
                    route.meta.icon
                  }}</v-icon>
                  {{ route.meta.pageTitle }}</v-list-item-title
                >
              </v-list-item>
              <v-list-item @click="logout">
                <v-list-item-title>
                  <v-icon color="red" class="ml-2">mdi-logout</v-icon> تسجيل
                  خروج
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-app-bar>
        <v-app-bar
          color="rgb(60 22 68)"
          class="text-white pt-3 pb-1"
          density="compact"
          :style="`box-shadow: unset;
            border-bottom: 1px solid rgb(129, 129, 129);
            background-image: url(${barImg});
            background-size: contain;background-position: left top;`"
        >
          <v-breadcrumbs class="pr-5">
            {{ route.meta.group }}
            {{ route.meta.title ? " / " + route.meta.title : " /" }}
          </v-breadcrumbs>
          <v-spacer></v-spacer>
        </v-app-bar>
      </v-layout>
    </v-card>
    <AddHarmed
      v-if="openAddHarmed"
      @close_popup="openAddHarmed = false"
      :openPopup="openAddHarmed"
      :userId="loggerData.id"
    />
    <AddReturns
      v-if="openAddReturns"
      @close_popup="openAddReturns = false"
      :openPopup="openAddReturns"
      :userId="loggerData.id"
    />
    <audio id="audioPlayer" controls class="d-none">
      <source src="@/assets/sounds/notif-sound.wav" type="audio/mp3" />
      <source src="@/assets/sounds/notif-sound.wav" type="audio/wav" />
    </audio>
  </div>
</template>

<script setup>
import SockJS from "sockjs-client";
import Stomp from "webstomp-client";

import { ref, defineProps, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authStore } from "@/stores/auth/auth";
import { storeToRefs } from "pinia";
import { notifsModule } from "@/stores/notifications/notifs";

import AddHarmed from "@/components/add_returns/AddHarmed";
import AddReturns from "@/components/add_returns/AddReturns";

// Init Store
const authSt = authStore();
const notifStore = notifsModule();

// Data
const { loggerData } = storeToRefs(authSt);
const { allNotifs } = storeToRefs(notifStore);
const route = useRoute();
const router = useRouter();
const routes = ref(router.options.routes);
const welcomeHand = require("@/assets/small-hands.png");
const drawer = ref(true);
const rail = ref(false);
const openAddHarmed = ref(false);
const openAddReturns = ref(false);
const barImg = require("@/assets/nav-ground.png");
const avatarDefault = require("@/assets/user.png");
const logo = require("@/assets/logo.jpg");

const socket = ref("");
const stompClient = ref("");

// Computed
const singleRoutes = computed(() => {
  if (loggerData.value.role) {
    const routesArr = routes.value.filter((el) => {
      return loggerData.value.role.id == (1 || 2)
        ? !el.meta.groupInclude && el.meta.admin
        : !el.meta.groupInclude && !el.meta.admin;
    });
    return routesArr;
  }
  return [];
});

const navRoutes = computed(() => {
  return routes.value.filter((el) => el.meta.navInclude);
});

const groupedAttatchRoutes = computed(() => {
  return routes.value.filter(
    (el) => el.meta.groupInclude && el.meta.groupTitle == "entities"
  );
});

const groupedReportsRoutes = computed(() => {
  return routes.value.filter(
    (el) => el.meta.groupInclude && el.meta.groupTitle == "reports"
  );
});

const groupedStRequestsRoutes = computed(() => {
  return routes.value.filter(
    (el) => el.meta.groupInclude && el.meta.groupTitle == "supplyDistReqs"
  );
});
const groupedStToStReqs = computed(() => {
  return routes.value.filter(
    (el) => el.meta.groupInclude && el.meta.groupTitle == "storeDistReqs"
  );
});
const isAdmin = computed(() => {
  if (loggerData.value.role) {
    return loggerData.value.role.id == 1 || loggerData.value.role.id == 2
      ? true
      : false;
  }
  return false;
});

// Get Unread Notifs
const unreadNotifs = computed(() => {
  let unread = [];
  if (allNotifs.value.notifications) {
    unread = allNotifs.value.notifications.filter(
      (el) =>
        el.bar &&
        new Date().getTime() - new Date(el.creationDate).getTime() < 10000
    );
  }
  console.log("unread", unread);
  return unread;
});

// Props
const props = defineProps(["windowHeight"]);

// Methods
const toggleDrawer = () => {
  rail.value = !rail.value;
};

const logout = () => {
  stompClient.value.unsubscribe(localStorage.getItem("logger"));
  localStorage.removeItem("logger");
  router.push({ name: "log_in" });
};

const updateNotif = async (notif) => {
  if (!notif.isRead) {
    const doUpdateNotif = notifStore.doUpdateNotif;
    const callObj = {
      userId: localStorage.getItem("logger"),
      notifId: notif.id,
    };
    await doUpdateNotif(callObj);
  }
  if (notif.routeName) {
    router.push(notif.routeName);
  }
};

onMounted(async () => {
  if (localStorage.getItem("logger")) {
    const getAllNotifs = notifStore.getAllNotifs;
    const fillData = notifStore.fillData;
    socket.value = new SockJS("http://localhost:8081/GimaStore/our-websocket");
    stompClient.value = Stomp.over(socket);
    stompClient.value.connect({}, async function () {
      stompClient.value.subscribe(
        `/topic/message/${localStorage.getItem("logger")}`,
        (message) => {
          console.log(JSON.parse(message.body));
          fillData(JSON.parse(message.body));
          const newNotifs = allNotifs.value.notifications.filter(
            (el) =>
              new Date().getTime() - new Date(el.creationDate).getTime() <
                2000 && !el.isRead
          );
          if (newNotifs.length) {
            document.getElementById("audioPlayer").play();
          }
        }
      );
      await getAllNotifs(JSON.parse(localStorage.getItem("logger")));
    });
  }
});
</script>

<style lang="scss">
.layout {
  .v-list-item__prepend > .v-icon {
    margin-left: 10px !important;
  }
  .v-list-group__items .v-list-item {
    padding-right: 33px !important;
  }
  .v-list .v-list-item--nav:not(:only-child) {
    margin-bottom: 0 !important;
    padding-top: 0;
    padding-bottom: 0;
  }
}
.v-list-item__prepend > .v-icon {
  margin-inline-end: 10px !important;
}
</style>
