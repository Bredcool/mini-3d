<template>
  <Scene3D />
  <div class="text-overlay">
    <h1>Hi, I'm Bred 👋</h1>
    <p>A Fullstack Developer who builds clean, efficient, and scalable web applications</p>
  </div>
</template>

<script setup lang="ts">
import Scene3D from './components/Scene3D.vue'
</script>

<style scoped>
.text-overlay {
  position: relative;
  z-index: 1;
  color: rgb(104, 221, 129);
  padding: 100px 40px;
}
</style>
