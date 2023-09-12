<template>
  <q-page class="q-pa-md page-container">
    <q-card class="my-card">
      <q-card-section class="card-header">
        <div class="text-h6">Diplomski rad - Veleučilište u Rijeci</div>
      </q-card-section>
      <q-card-section class="card-body">
        Ova aplikacija je napravljena kao dio diplomskog rada na Veleučilištu u Rijeci.
      </q-card-section>
      <q-card-section class="card-body">
        Želja aplikacije je pomoći studentima u praćenju prehrane radi održavanja zdravog načina života.
      </q-card-section>
      <q-card-section class="card-list">
        <q-list>
          <q-item-label class="list-header">Ciljevi aplikacije:</q-item-label>
          <q-item class="list-item">
            <q-item-section>1. Istraživanje front end i back end tehnologija</q-item-section>

          </q-item>
          <q-item class="list-item">
            <q-item-section>2. Istraživanje tjelovježbe i prehrani koja pospješuje isto</q-item-section>
          </q-item>
          <q-item class="list-item">
            <q-item-section>3. Istraživanje prehrane u studentskim menzama </q-item-section>
          </q-item>
          <q-item class="list-item">
            <q-item-section>4. Implementacija korisničkih zahtjeva</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
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
  max-width: 800px;
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

.list-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.list-item {
  padding: 8px;
  background: #f9f9f9;
  margin: 4px 0;
  border-radius: 4px;
}
</style>
