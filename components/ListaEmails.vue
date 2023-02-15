<template>
  <div>
    <b-container fluid>
      <b-button class="mr-2" @click="incluir()">
        Incluir Emails
      </b-button>
      <b-button v-if="items.length > 0" class="mr-2" variant="danger" @click="excluir()">
        Limpar Lista
      </b-button>
      <div v-if="showMsg" style="padding-top: 10px">
        <b-alert v-model="showMsg" dismissible>
          {{ mensagem }}
        </b-alert>
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
        <br><br>
      </div>
      <b-table
        v-if="!carregando"
        responsive
        class="table scrollArea"
        striped
        hover
        small
        :items="items"
        :fields="fields"
      >
        <template #cell(actions)="data">
          <b-button size="sm" variant="danger" @click="deleteEmail(data.item.id)">
            Excluir
          </b-button>
        </template>
      </b-table>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir Emails -->
    <b-modal id="modal-incluir" size="xl" title="Incluir Emails" hide-footer @hide="campanhasEmails()">
      <IncluirEmails :idcampanha="idcampanha" />
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir TODOS os emails da Campanha?
      </p>
      <div class="text-right">
        <b-button
          class="mt-3"
          variant="primary"
          @click="deleteAll()"
        >
          Excluir
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-excluir')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import IncluirEmails from '~/components/IncluirEmails.vue'

export default {
  name: 'TestPage',
  components: { IncluirEmails },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    idcampanha: Number
  },
  data () {
    return {
      pageName: 'TestEmail',
      url: '/v1/campanhas-emails',
      mensagem: '',
      showMsg: false,
      carregando: false,
      emailDestino: '',
      items: [],
      fields: [
        {
          key: 'outbounds.nome',
          sortable: true,
          label: 'Nome',
          tdClass: 'tbvertical'
        },
        {
          key: 'outbounds.email',
          sortable: true,
          label: 'email',
          tdClass: 'tbvertical'
        },
        {
          key: 'outbounds.empresa',
          sortable: true,
          label: 'Empresa',
          tdClass: 'tbvertical'
        },
        { key: 'actions', label: 'Ação' }
      ],
      idvalue: 0,
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.campanhasEmails()
  },
  methods: {
    // --------------------------------------------------------------------------------------  hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // -------------------------------------------------------------------------------------- Ler emils associados à Campanha
    campanhasEmails () {
      this.mensagem = 'Lendo lista de emails...'
      this.showMsg = true
      this.carregando = true
      this.$axios.$get(this.url + '/' + this.idcampanha, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.items = ret
          this.mensagem = ''
          this.showMsg = false
          this.carregando = false
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagem = 'Erro ao conectar ao servidor backend.'
            this.showMsg = true
            this.carregando = false
          } else if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.salvar()
            }
          } else {
            this.carregando = false
            this.mensagem = error
            this.showMsg = true
          }
        })
    },
    // -------------------------------------------------------------------------------------- Exclui um email da Campanha
    deleteEmail (id) {
      this.mensagem = 'Excluindo email'
      this.showMsg = true
      this.carregando = true
      this.$axios.$delete(this.url + '/' + id, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.campanhasEmails()
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagem = 'Erro ao conectar ao servidor backend.'
            this.showMsg = true
            this.carregando = false
          } else if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.salvar()
            }
          } else {
            this.carregando = false
            this.mensagem = error
            this.showMsg = true
          }
        })
    },
    // -------------------------------------------------------------------------------------- incluir
    incluir () {
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- excluir
    excluir () {
      this.$root.$emit('bv::show::modal', 'modal-excluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- Exclui todos os emails da Campanha
    deleteAll () {
      this.mensagem = 'Excluindo email'
      this.showMsg = true
      this.carregando = true
      this.$axios.$delete(this.url + '-all/' + this.idcampanha, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.hideModal('modal-excluir')
          this.campanhasEmails()
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagem = 'Erro ao conectar ao servidor backend.'
            this.showMsg = true
            this.carregando = false
          } else if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.salvar()
            }
          } else {
            this.carregando = false
            this.mensagem = error
            this.showMsg = true
          }
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
