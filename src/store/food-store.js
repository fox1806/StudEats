import { defineStore } from 'pinia'

export const useFoodStore = defineStore('foodStore', {
  state: () => ({
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
  }),
  actions: {
    addCalories(calories) {
      this.calories += calories
    },
    addProteins(proteins) {
      this.proteins += proteins
    },
    addFats(fats) {
      this.fats += fats
    },
    addCarbs(carbs) {
      this.carbs += carbs
    },
    reset() {
      this.calories = 0
      this.proteins = 0
      this.fats = 0
      this.carbs = 0
    },
    fetchCalories() {
      if(this.calories) {
        return this.calories
      }
    },
    deleteCalories(calories) {
      this.calories -= calories
    },
    deleteProteins(proteins) {
      this.proteins -= proteins
    },
    deleteFats(fats) {
      this.fats -= fats
    },
    deleteCarbs(carbs) {
      this.carbs -= carbs
    },
    fetchDataScore(){
      //!this.calories || !this.proteins || !this.fats || !this.carbs

        return {
          calories: this.calories,
          proteins: this.proteins,
          fats: this.fats,
          carbs: this.carbs,
        }

    }

  },
})
