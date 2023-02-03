<template>
  <div class="fundo">
    <b-container fluid>
      <h3 class="cabec">
        {{ pageName }}
      </h3>
      <div v-if="showAlert" style="padding-top:10px;">
        <b-alert v-model="showAlert" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <br>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
      </div>
    </b-container>
  </div>
</template>

<script>

export default {
  name: 'CancelarPage',
  data () {
    return {
      pageName: 'Cancelar Inscrição',
      url: '/v1/cancelar',
      showAlert: false,
      mensagemErro: '',
      carregando: true
    }
  },
  mounted () {
  },
  methods: {
    // -------------------------------------------------------------------------------------- le registros
    registros () {
      this.mensagemErro = ''
      this.carregando = true
      this.$axios.$get(this.url + '/' + this.$store.state.usuarioPerfil + '/' + this.$store.state.usuarioId, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.items = ret
          this.carregando = false
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagemErro = 'Erro ao conectar ao servidor backend.'
            this.showAlert = true
            this.carregando = false
          }
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.registros()
            }
          } else {
            this.mensagemErro = error
            this.showAlert = true
          }
          this.carregando = false
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>

</style>
