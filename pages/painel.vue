<template>
  <div>
    <NuxtLayout />
    <b-container fluid>
      <b-row class="vh-100" align-v="center" align-h="center">
        &nbsp;
      </b-row>
    </b-container>
  </div>
</template>
<script>
export default {
  name: 'PainelaPage',
  data () {
    return {
      pageName: 'Página Principal',
      token: '',
      mensagemErro: '',
      showAlert: false
    }
  },
  mounted () {
    this.validaToken()
  },
  methods: {
    // --------------------------------------------------------------------------------------  voltar
    voltar () {
      this.$router.push('/painel')
    },
    // ----------------------------------------------------------------------------------- valida token
    async validaToken () {
      if (this.token === '') {
        this.mensagemErro = 'Seu token está inválido.'
        this.showAlert = true
        return
      }
      const url = '/v1/token/' + this.token
      await this.$axios.$get(url)
        .catch(() => {
          this.mensagemErro = 'Seu token está inválido.'
          this.showAlert = true
        })
    }
  }
}
</script>
