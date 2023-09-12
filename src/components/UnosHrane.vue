 <template>
  <div>

      <q-card v-if="prikazKartice">
        <q-card-section>
          <div class="text-h6">Dodaj jelo</div>
          <div class="text-subtitle2">Odabir kategorije</div>
        </q-card-section>

          <!-- Kategorija jela -->
        <q-card-section class="q-pt-none">
        <q-row justify="center" >
          <q-btn
            v-for="kategorija in kategorije"
            :key="kategorija.ime"
            padding="m"
            push
            :color="kategorija.boja"
            @click="odaberiKategoriju(kategorija)"
            :label="kategorija.ime"
            class="q-ma-sm"
          >
            <q-icon
            :name=kategorija.ikona
            class="text-white ikone-menu"
             />

          </q-btn>
        </q-row>
      </q-card-section>
        <q-list bordered v-if="this.odabranaKategorija">
          <q-list bordered>
            <q-select
              v-model="odabranoJelo"
              label="Odabir"
              emit-value
              map-options
              @update:model-value="assignValue(odabranoJelo)"
              :options="opcijeJela"
              />

         </q-list>
      </q-list>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup/>
          <q-btn flat label="Dodaj" @click="spremiJelo()" v-close-popup />
        </q-card-actions>
      </q-card>

  </div>
</template>

<script>

import { db, collection, addDoc } from '../boot/firebase';

import axios from 'axios';
import { useUserStore } from '../store/user-store.js'

export default {
  data() {
    return {
      prikazKartice: true,
      popisHrane: {},
      odabranoJelo: null,
      popisJela: [],
      loading: false,
      kategorije: [
        { ime: "Glavno jelo", ikona: "restaurant", odabrana: false, boja: "primary", value: 'glavno_jelo' },
        {
     ime: "Glavno jelo - vege", ikona: "eco", odabrana: false, boja: "primary", value: 'glavno_jelo_vege' },
        { ime: "Prilog", ikona: "rice_bowl", odabrana: false, boja: "primary", value: 'prilog' },
        { ime: "Desert", ikona: "cake", odabrana: false, boja: "primary", value: "desert" },
        { ime: "Juha", ikona: "soup_kitchen", odabrana: false, boja: "primary", value: "juha"},
        { ime: "Salata", ikona: "local_florist", odabrana: false, boja: "primary", value: "salata"},
        { ime: "Napitci", ikona: "local_drink", odabrana: false, boja: "primary", value: "napitci"}
      ],
      odabranaKategorija: null,
      jeloZaSpremanje: null,
    }
  },
  computed: {
    opcijeJela () {
      // Vracanje samo imena iz arraya jela
      return this.popisJela.map(jelo => ({ label: jelo.naziv, value: jelo }))
    }
  },
  mounted() {
    this.ucitajJela()
  },
  methods: {


  assignValue(jelo) {
    this.jeloZaSpremanje = jelo.naziv;
  },
  async ucitajJela() {

      axios
        .get('https://backend.diplomski.me/jela')
        .then(response => {
          this.jela = response.data;
          this.loading = true;
        })
        .catch(error => {
          this.$q.notify({
            color: 'negative',
            message: 'Greška prilikom dohvaćanja podataka',
            icon: 'warning'
          })
          this.loading = false;
        });

  },
  odaberiKategoriju(kategorija) {
    this.odabranoJelo = '';
    this.popisJela = [];

      this.odabranaKategorija = kategorija.value;

      // kada se odaberu 2 opcije
      for(let index=0;index<this.jela[this.odabranaKategorija].length;index++){
        // uzimanje pozicije jela za objekt

        this.popisJela.push(this.jela[this.odabranaKategorija][index])
      }

    },

    async spremiJelo() {
      const userStore = useUserStore()

    if(userStore.fetchUser() == undefined){
      //korisnik nije logiran
        this.$q.notify({
            color: 'negative',
            message: 'Greška prilikom spremanja jela, korisnik nije prijavljen',
            icon: 'warning'
          })

      } else {
        //korisnik logiran
        const trenutniDatum = new Date().toISOString().split('T')[0];


        await addDoc (collection(db, "prehrana"), {
          datum: trenutniDatum,
          jelo: this.jeloZaSpremanje,
          korisnik: userStore.fetchUser().id
        })
        .then((docRef) => {
          this.prikazKartice = false;
          this.$q.notify({
            color: 'positive',
            message: 'Jelo uspješno spremljeno',
            icon: 'check'
          })
        }).catch((error) => {
          console.error("Error adding document: ", error);
          this.$q.notify({
            color: 'negative',
            message: 'Greška prilikom spremanja jela',
            icon: 'warning'
          })
        });

      }
    }

}
}

</script>

<style>
.q-btn {
  border-radius: 20px;
}
.ikone-menu {
  margin-left: 5px;
}
</style>
