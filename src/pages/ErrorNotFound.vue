<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 25vh">404</div>

      <div class="text-h2" style="opacity: 0.8">HIC SUNT DRACONES</div>

      <div class="text-h4 q-pa-md" style="opacity: 0.4">
        Omnem relinquite spem, O vos qui intratis
      </div>

      <q-btn
        class="q-mt-md"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Vrati me"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
