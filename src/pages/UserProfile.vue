<template>
  <q-page>
    <q-form @submit="submitForm" class="inputForm">
      <div class="inputs">
        <q-input outlined v-model="ime" label="Ime" />
        <q-input outlined v-model="prezime" label="Prezime" />

        <q-input
          outlined
          v-model="email"
          disable
          label="Vaša e-pošta"
          type="email"
        />
        <q-input type="number" outlined v-model="godine" label="Dob" />
        <q-input
          type="number"
          outlined
          v-model="tezina"
          label="Vaša težina (u kg)"
        />
        <q-input
          type="number"
          outlined
          v-model="visina"
          label="Vaša visina (u cm)"
        />

        <q-select
          outlined
          v-model="atletskaSpremnost"
          :options="atletskeSpremnosti"
          label="Atletska spremnost"
        />

        <q-select
          outlined
          v-model="selectedGender"
          :options="genderOptions"
          label="Odaberite spol"
          emit-value
          map-options
        />

        <q-select
          outlined
          v-model="selectedGoal"
          :options="goalOptions"
          label="Cilj dijete"
          emit-value
          map-options
        />

        <q-btn
          class="q-ma-m"
          type="submit"
          color="primary"
          @click="spremiProfil()"
          label="Spremi profil"
          v-if="!uredi"
        />
        <q-btn
          class="q-ma-m"
          type="submit"
          color="primary"
          @click="urediProfil()"
          label="Ažuriraj profil"
          v-if="uredi"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import {
  db,
  onAuthStateChanged,
  auth,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getAuth,
} from "../boot/firebase.js";

import { useUserStore } from "../store/user-store.js";

const userStore = useUserStore();

