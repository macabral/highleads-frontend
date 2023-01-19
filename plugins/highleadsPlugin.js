import Vue from 'vue'

Vue.mixin({
  methods: {
    refreshToken () {
      const url = '/v1/refresh-token'
      this.$axios.$get(url, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.$store.commit('token', ret.token)
          return true
        })
        .catch(() => {
          this.$router.push('/')
          return false
        })
    }
  }
})
