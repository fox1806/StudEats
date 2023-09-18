<template>
  <div class="q-pa-md q-gutter-md loginScreen">
    <q-card>
      <q-card-section>
        <h2 class="text-h6">Login</h2>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Password" type="password" />
        <p v-if="showPasswordError" class="error-message">
          Pogrešna lozinka. Pokušajte ponovo.
        </p>
        <p v-if="showRequests" class="error-message">
          Previše pokušaja prijave. Molimo pokušajte kasnije.
        </p>
        <div class="register" v-if="showRequests">
          Zaboravili ste lozinku?
          <span
            class="clickable-text"
            @click="zaboravljenaLozinka"
            @mouseover="hover = true"
            @mouseleave="hover = false"
          >
            Zatražite novu
          </span>
        </div>
        <q-btn color="primary" label="Login" @click="handleLogin" />

        <div class="register">
          Niste korisnik?
          <router-link to="/register">Registrirajte se</router-link>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useUserStore } from "../store/user-store.js";
import { onAuthStateChanged, auth } from "../boot/firebase.js";

const userStore = useUserStore();

export default {
  name: "LoginPage",
  setup() {},
  data() {
    return {
      email: "",
      password: "",
      showPasswordError: false,
      showRequests: false,
    };
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.$q.notify({
          color: "positive",
          message: "Korisnik je prijavljen.",
          position: "top",
          timeout: 1500,
        });
        this.$router.push("/user-profile");
        // const unsub = onSnapshot(doc(db, "korisnici", user.uid), (doc) => {
        //   if (!!doc.data()) {

        //   }
        // });
      }
    });
  },
  methods: {
    async handleLogin() {
      try {
        await userStore.login(this.email, this.password);
        if (userStore.fetchUser()) {
          this.$router.push("/user-profile");
        } else {
          this.$q.notify({
            color: "negative",
            message: "Korisnik nije dostupan ili nije uspješno prijavljen.",
            position: "top",
            timeout: 2000,
          });
        }
      } catch (error) {
        if ((error.code = "auth/too-many-requests")) {
          this.showRequests = true;
        }
        if (error.code === "auth/wrong-password") {
          this.showPasswordError = true;
        }
        this.$q.notify({
          color: "negative",
          message: "Greška pri prijavi korisnika: " + error.message,
          position: "top",
          timeout: 2000,
        });
      }
    },
    async zaboravljenaLozinka() {
      // zvati funkciju za reset lozinke, ako je uspjesno prikazati dijalog da je uspjesno resetirano
      try {
        await userStore.resetPassword(this.email);
        this.$q.notify({
          color: "positive",
          message: "Zahtjev za reset lozinke je poslan na vaš email.",
          position: "top",
          timeout: 2000,
        });
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message:
            "Greška pri slanju zahtjeva za reset lozinke: " + error.message,
          position: "top",
          timeout: 2000,
        });
      }
    },
  },
};
</script>

<style>
.loginScreen {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
}

.error-message {
  color: red;
}

.register {
  margin-top: 10px;
}

.q-btn {
  margin-top: 10px;
}

.clickable-text {
  cursor: pointer;
  text-decoration: underline;
}
</style>
