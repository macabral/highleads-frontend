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
      <b-button @click="voltar()">
        Voltar
      </b-button>
      <b-button variant="primary" @click="novo()">
        Incluir
      </b-button>
      <br><br>
      <div style="background-color: cyan;">
        <b-input-group>
          <b-input-group-prepend>
            <b-button variant="outline-info" @click="site = 0; consultor = 0; status = 0; registros()">
              Procurar
            </b-button>
          </b-input-group-prepend>

          <b-form-input v-model="procurar" type="text" />

          <b-input-group-prepend>
            <b-button variant="outline-info">
              Consultor
            </b-button>
            <b-form-select
              v-model="consultor"
              :options="usuariosOpt"
              @change="registros()"
            />
          </b-input-group-prepend>

          <b-input-group-prepend>
            <b-button variant="outline-info">
              Site
            </b-button>
            <b-form-select
              v-model="site"
              :options="sitesOpt"
              @change="registros()"
            />
          </b-input-group-prepend>

          <b-input-group-prepend>
            <b-button variant="outline-info">
              Status
            </b-button>
            <b-form-select
              v-model="status"
              :options="statusOpt"
              @change="registros()"
            />
          </b-input-group-prepend>

          <b-input-group-append>
            <b-button variant="outline-secondary" @click="pageNumber('down'); registros()">
              &lt;
            </b-button>
            <b-button variant="outline-secondary" @click="pageNumber('up'); registros()">
              &gt;
            </b-button>
            <b-button variant="outline-secondary" @click="Page=1, procurar = ''; consultor = 0; status = 1; site = 0; registros()">
              X
            </b-button>
            <b-button variant="outline-secondary" title="Exportar XLS" @click="exportar()">
              Exportar
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div v-if="!carregando" class="text-right">
        {{ totalRegistros }} registros encontrados (8 registros por página)
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
      </div>
      <br>
      <div v-if="carregando == false">
        <b-card-group deck>
          <div v-for="element in items" :key="element.id">
            <b-card
              :title="element.nome"
              style="width: 25rem;padding-right:5px;padding-bottom: 5px;"
            >
              <b-card-text>
                {{ element.empresa }}<br>
                {{ element.email }}<br>
                {{ element.telefone }}<br>
                {{ element.site }}<br>
                {{ formatData(element.datahora) }}
              </b-card-text>
              <template #footer>
                <b-button href="#" variant="primary" @click="editar(element)">
                  Editar
                </b-button>
                <div class="rodape">
                  {{ statusOpt[element.status].text }} | Score: {{ element.score }}
                </div>
              </template>
            </b-card>
            <br><br>
          </div>
        </b-card-group>
      </div>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir  -->
    <b-modal id="modal-incluir" size="xl" :title="pageName" hide-footer>
      <div v-if="showErro" style="padding-top:10px;">
        <b-alert v-model="showErro" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <div>
        <b-tabs content-class="mt-3">
          <b-tab title="Identificação" active>
            <b-form @submit="salvar">
              <b-row>
                <b-col cols="6" md="6" sm="6">
                  <b-form-group label="Nome">
                    <b-form-input
                      v-model="rowSelected.nome"
                      size="sm"
                      maxlength="80"
                      required
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="6" md="6" sm="6">
                  <b-form-group label="Empresa">
                    <b-form-input
                      v-model="rowSelected.empresa"
                      maxlength="80"
                      size="sm"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="6" md="6" sm="6">
                  <b-form-group label="Email">
                    <b-form-input
                      v-model="rowSelected.email"
                      maxlength="80"
                      size="sm"
                      required
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="6" md="6" sm="6">
                  <b-form-group label="Telefone">
                    <b-form-input
                      v-model="rowSelected.telefone"
                      size="sm"
                      maxlength="80"
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="12" sm="12">
                  <b-form-group label="Site">
                    <b-form-select
                      v-model="rowSelected.sites_fk"
                      :options="sitesOpt2"
                      required
                      size="sm"
                      title=""
                    />
                  </b-form-group>
                  <b-form-group label="Consultor">
                    <b-form-select
                      v-model="rowSelected.usuarios_fk"
                      :options="usuariosOpt"
                      size="sm"
                      title=""
                    />
                  </b-form-group>
                  <b-form-group label="Status">
                    <b-form-select
                      v-model="rowSelected.status"
                      :options="statusOpt"
                      size="sm"
                      title=""
                    />
                  </b-form-group>
                  <b-form-group label="Score">
                    <b-form-input
                      id="range-2"
                      v-model="rowSelected.score"
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      :title="rowSelected.score"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
              <div class="text-right">
                <b-button v-if="rowSelected.id != 0" class="mt-3" variant="danger" @click="excluir()">
                  Excluir
                </b-button>
                <b-button type="submit" class="mt-3" variant="primary">
                  Salvar
                </b-button>
                <b-button class="mt-3" @click="hideModal('modal-incluir')">
                  Cancelar
                </b-button>
              </div>
            </b-form>
          </b-tab>
          <b-tab title="Anotações">
            <Notes :id-contatos="rowSelected.id" />
          </b-tab>
        </b-tabs>
      </div>
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?<br>
        <b>{{ rowSelected.nome }}</b>
      </p>
      <div class="text-right">
        <b-button class="mt-3" variant="primary" @click="excluirItem()">
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
import * as XLSX from 'xlsx'
import Notes from '~/components/notes.vue'

