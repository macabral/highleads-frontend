<template>
  <div class="fundo">
    <NuxtLayout />
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
      <h3>Site/Status</h3>
      <b-row>
        <b-col cols="12">
          <b-table
            v-if="!carregando"
            responsive
            class="table scrollArea"
            striped
            hover
            small
            :items="items"
            :fields="fields"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: 'PrincipalPage',
  data () {
    return {
      pageName: 'Painel de Controle',
      url: '/v1/estat',
      showAlert: false,
      mensagemErro: '',
      carregando: true,
      items: [],
      fields: [
        {
          key: 'site',
          sortable: true,
          label: 'site'
        },
        {
          key: 'total',
          sortable: true,
          label: 'Total',
          tdClass: 'center-text',
          thClass: 'center-text'
        },
        {
          key: '1',
          sortable: true,
          label: 'Novo',
          tdClass: 'center-text',
          thClass: 'center-text'
        },
        {
          key: '2',
          sortable: true,
          label: 'Em Prosp.',
          tdClass: 'center-text',
          thClass: 'center-text'
        },
        {
          key: '3',
          sortable: true,
          label: 'Qualificado',
          tdClass: 'center-text',
          thClass: 'center-text'
        },
        {
          key: '4',
          sortable: true,
          label: 'Encerrado (-)',
          tdClass: 'center-text',
          thClass: 'center-text'
        },
        {
          key: '5',
          sortable: true,
          label: 'Encerrado (+)',
          tdClass: 'center-text',
          thClass: 'center-text'
        }
      ]
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.registros()
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