export default {
  data() {
    return {
      ime: "",
      prezime: "",
      godine: 0,
      atletskaSpremnost: "",
      atletskeSpremnosti: ["Početnik", "Rekreacijski", "Natjecateljski"],
      selectedGender: null,
      genderOptions: [
        { label: "Muško", value: "Musko" },
        { label: "Žensko", value: "Zensko" },
      ],
      visina: 0,
      tezina: 0,
      email: "",
      selectedGoal: null,
      goalOptions: [
        { label: "Smršaviti", value: "Smrsaviti" },
        { label: "Udebljati se", value: "Udebljati se" },
        { label: "Biti na istoj razini", value: "Biti na istoj razini" },
      ],
      isValidEmail: true,
    };
  },
  methods: {
    spremiProfil() {
      const authInstance = getAuth();
      const user = authInstance.currentUser;

      if (user) {
        const korisnikId = user.uid;
        const korisnikDokumentRef = doc(db, "korisnici", korisnikId);

        getDoc(korisnikDokumentRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
            } else {
              // Korisnički podaci ne postoje, možete ih spremiti
              const korisnikPodaci = {
                ime: this.ime,
                prezime: this.prezime,
                godine: this.godine,
                atletskaSpremnost: this.atletskaSpremnost,
                selectedGender: this.selectedGender,
                visina: this.visina,
                tezina: this.tezina,
                selectedGoal: this.selectedGoal,
              };

              setDoc(korisnikDokumentRef, korisnikPodaci)
                .then(() => {
                  this.uspjesnoSpremanje();
                })
                .catch((error) => {
                  console.error("Greška pri spremanju korisnika:", error);
                });
            }
          })
          .catch((error) => {
            console.error("Greška pri provjeri korisničkih podataka:", error);
          });
      } else {
        // obavijest da korisink nije prijavljen
        this.korisnikNePostoji();
      }
    },
    async urediProfil() {
      try {
        // Provjera je li korisnik prijavljen
        let korisnikId = userStore.fetchUser().id;
        let noviPodaci = {
          ime: this.ime,
          prezime: this.prezime,
          godine: this.godine,
          atletskaSpremnost: this.atletskaSpremnost,
          selectedGender: this.selectedGender,
          visina: this.visina,
          tezina: this.tezina,
          selectedGoal: this.selectedGoal,
        };
        const user = auth.currentUser;
        if (!user) {
          this.korisnikNePostoji();
          return;
        }

        if (user.uid !== korisnikId) {
          // ('Nemate ovlasti za ažuriranje ovog korisnika.');
          this.$q.notify({
            color: "red-9",
            textColor: "white",
            icon: "warning",
            message: "Nemate ovlasti za ažuriranje ovog korisnika",
            position: "top",
            timeout: 6000,
            position: "top",
          });
          return;
        }

        // Referenca na dokument korisnika u kolekciji "korisnici"
        const korisnikRef = doc(db, "korisnici", korisnikId);

        // Ažuriranje podataka korisnika
        await setDoc(korisnikRef, noviPodaci, { merge: true });

        this.uspjesnoSpremanje();
      } catch (error) {
        console.error("Greška prilikom ažuriranja podataka korisnika:", error);
      }
    },

    korisnikNePostoji() {
      this.$q.notify({
        color: "red-9",
        textColor: "white",
        icon: "warning",
        message: "Korisnik nije prijavljen",
        caption: "Potrebna je prijava",
        position: "top",
        timeout: 6000,
        position: "top",
      });
    },
    uspjesnoSpremanje() {
      this.$q.notify({
        color: "green",
        textColor: "white",
        icon: "check",
        message: "Podaci uspješno spremljeni",
        caption: "Podaci su uspješno spremljeni",
        position: "top",
        timeout: 6000,
        position: "top",
      });
    },

    calculateBMI() {
      const multiplier =
        this.atletskaSpremnost == "Početnik"
          ? 1.3
          : this.atletskaSpremnost == "Rekreacijski"
          ? 1.5
          : this.atletskaSpremnost == "Natjecateljski"
          ? 1.7
          : null;

      const BMR = Math.round(
        10 * this.tezina +
          6.25 * this.visina -
          5 * this.godine +
          (this.selectedGender === "Musko" ? 5 : -161)
      );

      let multiplier2 =
        this.selectedGoal == "Smrsaviti"
          ? -0.05
          : this.selectedGoal == "Udebljati se"
          ? 0.05
          : this.selectedGoal == "Biti na istoj razini"
          ? 0
          : null;

      if (multiplier2 > 0) {
        userStore.setCalIntake(
          Math.round(BMR * multiplier + BMR * multiplier * multiplier2)
        );
      } else if (multiplier2 < 0) {
        multiplier2 *= -1;
        userStore.setCalIntake(
          Math.round(BMR * multiplier - BMR * multiplier * multiplier2)
        );
      } else {
        userStore.setCalIntake(Math.round(BMR * multiplier));
      }
    },
    clearForm() {
      this.ime = "";
      this.prezime = "";
      this.godine = 0;
      this.atletskaSpremnost = "";
      this.selectedGender = null;
      this.visina = 0;
      this.tezina = 0;
      this.selectedGoal = null;
    },
  },
  created() {
    this.clearForm();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userStore.setUser({
          id: user.uid,
          email: user.email,
        });
      }
    });
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.clearForm();
      if (user) {
        const unsub = onSnapshot(doc(db, "korisnici", user.uid), (doc) => {
          if (!!doc.data()) {
            this.ime = doc.data().ime;
            this.prezime = doc.data().prezime;
            this.godine = doc.data().godine;
            this.atletskaSpremnost = doc.data().atletskaSpremnost;
            this.selectedGender = doc.data().selectedGender;
            this.visina = doc.data().visina;
            this.tezina = doc.data().tezina;
            this.selectedGoal = doc.data().selectedGoal;
            this.email = user.email;
            // Kalkulacija BMI na temelju Mifflin-St Jeor jednadžbe
            this.calculateBMI();
            userStore.setHeight(this.visina);
            userStore.setWeight(this.tezina);
            this.uredi = true;
          } else {
            // podaci jos ne postoje, tek je registriran korisnik
            this.email = user.email;
            this.uredi = false;
          }
        });
      } else {
        this.$router.push("/login");
        this.korisnikNePostoji();
      }
    });
  },
};
</script>

<style>
.q-input,
.q-select,
.q-btn {
  margin-bottom: 10px;
}

.inputForm {
  padding: 50px;
}

.inputs {
  display: flex;
  flex-direction: column;
}
</style>
