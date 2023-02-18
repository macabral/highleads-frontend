<template>
  <div>
    <b-container fluid>
      <h3 class="cabec">
        {{ pageName }}
      </h3>
      <div v-if="showAlert" style="padding-top:10px;">
        <b-alert v-model="showAlert" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
        <br></br>
      </div>
      <p v-if="showParam">Olá, para não receber mais emails no endereço <b>{{ email }}</b> <a href="#" @click="cancelarInscricao()">clique aqui</a>. [Se este não for seu email, por favor, feche esta janela.]</p>
      <b-row>
        <b-col cols="12" md="12" sm="12">
          <iframe :src="site" onload="this.width=screen.width-100;this.height=screen.height;"></iframe>
        </b-col>
      </b-row>
      {{ email }}
    </b-container>
    <!------------------------------------------------------------------------------------------------- Cancelar -->
    <b-modal id="modal-cancelar" title="Cancelar Inscrição" hide-footer>
      <h4>
        Olá, você confirma que não deseja mais receber emails?
        <br>
      </h4>
      <div class="text-right">
        <b-button
          class="mt-3"
          variant="primary"
          @click="cancelar()"
        >
          Sim
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-cancelar')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'CancelarPage',
  data () {
    return {
      pageName: 'Cancelar Inscrição',
      url1: '/v1/cancelar-inscricao',
      url2: '/v1/cancelar-uniqueid',
      showAlert: false,
      mensagemErro: '',
      carregando: false,
      param: '',
      site: '',
      showParam: true,
      email: ''
    }
  },
  mounted () {
    this.param = location.search.substr(1).split('=')[1]
    this.uniqueid()
  },
  methods: {
    // --------------------------------------------------------------------------------------  hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    cancelarInscricao () {
      this.$root.$emit('bv::show::modal', 'modal-cancelar', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- le registros
    uniqueid () {
      this.mensagemErro = ''
      this.carregando = true
      this.showAlert = false
      this.showParam = false
      this.$axios.$get(this.url2 + '/' + this.param)
        .then((ret) => {
          this.site = ret.site
          this.email = ret.email
          this.carregando = false
          this.showParam = true
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagemErro = 'Erro ao conectar ao servidor backend. Por favor, tente mais tarde.'
            this.showAlert = true
            this.carregando = false
          } else {
            this.carregando = false
            this.mensagemErro = 'Ocorreu um erro ao identificar seu endereço de email.'
            this.showAlert = true
          }
        })
    },
    // -------------------------------------------------------------------------------------- le registros
    cancelar () {
      this.hideModal('modal-cancelar')
      this.mensagemErro = 'Cancelando Inscrição...'
      this.carregando = true
      this.showAlert = true
      this.showParam = false
      this.$axios.$get(this.url1 + '/' + this.param)
        .then((ret) => {
          this.items = ret
          this.carregando = false
          this.mensagemErro = 'Inscrição cancelada com sucesso!'
          this.param = ''
        })
        .catch((error) => {
          this.showParam = true
          if (!error.response) {
            this.mensagemErro = 'Erro ao conectar ao servidor backend. Por favor, tente mais tarde.'
            this.showAlert = true
            this.carregando = false
          } else {
            this.mensagemErro = error
            this.showAlert = true
          }
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>

</style>
