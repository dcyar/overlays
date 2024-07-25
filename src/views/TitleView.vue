<template>
  <div class="overlay">
    <div class="footer">
      <div class="text">
        <span>EN VIVO</span>
      </div>
      <div class="title">
        <h1>Este es un titulo demo para este overlay</h1>
      </div>
      <div class="subtitle">
        <h2>Este es un subtitulo para la demo</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1, h2 {
  margin: 0;
  padding: 0;
}
.overlay {
  display: flex;
  align-items: end;
  justify-content: center;
  width: 100%;
  height: 100vh;
  pointer-events: none; /* Esto asegura que el overlay no interfiera con la captura de pantalla */
  background-color: aquamarine;
}

.footer {
  margin-bottom: 10px;
  width: 90%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
}

.text span {
  background-color: #ff0000;
  padding: 3px 10px;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 1.2em;
  z-index: 1;
}

.text {
  animation: ups 2s backwards;
}

.title {
  position: relative;
  background-color: #ffffff;
  text-transform: uppercase;
  padding: 7px 18px;
  border-left: #ff0000 11px solid;
  box-sizing: border-box;
  z-index: 10;
  overflow: hidden;
}

.title h1 {
  animation: ups 2s backwards;
}

.subtitle {
  position: relative;
  background-color: #42044e;
  padding: 3px 18px;
  color: #ffffff;
  border-left: #ff0000 11px solid;
  box-sizing: border-box;
  z-index: 10;
}

.subtitle > h2 {
  font-weight: 100;
  font-size: 1.3em;
  animation: ups 2s backwards;
}

@keyframes ups {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>