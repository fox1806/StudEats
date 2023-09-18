<template>
  <q-page view="hHh lpR fFf">
    <div v-if="showWarningDialog">
      <q-card class="q-ma-md upozorenje flex flex-center justify-center">
        <q-card-section> Unijeli ste previše kalorija! </q-card-section>
      </q-card>
    </div>
    <div class="q-ma-md">
      <Doughnut
        :data="dataChart"
        :options="chartOptions"
        :key="chartKey"
        class="doughnut"
      />
    </div>
    <div class="q-pa-xl flex flex-center kartice">
      <KarticaNutrijenata
        :calories="mealScore.calories"
        :proteins="mealScore.proteins"
        :fats="mealScore.fats"
        :carbs="mealScore.carbs"
      />
    </div>

    <div class="flex flex-center q-mt-xl" style="flex-direction: column">
      <!-- Nova tipka u novom redu -->
      <q-btn
        class="q-mt-xl"
        round
        icon="add"
        type="button"
        color="secondary"
        @click="showDialog = true"
      />
      Dodaj jelo
    </div>

    <div class="q-pa-md">
      <q-table
        title="Jela"
        :columns="columns"
        :rows="jela"
        no-data-label="Današnji unos je prazan"
      >
        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <q-btn
              icon="delete"
              flat
              round
              dense
              @click="pripremiZaBrisanje(props)"
              style="color: rgb(38, 166, 154)"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <div>
      <!-- Poziv komponente za unos hrane -->
      <q-dialog v-model="showDialog" @hide="onDialogHide">
        <UnosHrane />
      </q-dialog>
    </div>

    <div>
      <!-- komponenta za brisanje elemenata iz tablice -->
      <q-dialog v-model="showDialogDelete">
        <q-card>
          <q-card-section>
            Jeste li sigurni da želite izbrisati ovaj element?
          </q-card-section>
          <q-card-actions>
            <q-btn
              label="Odustani"
              color="primary"
              flat
              @click="showDialogDelete = false"
            />
            <q-btn
              label="Izbriši"
              color="negative"
              flat
              @click="brisanjeElementa()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

import { useFoodStore } from "../store/food-store.js";
import { useUserStore } from "src/store/user-store";
import UnosHrane from "../components/UnosHrane.vue";
import KarticaNutrijenata from "../components/KarticaNutrijenata.vue";

import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  auth,
} from "../boot/firebase.js";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";

const foodStore = useFoodStore();
const userStore = useUserStore();

let dataChart = {
  labels: ["Preostalo", "Maksimalni unos kalorija"],
  datasets: [
    {
      backgroundColor: ["#41B883", "#E46651"],
      data: [0, 0],
    },
  ],
};

let chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        generateLabels: (chart) => {
          const labels = chart.data.labels;
          const datasets = chart.data.datasets;
          const dataArr = datasets[0].data;

          return labels.map((label, index) => ({
            text: `${label}: ${dataArr[index]}`,
            fillStyle: datasets[0].backgroundColor[index],
          }));
        },
      },
    },
  },
  datalabels: {
    color: "#fff",
    anchor: "enter",
    align: "start",
    offset: 8,
    borderRadius: 25,

    formatter: (value, ctx) => {
      let sum = 0;
      const dataArr = ctx.chart.data.datasets[0].data;
      dataArr.map((data) => {
        sum += data;
      });
      const percentage = ((value * 100) / sum).toFixed(2) + "%";
      return percentage;
    },
    font: {
      weight: "bold",
      size: 14,
    },
  },
};
ChartJS.register(ArcElement, Tooltip, Legend);

