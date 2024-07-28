<template>
  <div class="overlay">
    <div class="header">
      <img src="@/assets/logo.webp" class="image" alt="Logo" width="250" />
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

.header {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(0%) translateY(0%);
  /* background: rgba(0, 0, 0, 0.5); */
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  text-align: center;
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
