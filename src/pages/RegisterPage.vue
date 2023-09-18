<template>
  <div class="container">
    <div class="q-pa-md q-gutter-md registerScreen">
      <q-card>
        <q-card-section>
          <h2 class="text-h6">Registracija</h2>
          <q-input v-model="email" label="Email" type="email" />
          <q-input
            v-model="password"
            label="Lozinka"
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            label="Potvrda lozinke"
            :type="isPwdConfirm ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdConfirm = !isPwdConfirm"
              />
            </template>
          </q-input>

          <q-btn
            color="primary"
            label="Registriraj se"
            @click="handleRegister"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../store/user-store";

const userStore = useUserStore();

export default {
  name: "RegisterPage",
  data() {
    return {
      email: "test1@test.com",
      password: "123456",
      confirmPassword: "123456",
      isPwd: true,
      isPwdConfirm: true,
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.$q.notify({
          color: "negative",
          message: "Lozinke se ne podudaraju",
          icon: "report_problem",
        });
        return;
      }

      try {
        const register = await userStore.register(this.email, this.password);
        if (register == "userExists") {
          this.$q.notify({
            color: "negative",
            message:
              "Greška pri registraciji, korisnik s tim emailom već postoji",
            icon: "report_problem",
            position: "top",
          });
        } else if (register == "success") {
          this.$q.notify({
            color: "positive",
            message: "Uspješno ste registrirani",
            icon: "check",
            position: "top",
          });
          this.$router.push("/user-profile");
        } else {
          this.$q.notify({
            color: "negative",
            message: "Greška pri registraciji, korisnik je prijavljen",
            icon: "report_problem",
          });
          return;
        }
      } catch (error) {
        this.$q.notify({
          color: "negative",
          message: "Greška pri registraciji: " + error.message,
          icon: "report_problem",
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.registerScreen {
  width: 50%;
  margin: 50px auto;
}

.q-btn {
  margin-top: 15px;
}
</style>
