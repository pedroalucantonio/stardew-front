<script setup>
import { ref } from 'vue'

// Criando uma variável reativa
const contador = ref(0)

function incrementar() {
  contador.value++
}
</script>

<template>
  <header>
    <div>
      <a class="logo"><img src="../public/logo.ico" class="Galinha">
        <img src="../public/armazem-do-pierre.ico" class="Placa">
      </a>
    </div>
    <div class="searchbar">
      <input class="typebar" placeholder="Searchbar"></input>
    </div>

    <div class="login">
      <a href="click" >Login</a>
      <a href="click" >Register</a>
    </div>
  </header>

  <main>
    <div class="main">

    </div>
  </main>
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
  text-align: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.main{
  background-color: rgba(240, 248, 255, 0.513);
  margin: 0px 80px 50px 80px;
  height: 2000px;
  width: auto;
}
header{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.Galinha{
  width: 50px;
}
.logo{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.Placa{
  width: 150px;
}

.searchbar{
  display: flex;
  align-items: center;
  margin: 10px;
  width: 260px;
  height: 30px;
}

.typebar{
  background-color: rgba(240, 248, 255, 0.513);
  width: 100%;
  height: 100%;
  border: none;
  padding: 5px;
  opacity: 0.8;
  color:#000000;
}

input:focus {
  border-color: #000000;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 0, 0, 1);
}
input::placeholder {
  color: #000000;
  opacity: 0.5;
}
.login{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 30px;
  justify-content: space-between;
  width: 120px;
}

</style>
