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
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
      </div>
      <p v-if="showParam">Olá, para não receber mais emails <a href="#" @click="cancelarInscricao()">clique aqui</a>.</p>
      <b-row>
        <b-col cols="12" md="12" sm="12">
          <iframe :src="site" onload="this.width=screen.width-100;this.height=screen.height;"></iframe>
        </b-col>
      </b-row>
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
      url: '/v1/cancelar-inscricao',
      showAlert: false,
      mensagemErro: '',
      carregando: false,
      param: '',
      site: 'https://zoit.com.br/',
      showParam: true
    }
  },
  mounted () {
    this.param = location.search.substr(1).split('=')[1]
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
    cancelar () {
      this.hideModal('modal-cancelar')
      this.mensagemErro = 'Cancelando Inscrição...'
      this.carregando = true
      this.showAlert = true
      this.showParam = false
      this.$axios.$get(this.url + '/' + this.param)
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
