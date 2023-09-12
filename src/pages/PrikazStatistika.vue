<template>
  <q-page>
    <div class="flex flex-center q-ma-md">
      <q-select
        label="Odaberite vrstu statistike"
        :options="['Dnevno', 'Tjedno', 'Mjesečno']"
        v-model="selectedStatType"
        @update:model-value = "loadData()"
        outlined
      />

    </div>


  <div class="dnevno flex flex-center" v-if="this.selectedStatType=='Dnevno'" >
    <q-date
    v-model="odabraniDan"
    mask="YYYY-MM-DD"
    :locale="myLocale"
    @update:model-value="dateChangeDay"
    class="q-pa-sm"
    />
  </div>

  <div class="tjedno" v-if="this.selectedStatType=='Tjedno'" >
    <div class="flex flex-center">
      <q-date
      v-model="datumTjedan"
      landscape
      mask="YYYY-MM-DD"
      @update:model-value="dateChangeWeek"
      :locale="myLocale"
      class="q-pa-sm"


    />
  </div>

    </div>
  <div class="mjesecno flex flex-center q-ma-md" v-if="this.selectedStatType=='Mjesečno'">
    <q-select
      v-model="odabraniMjesec"
      :options="months"
      label="Odaberite mjesec"
      option-label="label"
      option-value="value"
      @update:model-value="dateChangeMonth"
      outlined
    />

  </div>
  <div v-if="this.praznoPolje===true" class="flex flex-center upozorenjePeriod">
        <h6>Nema podataka za odabrani period</h6>
      </div>
     <div  v-if="(this.selectedStatType=='Tjedno' ||
     this.selectedStatType=='Dnevno' || this.selectedStatType == 'Mjesečno') && this.praznoPolje == false
     && this.ucitano == false && (this.odabraniDan || this.datumTjedan || this.odabraniMjesec )">
      <h6 class="flex flex-center loadData bounce">Učitavam podatke</h6>
    </div>
     <div  v-if="(this.selectedStatType=='Tjedno' ||
     this.selectedStatType=='Dnevno' || this.selectedStatType == 'Mjesečno') && this.praznoPolje == false
     && this.ucitano == true">

       <div v-if="this.potrebniProteini>0" class="flex flex-center kartice-container">
        <p class="karticaStatistika"
        :class="this.statistickaObradaProteina() === 'Dovoljno proteina za navedeni period' ? 'karticaStatistika-dovoljno' : 'karticaStatistika-nedostatak'">
          {{ this.statistickaObradaProteina() }}
        </p>
        <p class="karticaStatistika"
        :class="this.statistickaObradaKalorija() === 'Dovoljno kalorija za navedeni period' ?
        'karticaStatistika-dovoljno' : 'karticaStatistika-nedostatak'">
          {{  this.statistickaObradaKalorija() }}
        </p>

       </div >
        <div v-if="this.potrebniProteini>0">
          <h5 class="flex flex-center" >
            Prosječne vrijednosti za period
          </h5>
          <div class="q-pa-xl flex flex-center kartice" >
            <KarticaNutrijenata
            :calories="this.kalorije"
            :proteins="this.proteini"
            :fats="this.masti"
            :carbs="this.ugljikohidrati"
          />
          </div>
        </div>

     </div>

  </q-page>
</template>

<script>
import KarticaNutrijenata from '../components/KarticaNutrijenata.vue'


import {db, onAuthStateChanged, auth, doc,
  collection, query, where, onSnapshot } from '../boot/firebase.js';

  import { useUserStore } from '../store/user-store'
const { parse, getISOWeek } = require('date-fns');

const userStore = useUserStore();

