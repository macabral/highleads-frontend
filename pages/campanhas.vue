<template>
  <div class="fundo">
    <NuxtLayout />
    <b-container fluid>
      <h3 class="cabec">
        {{ pageName }}
      </h3>
      <div v-if="showMsg" style="padding-top: 10px">
        <b-alert v-model="showMsg" dismissible>
          {{ mensagem }}
        </b-alert>
      </div>
      <b-button @click="voltar()">
        Voltar
      </b-button>
      <b-button variant="primary" @click="novo()">
        Incluir
      </b-button>
      <br></br>
      <div style="background-color: cyan;">
        <b-input-group>
          <b-input-group-prepend>
            <b-button variant="outline-info" @click="search()">
              Procurar
            </b-button>
          </b-input-group-prepend>

          <b-form-input v-model="procurar" type="text" />

          <b-input-group-append>
            <b-button
              variant="outline-secondary"
              @click="
                procurar = '';
                pageNumber('down');
                search();
              "
            >
              &lt;
            </b-button>
            <b-button
              variant="outline-secondary"
              @click="
                procurar = '';
                pageNumber('up');
                search();
              "
            >
              &gt;
            </b-button>
            <b-button
              variant="outline-secondary"
              @click="
                (Page = 1), (procurar = ''); (categorias_fk = 0);
                search();
              "
            >
              X
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div v-if="!carregando" class="text-right">
        {{ totalRegistros }} registros encontrados (15 registros por página)
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img
          src="~/assets/loading.gif"
          width="28px"
        >
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
          <b-button size="sm" variant="primary" @click="editar(data.item)">
            Editar
          </b-button>
          <b-button size="sm" variant="danger" @click="excluir(data.item)">
            Excluir
          </b-button>
        </template>
      </b-table>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir  -->
    <b-modal id="modal-incluir" size="xl" :title="pageName" hide-footer @hide="search()">
      <div v-if="showAlert" style="padding-top:10px;">
        <b-alert v-model="showAlert" dismissible>
          {{ mensagemAlert }}
        </b-alert>
      </div>
      <b-form @submit="onSubmit">
        <b-tabs content-class="mt-3">
          <!-- ---------------------------------------------------------------- TAB campanha-->
          <b-tab title="Campanha" active>
            <b-row>
              <b-col cols="12" md="12" sm="12">
                <b-form-group label="Título">
                  <b-form-input
                    v-model="rowSelected.titulo"
                    size="sm"
                    required
                    maxlength="120"
                  />
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12" md="12" sm="12">
                <b-form-group label="Assunto">
                  <b-form-input
                    v-model="rowSelected.assunto"
                    size="sm"
                    required
                    maxlength="200"
                  />
                </b-form-group>
              </b-col>
            </b-row>
            <label for="example-i18n-picker">Agendar envio para:</label>
            <b-row>
              <b-col cols="4" md="4" sm="4">
                <b-form-datepicker id="example-datepicker" v-model="rowSelected.dtenvio" class="mb-2" />
              </b-col>
              <b-col cols="4" md="4" sm="4">
                <b-form-timepicker v-model="rowSelected.hrenvio" now-button locale="pt-BR" />
              </b-col>
            </b-row>
          </b-tab>
          <!-- ---------------------------------------------------------------- TAB email-->
          <b-tab title="Texto do Email">
            <b-form-textarea
              id="textarea"
              v-model="rowSelected.emailhtml"
              rows="20"
              max-rows="20"
            />
          </b-tab>
          <!-- ---------------------------------------------------------------- TAB lista de emails-->
          <b-tab title="Lista de Emails">
            <ListaEmails :idcampanha="rowSelected.id" :ativo="campanhaAtiva" />
          </b-tab>
        </b-tabs>
        <div class="text-right">
          <b-button v-if="!campanhaAtiva" variant="secondary" class="mt-3" @click="distribuir()">
            Iniciar Distribuição
          </b-button>
          <b-button v-if="rowSelected.emailhtml != ''" variant="warning" class="mt-3" @click="testEmail()">
            Enviar Teste
          </b-button>
          <b-button type="submit" class="mt-3" variant="primary">
            Salvar
          </b-button>
          <b-button class="mt-3" @click="hideModal('modal-incluir')">
            Cancelar
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Test Email -->
    <b-modal id="modal-test" title="Testar Envio de Email" hide-footer>
      <TestEmail :content="rowSelected.emailhtml" :assunto="rowSelected.assunto" />
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?
        <br>
        <b>{{ rowSelected.pagina }}</b>
      </p>
      <div class="text-right">
        <b-button class="mt-3" variant="primary" @click="excluirItem(rowSelected.id)">
          Excluir
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-excluir')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Distribuir -->
    <b-modal id="modal-distribuir" title="Iniciar Distribuição" hide-footer>
      <p>
        Confirma iniciar a distribuição de emails?
      </p>
      <div class="text-right">
        <b-button class="mt-3" variant="primary" @click="distribuirEmails()">
          Sim
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-distribuir')">
          Não
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import TestEmail from '~/components/TestEmail.vue'
import ListaEmails from '~/components/ListaEmails.vue'