export default {
  name: 'ContatosPage',
  components: { Notes },
  data () {
    return {
      pageName: 'Contatos - Inbound',
      url: '/v1/contatos',
      showAlert: false,
      showErro: false,
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
      Page: 1,
      fristPage: 0,
      lastPage: 0,
      status: 1,
      consultor: 0,
      usuariosOpt: [],
      sitesOpt: [],
      sitesOpt2: [],
      site: 0,
      statusOpt: [{ value: 0, text: '' }, { value: 1, text: 'Novo' }, { value: 2, text: 'Em Prospecção' }, { value: 3, text: 'Qualificado' }, { value: 4, text: 'Encerrado (+)' }, { value: 5, text: 'Encerrado (-)' }],
      items: [],
      usuariosData: [],
      procurar: '',
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
          key: 'telefone',
          sortable: true,
          label: 'Telefone',
          tdClass: 'tbvertical'
        },
        {
          key: 'datahora',
          sortable: true,
          label: 'Data',
          tdClass: 'tbvertical',
          formatter: 'formatData'
        },
        { key: 'actions', label: 'Ação' }
      ],
      rowSelected: {},
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.usuarios()
    this.sites()
    this.registros()
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
    // --------------------------------------------------------------------------------------  formata data
    formatData (value) {
      const data = new Date(value)
      return data.toLocaleDateString('pt-Br') + ' ' + ((data.getHours() < 10) ? '0' + data.getHours() : data.getHours()) + ':' + ((data.getMinutes() < 10) ? '0' + data.getMinutes() : data.getMinutes())
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
    // -------------------------------------------------------------------------------------- le registros
    registros () {
      this.mensagemErro = ''
      this.carregando = true
      const procurar = this.procurar.trim()
      if (procurar === '' && this.status === 0 && this.consultor === 0 && this.site === 0) {
        this.status = 1
      }
      const filtros = {
        search: procurar,
        status: this.status,
        site: this.site,
        consultor: this.consultor,
        perfil: this.$store.state.usuarioPerfil,
        idUsuario: this.$store.state.usuarioId,
        page: this.Page
      }
      const url = this.url + '-search'
      this.$axios.$post(url, filtros, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          console.log(ret)
          this.items = ret.data
          this.totalRegistros = ret.total
          this.fristPage = ret.form
          this.lastPage = ret.last_page
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
            this.showErro = true
          }
          this.carregando = false
        })
    },
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.mensagemErro = ''
      this.showAlert = false
      this.showErro = false
      this.rowSelected = {
        id: 0,
        email: '',
        telefone: '',
        empresa: '',
        score: 0,
        site: '',
        nome: '',
        remoteip: null,
        status: 1,
        sites_fk: null,
        usuarios_fk: null,
        datahora: null
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showAlert = false
      this.mensagemErro = ''
      this.showErro = false
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    salvar (event) {
      event.preventDefault()
      this.showErro = false
      this.mensagemErro = ''
      if (this.rowSelected.email !== '') {
        const emails = this.rowSelected.email
        const email = emails.split(';')
        email.forEach((item) => {
          if (!this.re.test(String(item).toLowerCase().trim())) {
            this.mensagemErro = 'Verifique o email informado.'
            this.showErro = true
          }
        })
      }
      if (this.rowSelected.sites_fk === 0) {
        this.mensagemErro = 'Informe o site.'
        this.showErro = true
      }
      if (this.showErro) {
        return
      }
      const site = parseInt(this.rowSelected.sites_fk)
      this.sitesOpt2.forEach((elem) => {
        if (elem.value === site) {
          this.rowSelected.site = elem.text
        }
      })
      if (this.rowSelected.id === 0) {
        const data = new Date()
        this.rowSelected.datahora = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate() + ' ' + data.getHours() + ':' + data.getMinutes()
        this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.items = ret
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (!error.response) {
              this.mensagemErro = 'Erro ao conectar ao servidor backend.'
              this.showAlert = true
              this.carregando = false
            }
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.salvar()
              }
            } else {
              this.mensagemErro = error
              this.showErro = true
            }
          })
      } else {
        this.$axios.$put(this.url + '/' + this.rowSelected.id, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.items = ret
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (!error.response) {
              this.mensagemErro = 'Erro ao conectar ao servidor backend.'
              this.showAlert = true
              this.carregando = false
            }
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.salvar()
              }
            } else {
              this.mensagemErro = error
              this.showErro = true
            }
          })
      }
    },
    // -------------------------------------------------------------------------------------- excluir
    excluir () {
      this.$root.$emit('bv::show::modal', 'modal-excluir', '#btnShow')
    },
    excluirItem () {
      this.mensagemErro = 'Excluindo...'
      this.showErro = true
      this.$axios.$delete(this.url + '/' + this.rowSelected.id, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.registros()
        })
        .catch((error) => {
          if (!error.response) {
            this.mensagemErro = 'Erro ao conectar ao servidor backend.'
            this.showAlert = true
            this.carregando = false
          }
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.excluirItem()
            }
          } else {
            this.mensagemErro = error
            this.showErro = true
          }
        })
      this.hideModal('modal-excluir')
      this.hideModal('modal-incluir')
    },
    // -------------------------------------------------------------------------------------- exportar
    exportar () {
      this.carregando = true
      const registros = this.items
      const data = XLSX.utils.json_to_sheet(registros)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, data, 'data')
      XLSX.writeFile(wb, this.pageName + '.xls')
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- le sites
    sites () {
      this.$axios.$get('/v1/sites-all', { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.sitesData = ret
          const data = [{ value: 0, text: ' ' }]
          const data2 = []
          ret.forEach((element) => {
            const reg = {
              value: element.id,
              text: element.pagina
            }
            data.push(reg)
            data2.push(reg)
          })
          this.sitesOpt = data
          this.sitesOpt2 = data2
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
              this.sites()
            }
          } else {
            this.mensagemErro = error
            this.showErro = true
          }
          this.carregando = false
        })
    },
    // -------------------------------------------------------------------------------------- le usuarios
    usuarios () {
      this.$axios.$get('/v1/usuarios', { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.usuariosData = ret
          let data = []
          if (this.$store.state.usuarioPerfil === '1') {
            data = [{ value: 0, text: ' ' }]
          } else {
            data = []
          }
          ret.forEach((element) => {
            const reg = {
              value: element.id,
              text: element.nome
            }
            if (this.$store.state.usuarioPerfil === '1') {
              data.push(reg)
            } else if (parseInt(this.$store.state.usuarioId) === parseInt(element.id)) {
              data.push(reg)
            }
          })
          this.usuariosOpt = data
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
              this.usuarios()
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
.card {
  display: inline-block;
  padding: 10px;
}

.rodape {
  display:inline;
  float: right;
}
</style>
