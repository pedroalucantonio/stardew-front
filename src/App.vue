<template>
  <header>
    <div>
      <a class="logo" href="/">
        <img src="/logo.ico" class="Galinha" alt="Logo Stardew Valley">
        <img src="/armazem-do-pierre.ico" class="Placa" alt="Armazém do Pierre">
      </a>
    </div>
    <div class="searchbar">
      <input
        v-model="search"
        class="typebar"
        type="search"
        placeholder="Buscar sementes..."
        aria-label="Buscar sementes"
      >
    </div>

    <div class="login">
      <a href="#">Login</a>
      <a href="#">Register</a>
    </div>
  </header>

  <main class="main">
    <h1>Sementes de Stardew Valley</h1>
    <p v-if="loading" class="message">Carregando sementes...</p>
    <p v-else-if="apiError" class="message error">{{ apiError }}</p>
    <p v-else-if="filteredSeeds.length === 0" class="message">
      Nenhuma semente encontrada.
    </p>

    <section v-else class="seed-grid" aria-label="Lista de sementes">
      <article v-for="seed in filteredSeeds" :key="seed.id" class="seed-card">
        <h2>{{ translateSeed(seed.name) }}</h2>
        <dl>
          <div>
            <dt>Preço</dt>
            <dd>{{ seed.price }} ouros</dd>
          </div>
          <div>
            <dt>Tempo de crescimento</dt>
            <dd>{{ seed['days-to-grow'] }} dias</dd>
          </div>
          <div>
            <dt>Rebrota</dt>
            <dd>
              <template v-if="seed.regrowable">
                Sim<span v-if="seed['regrow-days']">
                  (a cada {{ seed['regrow-days'] }} dias)</span>
              </template>
              <template v-else>Não</template>
            </dd>
          </div>
          <div>
            <dt>Estação</dt>
            <dd>{{ seed.seasons.map((season) => translateSeason(season.name)).join(', ') || '—' }}</dd>
          </div>
        </dl>
      </article>
    </section>
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 2rem;
}

.Galinha {
  width: 50px;
}
.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.Placa {
  width: 150px;
}

.searchbar {
  display: flex;
  align-items: center;
  width: min(260px, 40vw);
}

.typebar {
  box-sizing: border-box;
  background-color: rgba(240, 248, 255, 0.513);
  width: 100%;
  min-height: 36px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  color: #000;
}

input:focus-visible {
  border-color: #000;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

input::placeholder {
  color: #000;
  opacity: 0.5;
}

.login {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login a {
  color: #26351f;
}

.main {
  width: min(1200px, calc(100% - 3rem));
  min-height: 60vh;
  margin: 1rem auto 3rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: rgba(240, 248, 255, 0.82);
  color: #26351f;
}

h1 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.seed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.seed-card {
  padding: 1.25rem;
  border: 2px solid #75934a;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 3px 8px rgba(40, 55, 25, 0.15);
}

.seed-card h2 {
  margin-bottom: 0.75rem;
  color: #26351f;
  font-size: 1.2rem;
}

.seed-card dl,
.seed-card dl div {
  display: grid;
  gap: 0.35rem;
}

.seed-card dl {
  gap: 0.75rem;
}

.seed-card dl div {
  grid-template-columns: 1fr auto;
  align-items: baseline;
}

.seed-card dt {
  font-weight: 600;
}

.seed-card dd {
  margin: 0;
  text-align: right;
}

.message {
  padding: 2rem 0;
  text-align: center;
}

.error {
  color: #7f1d1d;
}

@media (max-width: 600px) {
  header {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }

  .searchbar {
    order: 1;
    width: 100%;
  }

  .main {
    width: calc(100% - 2rem);
    padding: 1rem;
  }
}
</style>


<script setup>
import { computed, onMounted, ref } from 'vue'
import api from './services/api'

const seeds = ref([])
const search = ref('')
const loading = ref(true)
const apiError = ref('')
const seasonTranslations = {
  fall: 'Outono',
  winter: 'Inverno',
  spring: 'Primavera',
  summer: 'Verão',
}
const seedTranslations = {
  'Parsnip Seeds': 'Sementes de Chirívia',
  'Bean Starter': 'Muda de Feijão',
  'Cauliflower Seeds': 'Sementes de Couve-flor',
  'Potato Seeds': 'Sementes de Batata',
  'Kale Seeds': 'Sementes de Couve',
  'Strawberry Seeds': 'Sementes de Morango',
  'Blueberry Seeds': 'Sementes de Mirtilo',
  'Melon Seeds': 'Sementes de Melão',
  'Tomato Seeds': 'Sementes de Tomate',
  'Hot Pepper Seeds': 'Sementes de Pimenta',
  'Corn Seeds': 'Sementes de Milho',
  'Pumpkin Seeds': 'Sementes de Abóbora',
  'Cranberry Seeds': 'Sementes de Oxicoco',
  'Yam Seeds': 'Sementes de Inhame',
}

function translateSeason(name) {
  return seasonTranslations[name.toLowerCase()] ?? name
}

function translateSeed(name) {
  return seedTranslations[name] ?? name
}

const filteredSeeds = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()

  if (!query) return seeds.value

  return seeds.value.filter((seed) => {
    const seasonNames = seed.seasons
      .flatMap((season) => [season.name, translateSeason(season.name)])
      .join(' ')
    const seedNames = `${seed.name} ${translateSeed(seed.name)}`
    return `${seedNames} ${seasonNames}`.toLocaleLowerCase().includes(query)
  })
})

onMounted(async () => {
  try {
    const { data } = await api.get('/seeds')
    seeds.value = Array.isArray(data) ? data : data.data
  } catch (cause) {
    console.error('Erro ao carregar sementes da API:', cause)
    apiError.value = 'Não foi possível carregar as sementes. Verifique se a API está disponível.'
  } finally {
    loading.value = false
  }
})
</script>