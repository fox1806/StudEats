import { defineStore } from "pinia";
import {
  auth,
  signInWithEmailAndPassword,
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  onAuthStateChanged,
  onSnapshot,
  doc,
  db,
  query,
  where,
  collection,
  getDoc,
} from "../boot/firebase";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: null,
    email: null,
    TDEE: 0,
  }),
  getters: {
    getID: (state) => state.id,
    getEmail: (state) => state.email,
    getHeight: (state) => state.height,
  },
  actions: {
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        this.id = user.uid;
        this.email = user.email;
      } catch (error) {
        if (error) throw error;
      }
    },
    async register(email, password) {
      if (!this.id) {
        // Provjera je li korisnik trenutno prijavljen
        // Korisnik nije prijavljen
        const auth = getAuth();
        let signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          // Provjera postoji li korisnik u bazi podataka
          return "userExists";
        } else {
          //user does not exist
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const user = userCredential.user;
            this.id = user.uid;
            this.email = user.email;
            return "success";
          } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            return errorCode;
            // Handle errors here
          }
        }
      }
    },
    logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          // uspjesna odjava
          this.clearUser();
          // localStorage.removeItem("userData");
          // sessionStorage.removeItem("userData");

          localStorage.clear();
          sessionStorage.clear();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    fetchUser() {
      if (this.id && this.email) {
        return { id: this.id, email: this.email };
      }
    },
    setUser(payload) {
      if (payload.uid) this.id = payload.uid;
      if (payload.email) this.email = payload.email;
    },
    setCalIntake(TDEE) {
      if (TDEE) {
        this.TDEE = TDEE;
      }
    },
    fetchTDEE() {
      if (this.TDEE) {
        return this.TDEE;
      }
    },
    clearUser() {
      this.id = null;
      this.name = null;
      this.email = null;
    },
    setHeight(height) {
      if (this.height > 0) this.height = height;
    },
    fetchHeight() {
      if (this.height) {
        return this.height;
      } else return "nema podatka";
    },
    resetHeight() {
      this.height = null;
    },
    setWeight(weight) {
      if (this.weight > 0) this.weight = weight;
    },
    fetchWeight() {
      if (this.weight) {
        return this.weight;
      }
    },
    resetWeight() {
      this.weight = null;
    },
    async resetPassword(email) {
      const auth = getAuth();
      sendPasswordResetEmail(auth, email).then(() => {
        // vratiti podatak da je uspješno poslana poruka
        return 1;
      });
    },
    async fetchNewTDEE(user) {
      const userDocRef = doc(db, "korisnici", user.uid);

      // Pribavi dokument
      const docSnapshot = await getDoc(userDocRef);

      // Proveri da li dokument postoji i ispiši ga
      if (docSnapshot.exists()) {
        if (!!docSnapshot.data()) {
          //  { label: 'Smršaviti', value: 'Smrsaviti' },
          // { label: 'Udebljati se', value: 'Udebljati se' },
          // { label: 'Biti na istoj razini', value: 'Biti na istoj razini' },
          const atletskaSpremnost = docSnapshot.data().atletskaSpremnost;
          const multiplier =
            atletskaSpremnost == "Početnik"
              ? 1.3
              : atletskaSpremnost == "Rekreacijski"
              ? 1.5
              : atletskaSpremnost == "Natjecateljski"
              ? 1.7
              : null;

          const selectedGoal = docSnapshot.data().selectedGoal;

          let multiplier2 =
            selectedGoal == "Smrsaviti"
              ? -0.05
              : selectedGoal == "Udebljati se"
              ? 0.05
              : selectedGoal == "Biti na istoj razini"
              ? 0
              : null;

          const godine = docSnapshot.data().godine;
          const visina = docSnapshot.data().visina;
          const tezina = docSnapshot.data().tezina;
          const selectedGender = docSnapshot.data().selectedGender;

          const BMR = Math.round(
            10 * tezina +
              6.25 * visina -
              5 * godine +
              (selectedGender === "Musko" ? 5 : -161)
          );
          if (multiplier2 > 0) {
            return Math.round(
              BMR * multiplier + BMR * multiplier * multiplier2
            );
          } else if (multiplier2 < 0) {
            multiplier2 *= -1;

            return Math.round(
              BMR * multiplier - BMR * multiplier * multiplier2
            );
          }
        }
      } else {
        console.log("Nema korisnika sa tim UID.");
      }
    },
  },
});

const userStore = useUserStore();

auth.onAuthStateChanged((user) => {
  if (user) {
  } else {
  }
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    userStore.setUser(user);
  } else {
    userStore.clearUser();
  }
});
