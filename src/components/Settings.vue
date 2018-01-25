<template>
  <div>
    <mu-list>
      <mu-sub-header>通道设置</mu-sub-header>
      <mu-list-item v-for="(channel,index) in channels" :title="channel.name">
        <mu-switch v-model="channel.isOpen" slot="right"/>
      </mu-list-item>
    </mu-list>
  </div>
</template>

<script>
  import _ from 'lodash';
  import axios from 'axios';

  function channelOpen(index) {
    return this.channels[index].isOpen;
  }

  let curryChannelOpen = _.curry(channelOpen);

  function watchChannelOpen(index, oldValue, newValue) {
    this.updateChannelOpenState(this.channels[index].id, newValue);
  }

  let curryWatchChannelOopen = _.curry(watchChannelOpen);

  export default {
    data() {
      return {
        channels: [
          {id: 10, name: "好贷网", isOpen: true},
          {id: 20, name: "东方融资网", isOpen: false},
          {id: 30, name: "你我贷", isOpen: false},
          {id: 50, name: "宜信贷款网", isOpen: true},
        ]
      };
    },
    computed: {
      channelOpen0: function() {return this.channels[0].isOpen;},
      channelOpen1: function() {return this.channels[1].isOpen;},
      channelOpen2: function() {return this.channels[2].isOpen;},
      channelOpen3: function() {return this.channels[3].isOpen;},
    },
    watch: {
      channelOpen0(oldValue, newValue) {
        this.setChannelOpen(0, newValue);
      },
      channelOpen1(oldValue, newValue) {
        alert(this.channels[1].name + ',' + this.channels[1].isOpen + ',' + oldValue + ',' + newValue);
      },
      channelOpen2(oldValue, newValue) {
        alert(this.channels[2].name + ',' + this.channels[2].isOpen + ',' + oldValue + ',' + newValue);
        this.channels[3].isOpen = this.channels[2].isOpen;
      },
      channelOpen3(oldValue, newValue) {
        alert(this.channels[3].name + ',' + this.channels[3].isOpen + ',' + oldValue + ',' + newValue);
      }
    },
    methods: {
      setChannelOpen: _.debounce(
        function(index, isOpen) {
           axios({
             method: 'PATCH',
             url: '/channels/' + this.channels[index].id,
             data: {
               isOpen: isOpen
             }
           })
        }
      )
    }
  }
</script>
