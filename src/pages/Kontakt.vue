<template>
  <q-page class="q-pa-md page-container">
    <q-card class="my-card">
      <q-card-section class="card-header">
        <div class="text-h6">Kontakt informacije</div>
      </q-card-section>
      <q-card-section class="card-body">
        Ako imate pitanja ili komentare, slobodno me kontaktirajte.
      </q-card-section>
      <q-card-section class="card-list">
        <q-list>
          <q-item class="list-item">
            <q-item-section avatar>
              <q-icon name="email"></q-icon>
            </q-item-section>
            <q-item-section>
              alen.abdulahovic1@gmail.com
            </q-item-section>
          </q-item>
          <q-item class="list-item">
            <q-item-section avatar>
              <q-icon name="phone"></q-icon>
            </q-item-section>
            <q-item-section>
              0958781355
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'ContactPage'
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  height: 100%;
}

.my-card {
  max-width: 600px;
  width: 100%;
  background: #ffffff;
  box-shadow: 10px 4px 8px rgba(0,0,0,0.1);
}

.card-header {
  background: #26A69A;
  color: white;
  padding: 16px;
}

.card-body {
  padding: 16px;
  line-height: 1.6;
  font-size: 16px;
}

.card-list {
  padding: 16px;
}

.list-item {
  padding: 8px;
  background: #f9f9f9;
  margin: 4px 0;
  border-radius: 4px;
}
</style>
