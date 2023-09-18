<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title @click="changeRoute('/')"> StudEats </q-toolbar-title>
        <q-icon
          name="person"
          class="larger-icon q-mr-md"
          @click="changeRoute('/login')"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Izbornik </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />

        <div class="dno">
          <q-separator />

          <q-item clickable tag="a" @click="logout()">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Odjavi se</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style>
.larger-icon {
  font-size: 130%;
}
</style>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

import { useUserStore } from "../store/user-store";

const userStore = useUserStore();

const linksList = [
  {
    title: "Korisnički profil",
    icon: "person",
    link: "/user-profile",
  },
  {
    title: "Naslovna stranica",
    caption: "Što sam jeo?",
    icon: "restaurant",
    link: "/",
  },
  {
    title: "Statistika",
    caption: "Statistički podaci o unosima",
    icon: "bar_chart",
    link: "/statistika",
  },
  {
    title: "O aplikaciji",
    caption: "Više o aplikaciji",
    icon: "info",
    link: "/o-aplikaciji",
  },
  {
    title: "Kontakt",
    icon: "contact_support",
    link: "/kontakt",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  methods: {
    changeRoute(link) {
      this.$router.replace(link);
    },
    logout() {
      if (!!userStore.fetchUser()) {
        userStore.logout();
        this.$router.push("/login");
        this.$q.notify({
          position: "top",
          color: "positive",
          message: "Odjavljeni ste",
          icon: "logout",
        });
      } else {
        this.$q.notify({
          position: "top",
          color: "negative",
          message: "Niste prijavljeni",
          icon: "report_problem",
        });
      }
    },
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style>
.q-list {
  display: flex;
  flex-direction: column;
  height: 100%; /* Osigurava da lista zauzima punu visinu */
}

.dno {
  margin-top: auto;
}
</style>
