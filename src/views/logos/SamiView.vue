<template>
    <div class="overlay">
        <div class="logo">
            <img class="image" src="@/assets/img/logos/sami.webp" alt="Artista" />
        </div>
    </div>
</template>
<style scoped>
body {
    margin: 0;
    padding: 0;
    /* background: transparent !important; */
    overflow: hidden;
    font-family: Arial, sans-serif;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* Esto asegura que el overlay no interfiera con la captura de pantalla */
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

@keyframes artista {
  0% {
    transform: scale(5) rotate3d(0, 0, 0, 0);
  }
  5% {
    transform: scale(1) rotate3d(-2, 4, 0, -25deg);
  }
  25% {
    transform: rotate3d(2, 2, 0, 25deg);
  }
  40% {
    transform: rotate3d(-2, 4, 0, -25deg);
  }
  55% {
    transform: rotate3d(2, 2, 0, 25deg);
  }
  70% {
    transform: rotate3d(-2, 4, 0, -25deg);
  }
  85% {
    transform: rotate3d(2, 2, 0, 25deg);
  }
  95% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(53%, 90%) scale(.3);
  }
}

.image {
  animation: artista 10s ease-in-out 1 forwards;
}
</style>