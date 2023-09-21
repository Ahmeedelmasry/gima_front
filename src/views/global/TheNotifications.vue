<template>
  <div class="notifs">
    <v-container class="pt-10">
      <v-card
        elevation="0"
        :max-height="windowHeight - 270"
        :min-height="windowHeight - 270"
        style="overflow-y: auto"
        class="pa-5"
        :loading="loading"
      >
        <v-row v-if="pageNotifs && pageNotifs.content.length && !loading">
          <v-col cols="12" v-for="notif in pageNotifs.content" :key="notif.id">
            <v-card
              :class="['w-100']"
              elevation="0"
              :color="notif.isRead ? 'white' : 'red-darken-3'"
              @click="updateNotif(notif)"
              style="border: 1px solid rgb(171, 171, 171) !important"
            >
              <v-card-title
                class="mb-2"
                style="font-size: 17px; font-weight: bold"
                >{{ notif.title }}</v-card-title
              >
              <v-card-text>{{ notif.message }}</v-card-text>
              <v-divider color="black"></v-divider>
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
            </v-card>
          </v-col>
        </v-row>
        <v-divider
          color="black"
          v-if="pageNotifs && pageNotifs.content.length"
        ></v-divider>
      </v-card>
      <v-divider
        color="black"
        v-if="pageNotifs && pageNotifs.content.length"
      ></v-divider>
      <v-card elevation="0">
        <v-row
          class="pt-4 mt-7 align-center bg-white"
          v-if="pageNotifs && pageNotifs.content.length"
        >
          <v-col cols="3" class="pt-2">
            <v-select
              :items="range"
              v-model="size"
              variant="outlined"
              label="عدد النتائج"
              class="mr-3"
              @update:model-value="getNotifs"
              style="transform: translateY(8px); width: 100px"
              :disabled="loading"
            />
          </v-col>
          <v-col cols="6" class="d-flex justify-center">
            <v-pagination
              v-model="page"
              :length="pageNotifs ? pageNotifs.totalPages : 2"
              :total-visible="pageNotifs.content ? pageNotifs.size : 5"
              @update:model-value="getNotifs"
              prev-icon="mdi-chevron-right"
              next-icon="mdi-chevron-left"
              :disabled="loading"
            >
            </v-pagination>
          </v-col>
        </v-row>
      </v-card>

      <div
        v-if="(!pageNotifs || !pageNotifs.content.length) && !loading"
        :style="`min-height: ${windowHeight - 250}px`"
        class="no_data"
      >
        <p>لا يوجد اشعارات</p>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, defineProps } from "vue";
import { notifsModule } from "@/stores/notifications/notifs";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

// Init Stores
const notifStore = notifsModule();

// Init Router
const router = useRouter();

// Data
const { pageNotifs } = storeToRefs(notifStore);
const size = ref(10);
const page = ref(1);
const range = ref([10, 20, 30]);
const loading = ref(false);

// Props
defineProps(["windowHeight"]);

// Methods
const getNotifs = async () => {
  const getPageNotifs = notifStore.getPageNotifs;
  const callObj = {
    page: page.value,
    size: size.value,
    userId: localStorage.getItem("logger"),
  };
  loading.value = true;
  await getPageNotifs(callObj);
  loading.value = false;
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
  router.push(notif.routeName);
};

// Hooks
onMounted(async () => {
  await getNotifs(localStorage.getItem("logger"));
});
</script>

<style lang="scss">
.notifs {
  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      font-size: 25px;
      color: rgb(80, 80, 80);
    }
  }
}
</style>
