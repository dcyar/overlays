<template>
    <div class="overlay">
      <div class="header">
        <!-- <h1>Tu Nombre del Stream</h1> -->
      </div>
      <div class="footer">
        <img src="@/assets/img/270724.webp" width="100%" alt="Evento 270724" />
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
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
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
    width: 96%;
  }
  
  .footer > video {
    width: 100%;
  }
  </style>
  