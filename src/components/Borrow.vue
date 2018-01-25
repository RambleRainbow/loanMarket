<template>
  <div>
    <mu-paper :rounded="true" :zDepth="3" style="padding:10px">
      <mu-text-field label="您所在的城市" labelFloat :fullWidth="true" icon="location_on"/>
      <mu-text-field label="贷款额度" labelFloat :fullWidth="true" icon="credit_card"></mu-text-field>
      <div>
          <mu-text-field style="width:50%" label="您的称呼" labelFloat :fullWidth="true" icon="contacts"></mu-text-field>
          <mu-radio label="先生" name="group" nativeValue="simple1" v-model="value" style="top:8px;margin-right:24px" />
          <mu-radio label="女士" name="group" nativeValue="simple1" v-model="value" style="top:8px"/>
      </div>
      <mu-text-field label="您的手机号码" labelFloat :fullWidth="true" icon="phone"></mu-text-field>
      <mu-raised-button label="马上提交" @click="onRequestLoan" fullWidth primary></mu-raised-button>
    </mu-paper>
  </div>
</template>

<script>
  export default {
    methods: {
      onRequestLoan() {
        alert('b');
      }
    }
  }
</script>
