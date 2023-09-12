<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Ups! Mislim da ste zalutali?
      </div>

      <div class="text-h4" style="opacity:.4">P.S. - ovdje nema zmajeva</div>

      <q-btn
      class="q-mt-xl"
      color="white"
      text-color="blue"
      unelevated
      to="/"
      label="Vrati me u čarobnu zemlju"
      no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>