export default defineComponent({
  name: "IndexPage",
  components: {
    UnosHrane,
    Doughnut,
    KarticaNutrijenata,
  },
  setup() {},

  data() {
    return {
      showDialog: false,
      showDialogDelete: false,
      // elementZaBrisanje sluzi za pohranu elementa koji se zeli izbrisati iz tablice kojeg sam proslijedio
      // u DialogDelete
      elementZaBrisanje: null,
      showWarningDialog: false,
      mealScore: {},
      jela: [],
      columns: [
        {
          name: "delete",
          required: true,
          label: "",
          align: "left",
          field: "delete",
          format: (val, row) => "",
          sortable: false,
        },
        {
          name: "naziv",
          required: true,
          label: "Naziv",
          align: "left",
          field: "naziv",
        },
        {
          name: "kalorije",
          required: true,
          label: "Kalorije",
          align: "left",
          field: "kalorije",
        },
        {
          name: "proteini",
          sortable: true,
          required: true,
          label: "Proteini",
          align: "left",
          field: "proteini",
        },
        {
          name: "ugljikohidrati",
          required: true,
          label: "Ugljikohidrati",
          align: "left",
          field: "ugljikohidrati",
        },
        {
          name: "masti",
          required: true,
          label: "Masti",
          align: "left",
          field: "masti",
        },
      ],
      loading: false,
      TDEE: null,
      preostaloKalorija: null,
      dataChart,
      chartOptions,
      chartKey: 0,
    };
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (userStore.fetchUser() == undefined) {
        this.korisnikNePostoji();
        this.$router.push("/login");
      } else {
        this.danasnjiUnos();
        foodStore.reset();
        this.mealScore = foodStore.fetchDataScore();
        if (userStore.fetchTDEE()) {
          // Kada se pokrene stranica, ucitava podatke od tu
          this.TDEE = userStore.fetchTDEE();
          dataChart.datasets[0].data[1] = this.TDEE;
          this.chartKey += 1;
        } else {
          // u slucaju refresha, ucitava podatke direktno iz baze
          userStore.fetchNewTDEE(user).then((data) => {
            userStore.setCalIntake(data);
            this.TDEE = userStore.fetchTDEE();
            dataChart.datasets[0].data[1] = this.TDEE;
            // chartKey refresha PieChart
            this.chartKey += 1;
          });
        }
      }
      // }
    });
  },
  methods: {
    onDialogHide() {
      this.showDialog = false;

      this.mealScore = foodStore.fetchDataScore();
    },

    async unosTablica(popisJela) {
      // Priprema podataka za unos u bazu podataka
      const baseUrl = "https://backend.diplomski.me/trazi";
      // Pohranjivanje rezultata pretrage za svako jelo
      const rezultati = []; // Pohranjivanje rezultata pretrage za svako jelo

      for (let jelo of popisJela) {
        try {
          const response = await fetch(
            `${baseUrl}?term=${encodeURIComponent(jelo[0])}`,
            {
              cors: "no-cors",
            }
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${jelo}. Status: ${response.status}`
            );
          }

          const data = await response.json();
          if (data && data.length > 0) {
            data[0].id = jelo[1];
            rezultati.push(...data); // Dodavanje svih podudarnih rezultata
          }
        } catch (error) {
          console.error(`Error fetching data for ${jelo}:`, error);
        }
      }

      this.jela = rezultati;
      foodStore.reset();
      this.mealScore = foodStore.fetchDataScore();

      for (let index = 0; index < rezultati.length; index++) {
        foodStore.addFats(rezultati[index].masti);
        foodStore.addCalories(rezultati[index].kalorije);
        foodStore.addProteins(rezultati[index].proteini);
        foodStore.addCarbs(rezultati[index].ugljikohidrati);

        this.mealScore = foodStore.fetchDataScore();
      }
      this.preostaloKalorija = this.TDEE - foodStore.fetchCalories();
      if (this.preostaloKalorija < 0) this.preostaloKalorija = 0;

      if (!!this.preostaloKalorija) {
        dataChart.datasets[0].data[0] = this.preostaloKalorija;
      } else dataChart.datasets[0].data[0] = 0;
    },
    danasnjiUnos() {
      const trenutniDatum = new Date().toISOString().split("T")[0];

      if (userStore.fetchUser().id) {
        const korisnikId = userStore.fetchUser().id;

        const q = query(
          collection(db, "prehrana"),
          where("datum", "==", trenutniDatum),
          where("korisnik", "==", korisnikId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const popisJela = [];
          querySnapshot.forEach((doc) => {
            popisJela.push([doc.data().jelo, doc.id]);
          });
          this.unosTablica(popisJela);
        });
      } else {
        this.korisnikNePostoji();
      }
    },

    async pripremiZaBrisanje(jelo) {
      this.elementZaBrisanje = jelo.key;
      this.showDialogDelete = true;
    },

    async brisanjeElementa() {
      await deleteDoc(doc(db, "prehrana", this.elementZaBrisanje));
      this.showDialogDelete = false;
      dataChart.datasets[0].data[0] = this.preostaloKalorija;
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
  },
  watch: {
    TDEE(newValue) {
      this.TDEE = newValue;
      dataChart.datasets[0].data[1] = this.TDEE;
      this.chartKey += 1;
    },
    preostaloKalorija(newValue) {
      if (foodStore.fetchCalories() > this.TDEE) {
        this.showWarningDialog = true;
      } else this.showWarningDialog = false;
      // Pracenje promjene vrijednosti preostalih kalorija i azuriranje grafa
      if (this.preostaloKalorija < 0) {
        this.$q.notify({
          color: "negative",
          message: "Prešli ste dnevni unos kalorija",
          icon: "report_problem",
          position: "top",
          timeout: 2000,
        });
      }

      this.chartKey += 1;
    },
  },
});
</script>

<style>
.q-table,
.q-table th,
.q-table td {
  font-size: 10px;
}

.pozicijaStatistika {
  background-color: #f0f0f0; /* Postavite boju kocke ovdje */
  border: 3px solid #ccc; /* Dodajte obrub kocke (opcionalno) */
}

.grid-card {
  width: calc(50% - 10px); /* Two cards side by side with gutter */
  margin-right: 10px;
  box-shadow: 7px 20px 15px rgba(0, 0, 0, 0.4);
}

.upozorenje {
  max-width: 60%;
  margin: 0 auto;
  border-radius: 8px;
  background-color: #ffc107; /* Boja za upozorenje */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  margin-top: 10px;
  font-size: 120%;
}

.kartice {
  margin-top: -60px;
  margin-bottom: -60px;
}

.doughnut {
  padding-bottom: 10px;
}
</style>
