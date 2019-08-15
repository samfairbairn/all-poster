<template>
  <div id="app">
  </div>
</template>

<script>

import threeService from '@/services/threeService'

export default {
  name: 'app',
  data: () => ({
    service: undefined
  }),
  components: {
  },
  mounted() {
    this.service = new threeService(this.$el)
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
