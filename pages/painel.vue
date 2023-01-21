<template>
  <div>
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
          label: 'site',
          tdClass: 'tbvertical'
        },
        {
          key: '1',
          sortable: true,
          label: 'Novo',
          tdClass: 'tbvertical'
        },
        {
          key: '2',
          sortable: true,
          label: 'Em Prospecção',
          tdClass: 'tbvertical'
        },
        {
          key: '3',
          sortable: true,
          label: 'Qualificado',
          tdClass: 'tbvertical'
        },
        {
          key: '4',
          sortable: true,
          label: 'Encerrado (-)',
          tdClass: 'tbvertical'
        },
        {
          key: '5',
          sortable: true,
          label: 'Encerrado (+)',
          tdClass: 'tbvertical'
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
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.registros()
            }
          } else {
            this.mensagemErro = error
            this.showErro = true
          }
          this.carregando = false
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
.tbvertical {
  vertical-align: auto;
}
.scrollArea {
  width: 100%;
  height: 74vh;
  overflow-x: hidden;

  padding-top: 20px;
  -ms-flex: 0 0 650px;
  flex: 0 0 600px;
  @media (max-width: 690px) {
    .my-sidebar {
      display: none;
    }
  }
}
</style>
