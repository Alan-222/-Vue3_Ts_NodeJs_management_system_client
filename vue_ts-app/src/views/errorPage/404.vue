<template>
  <div class="container">
    <div class="rocket"></div>

    <div class="hgroup">
      <h1>Page Not Found</h1>
      <h2>We couldn't find what you were looking for.</h2>
    </div>

    <p class="createdBy"><a href="/dashboard">go
        back to home &raquo;</a></p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'


const message = computed(() => {
  return 'The webmaster said that you can not enter this page...'
})

</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/404_images/bg.png');
  background-color: #1d1d1d;
  background-size: cover;
  color: #eee;
  font-family: Corbel, Arial, Helvetica, sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rocket {
  width: 275px;
  height: 375px;
  background: url('@/assets/404_images/rocket.png') no-repeat;
  // margin: 140px auto 50px;
  margin: 0 auto;
  position: relative;
}

.hgroup {
  display: block;
  margin: 0 auto;
  width: 850px;
  font-family: 'Century Gothic', Calibri, 'Myriad Pro', Arial, Helvetica, sans-serif;
  text-align: center;
}

h1 {
  color: #76D7FB;
  font-size: 60px;
  text-shadow: 3px 3px 0 #3D606D;
  white-space: nowrap;
}

h2 {
  color: #9FE3FC;
  font-size: 18px;
  font-weight: normal;
  padding: 25px 0;
}

/* Only Needed For The Demo Page */

p.createdBy {
  font-size: 15px;
  font-weight: normal;
  margin: 50px;
  text-align: center;
  text-shadow: none;
}

a,
a:visited {
  text-decoration: none;
  outline: none;
  border-bottom: 1px dotted #97cae6;
  color: #97cae6;
}

a:hover {
  border-bottom: 1px dashed transparent;
}
</style>
