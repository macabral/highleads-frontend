<template>
  <div>
    <b-container fluid>
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
      <!-- --------------------------------------------- filtros -->
      <b-form>
        <b-row>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="Nome">
              <b-form-input
                v-model="rowSelected.nome"
                size="sm"
                maxlength="80"
              />
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="email">
              <b-form-input
                v-model="rowSelected.email"
                maxlength="80"
                size="sm"
              />
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="Empresa">
              <b-form-input
                v-model="rowSelected.empresa"
                size="sm"
                maxlength="80"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Posição">
              <b-form-input
                v-model="rowSelected.posicao"
                maxlength="80"
                size="sm"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Cidade">
              <b-form-input
                v-model="rowSelected.cidade"
                size="sm"
                maxlength="80"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="Categoria">
              <b-form-select v-model="rowSelected.categorias_fk" :options="categoriasOpt" />
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="Cliente">
              <b-form-select v-model="rowSelected.iscliente" :options="ativoOpt" />
            </b-form-group>
          </b-col>
          <b-col cols="4" md="4" sm="4">
            <b-form-group label="Inbound">
              <b-form-select v-model="rowSelected.iscontato" :options="ativoOpt" />
            </b-form-group>
          </b-col>
        </b-row>
        <div class="text-right">
          <b-button class="mr-2" variant="primary" @click="filtrar()">
            Filtrar
          </b-button>
          <b-button v-if="items.length > 0" class="mr-2" variant="warning" @click="incluir()">
            Adicionar à Campanha
          </b-button>
        </div>
      </b-form>
      <!-- ----------------------------------------------->
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
      <br></br>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir -->
    <b-modal id="modal-incluir-emails" title="Incluir emails" hide-footer>
      <p>
        Confirma incluir os emails na Campanha?
      </p>
      <div class="text-right">
        <b-button
          class="mt-3"
          variant="primary"
          @click="incluirEmails()"
        >
          Sim
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-incluir-emails')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'TestPage',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    idcampanha: Number
  },
  data () {
    return {
      pageName: 'TestEmail',
      url: '/v1/campanhas-emails-filtrar',
      mensagem: '',
      showMsg: false,
      carregando: false,
      emailDestino: '',
      items: [],
      fields: [
        {
          key: 'nome',
          sortable: true,
          label: 'Nome',
          tdClass: 'tbvertical'
        },
        {
          key: 'email',
          sortable: true,
          label: 'email',
          tdClass: 'tbvertical'
        },
        {
          key: 'empresa',
          sortable: true,
          label: 'Empresa',
          tdClass: 'tbvertical'
        }
      ],
      rowSelected: {
        nome: '',
        email: '',
        empresa: '',
        posicao: '',
        cidade: '',
        categorias_fk: 0,
        iscliente: false,
        iscontato: false
      },
      ativoOpt: [
        { value: 1, text: 'Sim' },
        { value: 0, text: 'Não' }
      ],
      categoriasOpt: [],
      categorias_fk: 0,
      parentValue: '1',
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.categorias()
  },
  methods: {
    // --------------------------------------------------------------------------------------  hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // -------------------------------------------------------------------------------------- incluir
    incluir () {
      this.$root.$emit('bv::show::modal', 'modal-incluir-emails', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- Filtrar os emails
    filtrar () {
      this.mensagem = 'Filtrando emails...'
      this.showMsg = true
      this.carregando = true
      this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
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
    // -------------------------------------------------------------------------------------- Filtrar os emails
    incluirEmails () {
      this.mensagem = 'Inserindo emails na Campanha...'
      this.showMsg = true
      this.carregando = true
      const outbounds = []
      this.items.forEach((element) => {
        outbounds.push(element.id)
      })
      const send = {
        idcampanha: this.idcampanha,
        emails: outbounds
      }
      this.hideModal('modal-incluir-emails')
      this.$axios.$post('/v1/campanhas-emails-incluir', send, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.mensagem = 'Emails inseridos na Campanha'
          this.showMsg = true
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.usuarios()
              this.carregando = false
            }
          } else {
            console.log(error)
            this.mensagem = error
            this.showMsg = true
            this.carregando = false
          }
        })
    },
    // -------------------------------------------------------------------------------------- le categorias
    categorias () {
      this.$axios.$get('/v1/categorias-all', { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          const data = []
          ret.forEach((element) => {
            const reg = {
              value: element.id,
              text: element.descricao
            }
            data.push(reg)
          })
          this.categoriasOpt = data
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.usuarios()
              this.carregando = false
            }
          } else {
            this.mensagem = error
            this.showMsg = true
            this.carregando = false
          }
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