export default {
  name: 'PrikazStatistika',
  components: {
    KarticaNutrijenata
  },
  beforeRouteUpdate(to, from, next){
    const userStore = useUserStore()
     if(userStore.fetchUser() == undefined) {
      next(false);  // spriječava učitavanje stranice
    } else {
      this.email = userStore.fetchUser().email;

      next(); // dozvoljava učitavanje stranice
    }
  },
  mounted() {
    const userStore = useUserStore()
    if(userStore.fetchUser() == undefined) {
      this.korisnikNePostoji();
      this.$router.push('/login')
    }
  },
  data () {
    return {
      myLocale: {
        /* Tjedan počinje ponedjeljkom */
        days: 'Nedjelja_Ponedjeljak_Utorak_Srijeda_Četvrtak_Petak_Subota'.split('_'),
        daysShort: 'Ned_Pon_Uto_Sri_Čet_Pet_Sub'.split('_'),
        months: "Siječanj_Veljača_Ožujak_Travanj_Svibanj_Lipanj_Srpanj_Kolovoz_Rujan_Listopad_Studeni_Prosinac".split('_'),
        monthsShort: "Sij_Velj_Ožu_Tra_Svi_Lip_Srp_Kol_Ruj_Lis_Stu_Pro".split('_'),
        firstDayOfWeek: 1,
        format24h: true,
        pluralDay: 'dana'
      },

      odabraniMjesec: null,
      months: [
        { label: 'Siječanj', value: 1 },
        { label: 'Veljača', value: 2 },
        { label: 'Ožujak', value: 3 },
        { label: 'Travanj', value: 4 },
        { label: 'Svibanj', value: 5 },
        { label: 'Lipanj', value: 6 },
        { label: 'Srpanj', value: 7 },
        { label: 'Kolovoz', value: 8 },
        { label: 'Rujan', value: 9 },
        { label: 'Listopad', value: 10 },
        { label: 'Studeni', value: 11 },
        { label: 'Prosinac', value: 12 }
      ],
      selectedWeek: [], // Ovo je array koji se koristi za prikaz tjedna na Q-Date elementu

      selectedStatType: [],
      praznoPolje: false,
      trenutniTjedan: '',
      datumTjedan: '',
      podaci: [],
      kalorije: null,
      masti: null,
      ugljikohidrati: null,
      proteini: null,
      visina: null,
      tezina: null,
      atletskaSpremnost: null,
      potrebniProteini: null,

      odabraniDan: null,

      ucitano: false,
    }
  },
  created() {
    // Kreiranje trenutnog datuma u formatu YYYY-MM-DD
    // Trenutni datum se koristi kao fiksna tocka iznad koje se ne moze prikazati statistika
    this.trenutniTjedan = new Date().toISOString().substr(0, 10);
    this.trenutniTjedan = this.tjedanGodine(this.trenutniTjedan)

    this.resetNutritivnihVrijednosti();

    this.ucitajPodatkeOsobe();

  },

  methods: {
    async ucitajPodatkeOsobe(){
      onAuthStateChanged(auth, (user) => {
          if (user) {
            const unsub = onSnapshot(doc(db, "korisnici", user.uid), (doc) => {


                  if(!!doc.data()) {
                    this.visina = doc.data().visina;
                    this.tezina = doc.data().tezina;
                    this.atletskaSpremnost = doc.data().atletskaSpremnost;
                  }


             });
          }
        });
    },
    resetNutritivnihVrijednosti() {
      this.kalorije = 0;
      this.masti = 0;
      this.ugljikohidrati = 0;
      this.proteini = 0;
    },
    tjedanGodine(datum) {
      // funkcija kalkulira koji je datum u godini za odabrani dan
      // i vraća taj datum

      const dateParse = parse(datum, 'yyyy-MM-dd', new Date());
      const weekNumber = getISOWeek(dateParse);

      return weekNumber;
    },
    getDataByWeekNumber(weekNumber, year) {

        const data = snapshot.val();
        const filteredData = {};

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const datum = data[key].datum;

            const dateParts = datum.split("-");
            const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

            if (dateObject.getFullYear() === year && getWeekNumber(dateObject) === weekNumber) {
              filteredData[key] = data[key];
            }
          }
        }

    },
    getWeekNumber(dateString) {
      const date = new Date(dateString + "T00:00:00");
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7); // Ponedjeljak
      const week1 = new Date(date.getFullYear(), 0, 4);
      week1.setDate(week1.getDate() + 3 - (week1.getDay() + 6) % 7);
      return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },

    async unosTablica(popisJela) {
      this.ucitano = false;
      // Priprema podataka za unos u bazu podataka
      const baseUrl = "https://backend.diplomski.me/trazi";

      // Pohranjivanje rezultata pretrage za svako jelo
      const rezultati = [];  // Pohranjivanje rezultata pretrage za svako jelo
      for (let jelo of popisJela) {
          try {
              const response = await fetch(`${baseUrl}?term=${encodeURIComponent(jelo)}`);

              if (!response.ok) {
                  throw new Error(`Failed to fetch data for ${jelo}. Status: ${response.status}`);
              }

              const data = await response.json();
              if (data && data.length > 0) {
                  rezultati.push(...data);  // Dodavanje svih podudarnih rezultata
              }
          } catch (error) {
              console.error(`Error fetching data for ${jelo}:`, error);
          }
      }

    this.resetNutritivnihVrijednosti();
    for(let index = 0; index<rezultati.length;index++){

            this.kalorije += rezultati[index].kalorije;
            this.masti += rezultati[index].masti;
            this.ugljikohidrati += rezultati[index].ugljikohidrati;
            this.proteini += rezultati[index].proteini;

    }
    if(this.selectedStatType==="Tjedno"){
      this.kalorije = Math.round(this.kalorije/7);
      this.masti = Math.round(this.masti/7);
      this.ugljikohidrati = Math.round(this.ugljikohidrati/7);
      this.proteini = Math.round(this.proteini/7);

    }
    if(this.selectedStatType==="Mjesečno"){
      const daysInMonth = new Date(2023, this.odabraniMjesec.value, 0).getDate();
      this.kalorije = Math.round(this.kalorije/daysInMonth);
      this.masti = Math.round(this.masti/daysInMonth);
      this.ugljikohidrati = Math.round(this.ugljikohidrati/daysInMonth);
      this.proteini = Math.round(this.proteini/daysInMonth);
    }
    this.statistickaObradaKalorija();
    this.statistickaObradaProteina();
    },
    getDataWeek(zadaniTjedan) {
            const trenutniDatum = new Date().toISOString().split('T')[0];
            this.resetNutritivnihVrijednosti();

            if (userStore.fetchUser().id) {
              const korisnikId = userStore.fetchUser().id;

              const q = query(
                collection(db, 'prehrana'),
                where('korisnik', '==', korisnikId)
              );

              const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const popisJela = [];
              querySnapshot.forEach((doc) => {
                  popisJela.push([doc.data()]);
                });

              const filteredData = [];
              const year = 2023;
              const weekNumber = 35;
              for (const key in popisJela) {
                if (popisJela.hasOwnProperty(key)) {
                  const datum = popisJela[key][0].datum;
                  const weekNumber = this.getWeekNumber(datum);
                  const year = new Date(datum).getFullYear();

                  const currentYear = 2023;
                  if (weekNumber === zadaniTjedan && year === currentYear) {
                    filteredData.push(popisJela[key][0].jelo);
                  }
                }
              }
              this.podaci = filteredData;
              if(filteredData.length === 0){
                this.praznoPolje = true;
              }else {
                this.praznoPolje = false;
                this.unosTablica(filteredData).then(() => {
                  this.ucitano = true;
                });
              }
              });
            }

      },
    loadData() {
      this.odabraniMjesec = '';
      this.potrebniProteini = 0;
      this.praznoPolje = false;
      this.resetNutritivnihVrijednosti();

    },
    dateChangeDay(odabraniDatum){

         this.resetNutritivnihVrijednosti();
            if (userStore.fetchUser().id) {
              const korisnikId = userStore.fetchUser().id;

              const q = query(
                collection(db, 'prehrana'),
                where('korisnik', '==', korisnikId)
              );

              const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const popisJela = [];
              querySnapshot.forEach((doc) => {
                  if(doc.data().datum==odabraniDatum){
                    popisJela.push([doc.data()]);
                  }
                });

              const filteredData = [];

              for (const key in popisJela) {
                if (popisJela.hasOwnProperty(key)) {
                  filteredData.push(popisJela[key][0].jelo);

                }
              }
              this.podaci = filteredData;
              if(filteredData.length === 0){
                this.praznoPolje = true;
              }else {
                this.praznoPolje = false;
                this.unosTablica(filteredData).then(() => {
                  this.ucitano = true;
                });
              }

              });
            }
    },
    dateChangeWeek(odabraniDatum) {
      const startDate = new Date(odabraniDatum);
      const endDate = new Date(odabraniDatum);

      startDate.setDate(startDate.getDate() - startDate.getDay()+1); // Namjesteno da je ponedjeljak prvi dan
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())+1); // namjesteno da je nedjelja zadnji dan

      const startWeek = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endWeek = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      this.selectedWeek = [startWeek, endWeek];
      // dio koda koji obradjuje podatke za odabrani tjedan

      const odabraniTjedan= this.tjedanGodine(this.datumTjedan);
      this.datumTjedan =  {from: startWeek, to: endWeek}
      this.getDataWeek(odabraniTjedan);

      this.statistickaObradaProteina();
    },
    dateChangeMonth(odabraniMjesec){
      this.resetNutritivnihVrijednosti();
            if (userStore.fetchUser().id) {
              const korisnikId = userStore.fetchUser().id;

              const q = query(
                collection(db, 'prehrana'),
                where('korisnik', '==', korisnikId)
              );

              const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const popisJela = [];
              querySnapshot.forEach((doc) => {

                  const datum = doc.data().datum;

                  const dateParts = datum.split("-");
                  if(dateParts[1]==odabraniMjesec.value){
                    popisJela.push([doc.data().jelo]);
                  }
                });

              this.podaci = popisJela;
              if(this.podaci.length === 0){
                this.praznoPolje = true;

              }else {
                this.praznoPolje = false;
                this.unosTablica(this.podaci).then(() => {
                  this.ucitano = true;
                });
              }
              });
            }
    },

     statistickaObradaProteina(){
      // Obradjuje koliko je proteina potrebno naprema kilazi korisnika
      this.ucitajPodatkeOsobe();
      if(this.atletskaSpremnost === 'Rekreacijski'){
        this.potrebniProteini = this.tezina * 1.3;
      }else if(this.atletskaSpremnost === 'Natjecateljski'){
        this.potrebniProteini = this.tezina * 1.6;
      }else {
        this.potrebniProteini = this.tezina * 0.8;
      }
      if(this.proteini < this.potrebniProteini){
        return ('Nedostatak proteina za navedeni period')
      }else {
        return ('Dovoljno proteina za navedeni period')
      }
    },
    statistickaObradaKalorija() {
      if(this.kalorije < userStore.fetchTDEE()){
        return ('Nedostatak kalorija za navedeni period')
      }
      else {
        return ('Dovoljno kalorija za navedeni period')
      }
    },
    korisnikNePostoji() {
      this.$q.notify({
        color: 'red-9',
        textColor: 'white',
        icon: 'warning',
        message: 'Korisnik nije prijavljen',
        caption: 'Potrebna je prijava',
        position: 'top',
        timeout: 6000,
        position: 'top'
      });
    },
  }
}

</script>

<style>

.q-select{
  width: 100%;
}

.upozorenjePeriod {
  color: red;
  margin-top: -50px;
}

.dnevno {
  transform: scale(0.9);

}
.tjedno {
  transform: scale(0.9);
}
.kartice {
  margin-top: -80px;
  margin-bottom: -80px;
}

.kartice-container {
  display: flex;
}

/* Stilovi za pojedinačne kartice */
.karticaStatistika {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 10px 10px 6px rgba(0,0,0,0.1);
  padding: 1rem;
  margin: 0.5rem;
  text-align: center;
}

.karticaStatistika-dovoljno {
  background-color: #d4edda; /* Pastelno zelena */
  color: #155724; /* Tamnozelena boja teksta */
}

/* Stil za negativni ishod */
.karticaStatistika-nedostatak {
  background-color: #f8d7da; /* Pastelno crvena */
  color: #721c24; /* Tamnocrvena boja teksta */
}

@media (min-width: 768px) {
  .kartice-container {
  width: calc(60% - 10px);
  margin: 0 auto;
  }
}


@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.loadData {
  animation: bounce .5s ease infinite;
}

</style>
