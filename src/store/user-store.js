import { defineStore } from 'pinia'
import { auth, signInWithEmailAndPassword, getAuth, signOut,
  createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from '../boot/firebase'


export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    email: null,
    TDEE: null,
  }),
  getters: {
    getID: (state) => state.id,
    getEmail: (state) => state.email,
    getHeight: (state) => state.height,
  },
  actions: {
    async login(email, password){
      try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        this.id = user.uid;
        this.email = user.email;
        //console.log('Uspješna prijava:', user.email);
      }
      catch(error) {
        if(error) throw error;
      }
    },
    async register(email, password) {
      if(!this.id) {
        // Provjera je li korisnik trenutno prijavljen
        // Korisnik nije prijavljen
        const auth = getAuth();
        let signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          // Provjera postoji li korisnik u bazi podataka
          return 'userExists'
        } else {
          //user does not exist
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            this.id = user.uid;
            this.email = user.email;
            return 'success';
          } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            // Handle errors here
          }
        }


      }

    },
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        // Sign-out successful.

        this.clearUser();

      }).catch((error) => {
        // An error happened.
      });

    },
    fetchUser() {
      // if id and email exists return id and email
      //console.log(`Testiram ako vraca i ovo ${this.id, this.email}`)
      if(this.id && this.email) {
       // console.log(`Testiram ako vraca ${this.id, this.email}`)
        return { id: this.id, email: this.email }
      }
    },
    setUser(payload) {
      if(payload.id) this.id = payload.Uid;
      if(payload.email) this.email = payload.email;

    },
    setCalIntake(TDEE) {
      this.TDEE = TDEE;
    },
    fetchTDEE() {
      if(this.TDEE) {
        return this.TDEE;
      }
    },
    clearUser() {
      this.id = null
      this.name = null
      this.email = null
    },
    setHeight(height) {
      if(this.height > 0)
        this.height = height;
    },
    fetchHeight() {
      if(this.height) {
        return this.height;
      }else return 'nema podatka'
    },
    resetHeight() {
      this.height = null;
    },
    setWeight(weight) {
      if(this.weight > 0)
        this.weight = weight;
    },
    fetchWeight() {
      if(this.weight) {
        return this.weight;
      }
    },
    resetWeight() {
      this.weight = null;
    },
    async resetPassword(email) {
      const auth = getAuth();
      sendPasswordResetEmail(auth, email)
        .then(() => {
          // vratiti podatak da je uspješno poslana poruka
          return 1;
        })
    },

  },
})
