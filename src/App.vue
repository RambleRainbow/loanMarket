<template>
  <div id="app">
    <mu-appbar class="appbar">{{pageTitle}}</mu-appbar>
    <router-view class="router-view"/>
    <mu-bottom-nav :value="bottomNav" shift @change="handleChange">
      <mu-bottom-nav-item value="首页" title="首页" icon="home"/>
      <mu-bottom-nav-item value="查询" title="查询" icon="search"/>
      <mu-bottom-nav-item value="统计" title="统计" icon="insert_chart"/>
      <mu-bottom-nav-item value="设置" title="设置" icon="settings"/>
    </mu-bottom-nav>  </div>
</template>

<script>
  //import MuAppbar from "../node_modules/muse-ui/src/appBar/appBar.vue";
//  import MuBottomNav from "../node_modules/muse-ui/src/bottomNav/bottomNav.vue";

  export default {
//    components: {MuAppbar},
 //   components: {MuBottomNav},
    name: 'app',
    data() {
      return {
        bottomNav: '首页',
        pageTitle: '首页'
      }
    },
    methods: {
      handleChange(val) {
        console.log(arguments);
        this.bottomNav = val;
        this.pageTitle = val;
        this.$router.push('/settings');
      }
    }
  }
</script>

<style>

  .router-view {
    height: calc(100% - 56px * 2);
    padding: 10px;
  }

  .appbar {
    text-align: center;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100%;
  }
</style>
