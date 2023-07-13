<script setup>
import "vue3-toastify/dist/index.css"
import { loadFull } from "tsparticles"
import { RouterLink, RouterView } from "vue-router"
const particlesInit = async (engine) => {
  await loadFull(engine)
}
const particlesLoaded = async (container) => {
  //   console.log("Particles container loaded", container)
}
</script>

<template>
  <vue-particles id="tsparticles" :particlesInit="particlesInit" :particlesLoaded="particlesLoaded" url="particles.json" />
  <RouterView />
</template>
