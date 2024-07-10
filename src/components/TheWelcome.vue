<script setup>
import WelcomeItem from './WelcomeItem.vue'
import CameraIcon from './icons/IconCamera.vue'
</script>

<template>
  <nav>
    <WelcomeItem :link="'/sponsors'">
      <template #icon>
        <CameraIcon />
      </template>
      <template #heading>Sponsors</template>
      Overlay para mostrar el sponsor
    </WelcomeItem>
    <WelcomeItem :link="'/logo'">
      <template #icon>
        <CameraIcon />
      </template>
      <template #heading>Logo</template>
      Overlay para mostrar el logo
    </WelcomeItem>
  </nav>
</template>