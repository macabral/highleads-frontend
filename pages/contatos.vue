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
      <b-button @click="voltar()">
        Voltar
      </b-button>
      <b-button variant="primary" @click="novo()">
        Incluir
      </b-button>
      <br><br>
      <div style="padding-top: 10px;">
        <b-input-group>
          <b-input-group-prepend>
            <b-button variant="outline-info" @click="search()">
              Procurar
            </b-button>
          </b-input-group-prepend>

          <b-form-input v-model="procurar" type="text" />

          <b-input-group-append>
            <b-button variant="outline-secondary" @click="pagina -= 100; registros()">
              &lt;
            </b-button>
            <b-button variant="outline-secondary" @click="pagina += 100; registros()">
              &gt;
            </b-button>
            <b-button variant="outline-secondary" @click="procurar = ''; registros()">
              X
            </b-button>
            <b-button variant="outline-secondary" title="Exportar XLS" @click="exportar()">
              Exportar
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <div v-if="!carregando" class="text-right">
          {{ totalRegistros }} registros encontrados.
        </div>
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
              style="width: 30rem;padding-right:5px;padding-bottom: 5px;"
            >
              <b-card-text>
                {{ element.email }}<br>
                {{ element.telefone }}<br>
                {{ element.site }}<br>
                {{ formatData(element.datahora) }}
              </b-card-text>
              <template #footer>
                <b-button href="#" variant="primary" @click="editar(element)">
                  Editar
                </b-button>
              </template>
            </b-card>
            <br><br>
          </div>
        </b-card-group>
      </div>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir  -->
    <b-modal id="modal-incluir" size="lg" :title="pageName" hide-footer>
      <div v-if="showErro" style="padding-top:10px;">
        <b-alert v-model="showErro" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <b-form>
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="Nome">
              <b-form-input
                v-model="rowSelected.nome"
                size="sm"
                required
              />
            </b-form-group>
            <b-form-group label="Email">
              <b-form-input
                v-model="rowSelected.email"
                size="sm"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>
      <div class="text-right">
        <b-button class="mt-3" variant="danger" @click="excluir(data.item)">
          Excluir
        </b-button>
        <b-button class="mt-3" variant="primary" @click="salvar(rowSelected.id)">
          Salvar
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-incluir')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?<br>
        <b>{{ rowSelected.nome }}</b>
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
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'ContatosPage',
  data () {
    return {
      pageName: 'Contatos',
      url: '/v1/contatos',
      token: '',
      procurar: '',
      showAlert: false,
      showErro: false,
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
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
      row: {
        _id: 0,
        nome: '',
        email: '',
        telefone: ''
      },
      rowSelected: {},
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    this.token = this.$store.state.token
    if (this.token === '') {
      this.$router.push('/')
    }
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
    // -------------------------------------------------------------------------------------- le registros
    registros () {
      this.mensagemErro = ''
      this.carregando = true
      this.$axios.$get(this.url, { headers: { Authorization: 'Bearer ' + this.token } })
        .then((ret) => {
          this.items = ret
          this.totalRegistros = ret.length
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.mensagemErro = 'Sem permissão de acesso.'
            this.showAlert = true
          }
          this.carregando = false
        })
    },
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.rowSelected = this.row
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showAlert = false
      this.showErro = false
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    salvar () {
      if (!this.re.test(String(this.rowSelected.email).toLowerCase())) {
        this.mensagemErro = 'Verifique o email informado.'
        this.showErro = true
        return
      }
      if (this.rowSelected._id === 0) {
        this.rowSelected.password = 'XXX'
        this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.token } })
          .then((ret) => {
            this.items = ret
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (error.response.status === 401) {
              this.mensagemErro = 'Sem permissão de acesso.'
              this.showAErro = true
            } else {
              this.mensagemErro = error
              this.showErro = true
            }
          })
      } else {
        this.$axios.$put(this.url + '/' + this.rowSelected.id, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.token } })
          .then((ret) => {
            this.items = ret
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (error.response.status === 401) {
              this.mensagemErro = 'Sem permissão de acesso.'
              this.showErro = true
            } else {
              this.mensagemErro = error
              this.showErro = true
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
      this.$axios.$delete(this.url + '/' + this.rowSelected.id, { headers: { Authorization: 'Bearer ' + this.token } })
        .then((ret) => {
          this.items = ret
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            this.mensagemErro = 'Sem permissão de acesso.'
            this.showAlert = true
          } else {
            this.mensagemErro = error
            this.showAlert = true
          }
        })
      this.registros()
    },
    // -------------------------------------------------------------------------------------- procurar
    search () {
      if (this.procurar !== '') {
        this.carregando = true
        this.$axios.$get(this.url + '-search?search=' + this.procurar, { headers: { Authorization: 'Bearer ' + this.token } })
          .then((ret) => {
            this.items = ret
            this.carregando = false
          })
          .catch((error) => {
            if (error.response.status === 401) {
              this.mensagemErro = 'Sem permissão de acesso.'
              this.showAlert = true
            }
            this.carregando = false
          })
      }
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
</style>