export default {
  name: 'CampanhasPage',
  components: { TestEmail, ListaEmails },
  data () {
    return {
      pageName: 'Campanhas - email Marketing',
      url: '/v1/campanhas',
      procurar: '',
      mensagem: '',
      mensagemAlert: '',
      showMsg: false,
      showAlert: true,
      carregando: true,
      totalRegistros: '',
      items: [],
      emailTest: '',
      fields: [
        {
          key: 'titulo',
          sortable: true,
          label: 'Título',
          tdClass: 'tbvertical'
        },
        {
          key: 'qtdemails',
          sortable: true,
          label: 'QTD Emails',
          tdClass: 'tbvertical'
        },
        {
          key: 'qtdvisitas',
          sortable: true,
          label: 'QTD Leads',
          tdClass: 'tbvertical'
        },
        {
          key: 'qtdcancelados',
          sortable: true,
          label: 'QTD Cancelados',
          tdClass: 'tbvertical'
        },
        {
          key: 'enviado',
          sortable: true,
          label: 'Distribuido',
          formatter: 'ativoData'
        },
        { key: 'actions', label: 'Ação' }
      ],
      rowSelected: {},
      fristPage: 0,
      lastPage: 0,
      Page: 1,
      campanhaAtiva: false,
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.search()
  },
  methods: {
    // --------------------------------------------------------------------------------------  voltar
    voltar () {
      this.$router.push('/painel')
    },
    // --------------------------------------------------------------------------------------  hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // --------------------------------------------------------------------------------------  Ativo/Inativo
    ativoData (value) {
      if (value === '1') {
        return 'Sim'
      } else {
        return 'Não'
      }
    },
    // -------------------------------------------------------------------------------------- Page
    pageNumber (flag) {
      if (flag === 'up') {
        this.Page = this.Page + 1
        if (this.Page > this.lastPage) {
          this.Page = this.lastPage
        }
      } else {
        this.Page = this.Page - 1
        if (this.Page < 1) {
          this.Page = 1
        }
      }
    },
    // -------------------------------------------------------------------------------------- distribuir emails
    distribuir () {
      this.$root.$emit('bv::show::modal', 'modal-distribuir', '#btnShow')
    },
    distribuirEmails () {
      this.mensagemAlert = 'Iniciando distribuição...'
      this.showAlert = true
      this.hideModal('modal-distribuir')
      this.$axios.$get('/v1/campanhas-distribuir/' + this.rowSelected.id, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.mensagemAlert = 'Distribuição iniciada!'
          this.showAlert = true
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagemAlert = 'Erro ao conectar ao servidor backend.'
            this.showAlert = true
            this.carregando = false
          }
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.excluirItem()
            }
          } else {
            this.mensagemAlert = error
            this.showAlert = true
          }
        })
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- test email
    testEmail () {
      this.$root.$emit('bv::show::modal', 'modal-test', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.mensagemAlert = ''
      this.showAlert = false
      this.rowSelected = {
        id: 0,
        titulo: '',
        assunto: '',
        emailhtml: '',
        dtenvio: null,
        hrenvio: null
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showAlert = false
      this.showMsg = false
      this.rowSelected = item
      if (this.rowSelected.emailhtml !== '' && this.rowSelected.qtdemails > 0 && this.rowSelected.dtenvio !== null && this.rowSelected.hrenvio !== null && this.rowSelected.enviado === 0) {
        this.campanhaAtiva = false
      } else {
        this.campanhaAtiva = true
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    onSubmit (event) {
      event.preventDefault()
      this.mensagemAlert = ''
      this.showAlert = false
      this.mensagemAlert = 'Salvando...'
      this.showAlert = true
      if (this.rowSelected.id === 0) {
        this.$axios
          .$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then(() => {
            this.mensagemAlert = 'Salvando...'
            this.showAlert = false
          })
          .catch((error) => {
            if (!error.response) {
              this.mensagemAlert = 'Erro ao conectar ao servidor backend.'
              this.showAlert = true
              this.carregando = false
            }
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.onSubmit()
              }
            } else if (error.response.status === 404) {
              this.mensagemAlert = 'Título já existe. '
              this.showAlert = true
            } else {
              this.mensagemAlert = error
              this.showAlert = true
            }
          })
      } else {
        this.$axios
          .$put(this.url + '/' + this.rowSelected.id, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.mensagemAlert = ''
            this.showAlert = false
          })
          .catch((error) => {
            if (!error.response) {
              this.mensagemAlert = 'Erro ao conectar ao servidor backend.'
              this.showAlert = true
              this.carregando = false
            }
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.onSubmit()
              }
            } else {
              this.mensagemAlert = error
              this.showAlert = true
            }
          })
      }
    },
    // -------------------------------------------------------------------------------------- excluir
    excluir (item) {
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-excluir', '#btnShow')
    },
    excluirItem () {
      this.hideModal('modal-excluir')
      this.carregando = true
      this.$axios
        .$delete(this.url + '/' + this.rowSelected.id, {
          headers: { Authorization: 'Bearer ' + this.$store.state.token }
        })
        .then((ret) => {
          this.search()
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagem = 'Erro ao conectar ao servidor backend.'
            this.showMsg = true
            this.carregando = false
          }
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.excluirItem()
            }
          } else {
            this.mensagem = error
            this.showMsg = true
          }
        })
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- procurar
    search () {
      this.carregando = true
      this.mensagem = ''
      this.showMsg = false
      const filtros = {
        search: this.procurar,
        categorias_fk: this.categorias_fk,
        perfil: this.$store.state.usuarioPerfil,
        idUsuario: this.$store.state.usuarioPerfil,
        page: this.Page
      }
      this.$axios.$post(this.url + '-search', filtros, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.items = ret.data
          this.totalRegistros = ret.total
          this.fristPage = ret.form
          this.lastPage = ret.last_page
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.search()
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
