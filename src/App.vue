<template>
  <div class="page" :style="wallpaperStyle">
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
      <h1>Produtos Disponíveis</h1>
      <label class="season-switch">
        <input
          v-model="showAllSeasons"
          type="checkbox"
          role="switch"
          aria-label="Mostrar sementes de todas as estações"
        >
        <span class="switch-track" aria-hidden="true"></span>
        <span>Lista de Estoque</span>
      </label>
      <h2>Sementes</h2>

      <p v-if="loading || (!showAllSeasons && currentSeasonLoading)" class="message">
        Carregando sementes...
      </p>
      <p v-else-if="apiError" class="message error">{{ apiError }}</p>
      <p v-else-if="currentSeasonError && !showAllSeasons" class="message error">
        {{ currentSeasonError }}
      </p>
      <p v-else-if="filteredSeeds.length === 0" class="message">
        Nenhuma semente encontrada.
      </p>

      <section v-else class="seed-grid" aria-label="Lista de sementes">
        <article v-for="seed in filteredSeeds" :key="seed.id" class="seed-card">
          <h2>{{ translateSeed(seed.name) }}</h2>
          <dl>
            <div>
              <dt>Tipo</dt>
              <dd>{{ seed.type }}</dd>
            </div>
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
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
}

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
  color: #ffffff;
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

.season-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.season-switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.switch-track {
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  padding: 3px;
  border-radius: 999px;
  background: #75806e;
  transition: background-color 0.2s ease;
}

.switch-track::before {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  content: '';
  transition: transform 0.2s ease;
}

.season-switch input:checked + .switch-track {
  background: #527a35;
}

.season-switch input:checked + .switch-track::before {
  transform: translateX(20px);
}

.season-switch input:focus-visible + .switch-track {
  outline: 3px solid #26351f;
  outline-offset: 3px;
}

h1,h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}
h2{
  border-bottom: 1px solid #525252;
  border-top: 1px solid #525252;
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
import fallWallpaper from './components/fall.png'
import winterWallpaper from './components/winter.png'
import springWallpaper from './components/spring.png'
import summerWallpaper from './components/summer.png'

const seeds = ref([])
const search = ref('')
const showAllSeasons = ref(false)
const loading = ref(true)
const apiError = ref('')
const currentSeason = ref('')
const currentSeasonLoading = ref(true)
const currentSeasonError = ref('')
const wallpaper = ref('')
const wallpaperBySeason = {
  fall: fallWallpaper,
  winter: winterWallpaper,
  spring: springWallpaper,
  summer: summerWallpaper,
}
const wallpaperStyle = computed(() => ({
  backgroundImage: wallpaper.value ? `url("${wallpaper.value}")` : 'none',
}))
const seasonTranslations = {
  fall: 'Outono',
  winter: 'Inverno',
  spring: 'Primavera',
  summer: 'Verão',
}
const seasonKeysByName = {
  fall: 'fall',
  outono: 'fall',
  winter: 'winter',
  inverno: 'winter',
  spring: 'spring',
  primavera: 'spring',
  summer: 'summer',
  verao: 'summer',
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
  const key = getSeasonKey(name)
  return seasonTranslations[key] ?? name
}

function getSeasonKey(name) {
  const normalizedName = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()

  return seasonKeysByName[normalizedName] ?? ''
}

function translateSeed(name) {
  return seedTranslations[name] ?? name
}

const filteredSeeds = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  const availableSeeds = showAllSeasons.value
    ? seeds.value
    : seeds.value.filter((seed) =>
        seed.seasons.some((season) => getSeasonKey(season.name) === currentSeason.value),
      )

  if (!query) return availableSeeds

  return availableSeeds.filter((seed) => {
    const seasonNames = seed.seasons
      .flatMap((season) => [season.name, translateSeason(season.name)])
      .join(' ')
    const seedNames = `${seed.name} ${translateSeed(seed.name)}`
    return `${seedNames} ${seasonNames}`.toLocaleLowerCase().includes(query)
  })
})

async function loadSeeds() {
  try {
    const { data } = await api.get('/seeds')
    seeds.value = Array.isArray(data) ? data : data.data
  } catch (cause) {
    console.error('Erro ao carregar sementes da API:', cause)
    apiError.value = 'Não foi possível carregar as sementes. Verifique se a API está disponível.'
  } finally {
    loading.value = false
  }
}

async function loadCurrentSeasonWallpaper() {
  try {
    const { data } = await api.get('/estacao-atual')
    const seasonKey = getSeasonKey(data.estacao ?? '')
    const selectedWallpaper = wallpaperBySeason[seasonKey]

    if (!selectedWallpaper) {
      throw new Error(`Estação atual desconhecida: ${data.estacao}`)
    }

    currentSeason.value = seasonKey
    wallpaper.value = selectedWallpaper
  } catch (cause) {
    console.error('Erro ao carregar a estação atual e seu wallpaper:', cause)
    currentSeasonError.value = 'Não foi possível carregar a estação atual.'
  } finally {
    currentSeasonLoading.value = false
  }
}

onMounted(() => {
  loadSeeds()
  loadCurrentSeasonWallpaper()
})
</script>