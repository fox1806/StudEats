<template>
    <q-card class="grid-card ">
        <q-card-section>
          <div class="text-h6">Kalorije</div>
          <div class="text-h4">{{ calories }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="text-h6">Proteini</div>
          <div class="text-h4">{{ proteins }}</div>
        </q-card-section>
      </q-card>

      <q-card class="grid-card">
        <q-card-section>
          <div class="text-h6">Masti</div>
          <div class="text-h4">{{ fats }}</div>
        </q-card-section>
        <q-separator/>

        <q-card-section>
          <div class="text-h6">Ugljikohidrati</div>
          <div class="text-h4">{{ carbs }}</div>
        </q-card-section>
      </q-card>

</template>

<script>
export default {
  props: {
    calories: {
      type: Number,
      required: true
    },
    proteins: {
      type: Number,
      required: true
    },
    fats: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    }
  }
}
</script>

<style>

.grid-card {
  width: calc(50% - 10px); /* Prikaz 2 kartice jedan kraj drugog */
  margin-right: 10px;
  box-shadow: 7px 20px 15px rgba(0, 0, 0, 0.4);
}

@media (min-width: 768px) {
  .grid-card {
    width: calc(30% - 10px); /* Mobilni prikaz 2 kartice */
  }
}

.text-h6 {
  display: flex;
  justify-content: center;
}

.text-h4 {
  display: flex;
  justify-content: center;
}

</style>
