<template>
  <div class="page" :style="wallpaperStyle">
    <header>
      <div>
        <a class="logo" href="/">
          <img src="/logo.ico" class="Galinha" alt="Logo Stardew Valley">
          <img src="/armazem-do-pierre.ico" class="Placa" alt="Armazém do Pierre">
        </a>
      </div>
      <div v-if="!authMode && authUser" class="searchbar">
        <input
          v-model="search"
          class="typebar"
          type="search"
          placeholder="Buscar sementes..."
          aria-label="Buscar sementes"
        >
      </div>

      <nav class="login" aria-label="Autenticação">
        <template v-if="authUser">
          <span class="welcome">Olá, {{ authUser.name }}</span>
          <button class="nav-button" type="button" @click="logout">Sair</button>
        </template>
        <template v-else-if="authMode !== 'checking'">
          <a href="#login" @click.prevent="setAuthMode('login')">Entrar</a>
          <a href="#register" @click.prevent="setAuthMode('register')">Cadastrar</a>
        </template>
      </nav>
    </header>

    <main v-if="authMode === 'checking'" class="main auth-main" aria-live="polite">
      <p class="message">Verificando sessão...</p>
    </main>

    <main v-else-if="authMode" class="main auth-main">
      <section class="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">{{ authMode === 'login' ? 'Bem-vindo de volta' : 'Criar conta' }}</h1>
        <p class="auth-intro">
          {{ authMode === 'login'
            ? 'Entre para conferir as sementes do Armazém do Pierre.'
            : 'Cadastre-se para acessar o estoque do Armazém do Pierre.' }}
        </p>

        <form class="auth-form" @submit.prevent="submitAuth">
          <label v-if="authMode === 'register'" for="name">Nome</label>
          <input
            v-if="authMode === 'register'"
            id="name"
            v-model.trim="credentials.name"
            name="name"
            type="text"
            autocomplete="name"
            required
            maxlength="255"
          >

          <label for="email">E-mail</label>
          <input
            id="email"
            v-model.trim="credentials.email"
            name="email"
            type="email"
            autocomplete="email"
            required
          >

          <label for="password">Senha</label>
          <input
            id="password"
            v-model="credentials.password"
            name="password"
            type="password"
            :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
            required
            :minlength="authMode === 'register' ? 8 : undefined"
          >

          <template v-if="authMode === 'register'">
            <label for="password-confirmation">Confirme a senha</label>
            <input
              id="password-confirmation"
              v-model="credentials.password_confirmation"
              name="password_confirmation"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
            >
          </template>

          <p v-if="authError" class="auth-error" role="alert">{{ authError }}</p>
          <button class="submit-button" type="submit" :disabled="authSubmitting">
            {{ authSubmitting
              ? 'Aguarde...'
              : authMode === 'login' ? 'Entrar' : 'Criar conta' }}
          </button>
        </form>

        <p class="auth-switch">
          {{ authMode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?' }}
          <a
            :href="authMode === 'login' ? '#register' : '#login'"
            @click.prevent="setAuthMode(authMode === 'login' ? 'register' : 'login')"
          >
            {{ authMode === 'login' ? 'Cadastre-se' : 'Entrar' }}
          </a>
        </p>
      </section>
    </main>

    <main v-else class="main">
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
  display: flow-root;
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

.welcome {
  color: #fff;
}

.nav-button {
  border: 0;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: #527a35;
  color: #fff;
  cursor: pointer;
  font: inherit;
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

.auth-main {
  display: grid;
  min-height: 65vh;
  place-items: center;
}

.auth-card {
  width: min(440px, 100%);
  padding: 2rem;
  border: 2px solid #75934a;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 3px 8px rgba(40, 55, 25, 0.15);
}

.auth-card h1 {
  margin-bottom: 0.5rem;
}

.auth-intro,
.auth-switch {
  text-align: center;
}

.auth-form {
  display: grid;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.auth-form label {
  margin-top: 0.35rem;
  font-weight: 600;
}

.auth-form input {
  width: 100%;
  min-height: 42px;
  padding: 0.55rem 0.7rem;
  border: 1px solid #75806e;
  border-radius: 6px;
  background: #fff;
  color: #26351f;
  font: inherit;
}

.submit-button {
  min-height: 44px;
  margin-top: 0.75rem;
  border: 0;
  border-radius: 6px;
  background: #527a35;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.auth-error {
  color: #7f1d1d;
}

.auth-switch {
  margin-top: 1.25rem;
}

.auth-switch a {
  color: #365923;
  font-weight: 600;
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
import { api } from './api/http.js'
import { login } from './api/auth/login.js'
import { register } from './api/auth/register.js'
import fallWallpaper from './components/fall.png'
import winterWallpaper from './components/winter.png'
import springWallpaper from './components/spring.png'
import summerWallpaper from './components/summer.png'

const seeds = ref([])
const authMode = ref('checking')
const authUser = ref(null)
const authSubmitting = ref(false)
const authError = ref('')
const credentials = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
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
  'Tomato Seeds': 'Sementes de Tomate',
  'Hot Pepper Seeds': 'Sementes de Pimenta',
  'Corn Seeds': 'Sementes de Milho',
  'Pumpkin Seeds': 'Sementes de Abóbora',
  'Cranberry Seeds': 'Sementes de Oxicoco',
  'Yam Seeds': 'Sementes de Inhame',
  'Sunflower Seeds': 'Sementes de Girassol',
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
    const data = await api('/api/seeds')
    seeds.value = Array.isArray(data) ? data : data.data
  } catch (cause) {
    console.error('Erro ao carregar sementes da API:', cause)
    apiError.value = 'Não foi possível carregar as sementes. Verifique se a API está disponível.'
  } finally {
    loading.value = false
  }
}

function setAuthMode(mode) {
  authMode.value = mode
  authError.value = ''
  credentials.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  }
}

function getAuthError(cause) {
  const errors = cause.data?.errors
  if (errors) return Object.values(errors).flat().join(' ')
  if (cause.status === 401) return 'E-mail ou senha inválidos.'
  return cause.data?.message ?? 'Não foi possível concluir a autenticação. Tente novamente.'
}

async function submitAuth() {
  authSubmitting.value = true
  authError.value = ''

  try {
    const user = authMode.value === 'login'
      ? await login({
          email: credentials.value.email,
          password: credentials.value.password,
        })
      : await register(credentials.value)

    authUser.value = user.data ?? user
    authMode.value = ''
    await loadSeeds()
  } catch (cause) {
    authError.value = getAuthError(cause)
  } finally {
    authSubmitting.value = false
  }
}

async function logout() {
  try {
    await api('/api/logout', { method: 'POST' })
    authUser.value = null
    seeds.value = []
    apiError.value = ''
    setAuthMode('login')
  } catch (cause) {
    console.error('Erro ao encerrar sessão:', cause)
    apiError.value = 'Não foi possível encerrar a sessão. Tente novamente.'
  }
}

async function loadCurrentSeasonWallpaper() {
  try {
    const data = await api('/api/estacao-atual')
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
  loadCurrentSeasonWallpaper()
  api('/api/me')
    .then((user) => {
      authUser.value = user.data ?? user
      authMode.value = ''
      return loadSeeds()
    })
    .catch((cause) => {
      authMode.value = 'login'

      if (cause.status === 401) return

      console.error('Erro ao verificar a sessão:', cause)
      authError.value = 'Não foi possível conectar à API. Verifique se ela está disponível.'
    })
    .finally(() => {
      loading.value = false
    })
})
</script>