<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

  const route = useRoute();
  const imageWidth = computed(() => route.query.w || 250);
  const phone = computed(() => route.query.t || false);
  const phoneSize = computed(() => route.query.pz || 20);
  const top = computed(() => route.query.t || 0);
  const logoUniversal = computed(() => route.query.u || false);
</script>
<template>
  <div class="overlay">
    <div class="header-left" :style="`top: ${top}px;`">
      <img v-if="logoUniversal" src="@/assets/logo-universal.png" alt="Logo" width="200" />
    </div>
    <div class="header-right" :style="`top: ${top}px;`">
      <img src="@/assets/logo-white.webp" class="image" alt="Logo" :width="imageWidth" />
      <p v-if="phone" class="phone" :style="`font-size: ${phoneSize}px;`">901 891 426</p>
    </div>
    <div class="footer">
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
  pointer-events: none; /* Esto asegura que el overlay no interfiera con la captura de pantalla */
}

.header-left {
  position: absolute;
  left: 0;
  transform: translateX(0%) translateY(0%);
  /* background: rgba(0, 0, 0, 0.5); */
  padding: 20px 30px 0;
  border-radius: 5px;
  color: white;
  text-align: center;
}

.header-right {
  position: absolute;
  right: 0;
  transform: translateX(0%) translateY(0%);
  /* background: rgba(0, 0, 0, 0.5); */
  padding: 20px 30px 0;
  border-radius: 5px;
  color: white;
  text-align: center;
}

.phone {
  /* color: #333333; */
  font-weight: bold;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  text-shadow: 0 0 7px #000000;
  padding: 0;
  margin: 5px 0;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  /* background: rgba(0, 0, 0, 0.5); */
  padding: 0px 20px;
  border-radius: 5px;
  color: white;
  text-align: center;
  width: 90%;
}

.footer > video {
  width: 100%;
}

@keyframes spinAndPause {
  0% {
    transform: rotateY(0);
  }
  40% {
    transform: rotateY(0);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.image {
  animation: spinAndPause 5s infinite;
}
</style>
