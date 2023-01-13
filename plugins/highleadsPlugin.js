import Vue from 'vue'

Vue.mixin({
  methods: {
    refreshToken (token) {
      const url = '/v1/refresh-token'
      this.$axios.$get(url, { headers: { Authorization: 'Bearer ' + token } })
        .then((ret) => {
          this.$store.commit('token', ret.token)
        })
        .catch(() => {
          this.$store.commit('token', '')
        })
    }
  }
})
