import {
  db,
  onAuthStateChanged,
  auth,
  doc,
  collection,
  query,
  where,
  onSnapshot,
} from "../boot/firebase.js";
import { useUserStore } from "../store/user-store";
const { parse, getISOWeek } = require("date-fns");
import { userStore } from "./PrikazStatistika.vue";

export default (await import("vue")).defineComponent({
  name: "PrikazStatistika",
  components: {
    KarticaNutrijenata,
  },
  beforeRouteUpdate(to, from, next) {
    const userStore = useUserStore();
    if (userStore.fetchUser() == undefined) {
      next(false); // spriječava učitavanje stranice
    } else {
      this.email = userStore.fetchUser().email;

      next(); // dozvoljava učitavanje stranice
    }
  },
  mounted() {
    const userStore = useUserStore();
    auth.onAuthStateChanged((user) => {
      if (!user) {
        this.korisnikNePostoji();
        this.$router.push("/login");
      }
      // }
    });
  },
  data() {
    return {
      myLocale: {
        /* Tjedan počinje ponedjeljkom */
        days: "Nedjelja_Ponedjeljak_Utorak_Srijeda_Četvrtak_Petak_Subota".split(
          "_"
        ),
        daysShort: "Ned_Pon_Uto_Sri_Čet_Pet_Sub".split("_"),
        months:
          "Siječanj_Veljača_Ožujak_Travanj_Svibanj_Lipanj_Srpanj_Kolovoz_Rujan_Listopad_Studeni_Prosinac".split(
            "_"
          ),
        monthsShort: "Sij_Velj_Ožu_Tra_Svi_Lip_Srp_Kol_Ruj_Lis_Stu_Pro".split(
          "_"
        ),
        firstDayOfWeek: 1,
        format24h: true,
        pluralDay: "dana",
      },

      odabraniMjesec: null,
      months: [
        { label: "Siječanj", value: 1 },
        { label: "Veljača", value: 2 },
        { label: "Ožujak", value: 3 },
        { label: "Travanj", value: 4 },
        { label: "Svibanj", value: 5 },
        { label: "Lipanj", value: 6 },
        { label: "Srpanj", value: 7 },
        { label: "Kolovoz", value: 8 },
        { label: "Rujan", value: 9 },
        { label: "Listopad", value: 10 },
        { label: "Studeni", value: 11 },
        { label: "Prosinac", value: 12 },
      ],
      selectedWeek: [],

      // selectedStatType: [],
      selectedStatType: "Tjedno",
      praznoPolje: false,
      trenutniTjedan: "",
      datumTjedan: "",
      brojDanaTjedna: "",
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
    };
  },
  created() {
    // Kreiranje trenutnog datuma u formatu YYYY-MM-DD
    // Trenutni datum se koristi kao fiksna tocka iznad koje se ne moze prikazati statistika
    this.trenutniTjedan = new Date().toISOString().substr(0, 10);
    this.trenutniTjedan = this.tjedanGodine(this.trenutniTjedan);

    this.resetNutritivnihVrijednosti();

    this.ucitajPodatkeOsobe();
  },

  methods: {
    async ucitajPodatkeOsobe() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const unsub = onSnapshot(doc(db, "korisnici", user.uid), (doc) => {
            if (!!doc.data()) {
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
      const dateParse = parse(datum, "yyyy-MM-dd", new Date());
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
          const dateObject = new Date(
            dateParts[0],
            dateParts[1] - 1,
            dateParts[2]
          );

          if (
            dateObject.getFullYear() === year &&
            getWeekNumber(dateObject) === weekNumber
          ) {
            filteredData[key] = data[key];
          }
        }
      }
    },
    getWeekNumber(dateString) {
      const date = new Date(dateString + "T00:00:00");
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7)); // Ponedjeljak
      const week1 = new Date(date.getFullYear(), 0, 4);
      week1.setDate(week1.getDate() + 3 - ((week1.getDay() + 6) % 7));
      return (
        1 +
        Math.round(
          ((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
        )
      );
    },

    async unosTablica(popisJela) {
      this.ucitano = false;
      // Priprema podataka za unos u bazu podataka
      const baseUrl = "https://backend.diplomski.me/trazi";

      // Pohranjivanje rezultata pretrage za svako jelo
      const rezultati = []; // Pohranjivanje rezultata pretrage za svako jelo
      for (let jelo of popisJela) {
        try {
          const response = await fetch(
            `${baseUrl}?term=${encodeURIComponent(jelo)}`
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${jelo}. Status: ${response.status}`
            );
          }

          const data = await response.json();
          if (data && data.length > 0) {
            rezultati.push(...data); // Dodavanje svih podudarnih rezultata
          }
        } catch (error) {
          console.error(`Error fetching data for ${jelo}:`, error);
        }
      }

      this.resetNutritivnihVrijednosti();
      for (let index = 0; index < rezultati.length; index++) {
        this.kalorije += rezultati[index].kalorije;
        this.masti += rezultati[index].masti;
        this.ugljikohidrati += rezultati[index].ugljikohidrati;
        this.proteini += rezultati[index].proteini;
      }
      if (this.selectedStatType === "Tjedno") {
        if (this.brojDanaTjedna === 0) {
          this.brojDanaTjedna = 7;
        }
        this.kalorije = Math.round(this.kalorije / 7);
        this.masti = Math.round(this.masti / 7);
        this.ugljikohidrati = Math.round(this.ugljikohidrati / 7);
        this.proteini = Math.round(this.proteini / 7);
      }
      if (this.selectedStatType === "Mjesečno") {
        const daysInMonth = new Date(
          2023,
          this.odabraniMjesec.value,
          0
        ).getDate();
        this.kalorije = Math.round(this.kalorije / daysInMonth);
        this.masti = Math.round(this.masti / daysInMonth);
        this.ugljikohidrati = Math.round(this.ugljikohidrati / daysInMonth);
        this.proteini = Math.round(this.proteini / daysInMonth);
      }
      this.statistickaObradaKalorija();
      this.statistickaObradaProteina();
    },
    getDataWeek(zadaniTjedan) {
      const trenutniDatum = new Date().toISOString().split("T")[0];
      this.resetNutritivnihVrijednosti();

      if (userStore.fetchUser().id) {
        const korisnikId = userStore.fetchUser().id;

        const q = query(
          collection(db, "prehrana"),
          where("korisnik", "==", korisnikId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const popisJela = [];
          querySnapshot.forEach((doc) => {
            popisJela.push([doc.data()]);
          });

          const filteredData = [];

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
          if (filteredData.length === 0) {
            this.praznoPolje = true;
          } else {
            this.praznoPolje = false;
            this.unosTablica(filteredData).then(() => {
              this.ucitano = true;
            });
          }
        });
      }
    },
    loadData() {
      this.odabraniMjesec = "";
      this.potrebniProteini = 0;
      this.praznoPolje = false;
      this.resetNutritivnihVrijednosti();
    },
    dateChangeDay(odabraniDatum) {
      this.resetNutritivnihVrijednosti();
      if (userStore.fetchUser().id) {
        const korisnikId = userStore.fetchUser().id;

        const q = query(
          collection(db, "prehrana"),
          where("korisnik", "==", korisnikId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const popisJela = [];
          querySnapshot.forEach((doc) => {
            if (doc.data().datum == odabraniDatum) {
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
          if (filteredData.length === 0) {
            this.praznoPolje = true;
          } else {
            this.praznoPolje = false;
            this.unosTablica(filteredData).then(() => {
              this.ucitano = true;
            });
          }
        });
      }
    },
    dateChangeWeek(odabraniDatum) {
      this.brojDanaTjedna = null;
      const startDate = new Date(odabraniDatum);
      const endDate = new Date(odabraniDatum);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Namjesteno da je ponedjeljak prvi dan
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()) + 1); // namjesteno da je nedjelja zadnji dan

      const startWeek = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
      const endWeek = `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      this.selectedWeek = [startWeek, endWeek];
      // dio koda koji obradjuje podatke za odabrani tjedan
      const odabraniTjedan = this.tjedanGodine(this.datumTjedan);

      // kreiranje tekuceg tjedna
      const tekuciTjedan = new Date();
      const pocetniTjedan = new Date(tekuciTjedan.getFullYear(), 0, 1);
      const days = Math.floor(
        (tekuciTjedan - pocetniTjedan) / (24 * 60 * 60 * 1000)
      );

      const tekuciBrojTjedan = Math.ceil(days / 7);

      if (tekuciBrojTjedan === odabraniTjedan) {
        const today = new Date();
        this.brojDanaTjedna = today.getDay();

        console.log("trenutni tjedan", this.brojDanaTjedna);
      }

      this.datumTjedan = { from: startWeek, to: endWeek };
      this.getDataWeek(odabraniTjedan);

      this.statistickaObradaProteina();
    },
    dateChangeMonth(odabraniMjesec) {
      this.resetNutritivnihVrijednosti();
      if (userStore.fetchUser().id) {
        const korisnikId = userStore.fetchUser().id;

        const q = query(
          collection(db, "prehrana"),
          where("korisnik", "==", korisnikId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const popisJela = [];
          querySnapshot.forEach((doc) => {
            const datum = doc.data().datum;

            const dateParts = datum.split("-");
            if (dateParts[1] == odabraniMjesec.value) {
              popisJela.push([doc.data().jelo]);
            }
          });

          this.podaci = popisJela;
          if (this.podaci.length === 0) {
            this.praznoPolje = true;
          } else {
            this.praznoPolje = false;
            this.unosTablica(this.podaci).then(() => {
              this.ucitano = true;
            });
          }
        });
      }
    },

    statistickaObradaProteina() {
      // Obradjuje koliko je proteina potrebno naprema kilazi korisnika
      this.ucitajPodatkeOsobe();
      if (this.atletskaSpremnost === "Rekreacijski") {
        this.potrebniProteini = this.tezina * 1.3;
      } else if (this.atletskaSpremnost === "Natjecateljski") {
        this.potrebniProteini = this.tezina * 1.6;
      } else {
        this.potrebniProteini = this.tezina * 0.8;
      }
      if (this.proteini < this.potrebniProteini) {
        return "Nedostatak proteina za navedeni period";
      } else {
        return "Dovoljno proteina za navedeni period";
      }
    },
    statistickaObradaKalorija() {
      if (this.kalorije < userStore.fetchTDEE()) {
        return "Nedostatak kalorija za navedeni period";
      } else {
        return "Dovoljno kalorija za navedeni period";
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
  },
});
