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
      </div>
      <div v-if="!carregando" class="text-right">
        {{ totalRegistros }} registros encontrados.
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
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
    <b-modal id="modal-incluir" size="lg" :title="pageName" hide-footer>
      <div v-if="showErro" style="padding-top:10px;">
        <b-alert v-model="showErro" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <b-form>
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="Email">
              <b-form-input
                v-model="rowSelected.texto"
                size="sm"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>
      <div class="text-right">
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
        <b>{{ rowSelected.texto }}</b>
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
  name: 'ListanegraPage',
  data () {
    return {
      pageName: 'Lista Negra',
      url: '/v1/blacklist',
      procurar: '',
      showAlert: false,
      showErro: false,
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
      items: [],
      fields: [
        {
          key: 'texto',
          sortable: true,
          label: 'email',
          tdClass: 'tbvertical'
        },
        { key: 'actions', label: 'Ação' }
      ],
      row: {
        _id: 0,
        texto: ''
      },
      rowSelected: {},
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '' || this.$store.state.usuarioPerfil !== '1') {
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
    // -------------------------------------------------------------------------------------- le registros
    registros () {
      this.mensagemErro = ''
      this.carregando = true
      this.$axios.$get(this.url, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.items = ret
          this.totalRegistros = ret.length
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
      if (!this.re.test(String(this.rowSelected.texto).toLowerCase())) {
        this.mensagemErro = 'Verifique o email informado.'
        this.showErro = true
        return
      }
      if (this.rowSelected._id === 0) {
        this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.items = ret
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
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
    excluir (item) {
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-excluir', '#btnShow')
    },
    excluirItem () {
      this.hideModal('modal-excluir')
      this.carregando = true
      this.$axios.$delete(this.url + '/' + this.rowSelected.id, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.items = ret
          this.carregando = false
        })
        .catch((error) => {
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.salvar()
            }
          } else {
            this.mensagemErro = error
            this.showErro = true
          }
        })
      this.registros()
    },
    // -------------------------------------------------------------------------------------- procurar
    search () {
      if (this.procurar !== '') {
        this.carregando = true
        this.$axios.$get(this.url + '-search?search=' + this.procurar, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.items = ret
            this.carregando = false
          })
          .catch((error) => {
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.search()
              }
            } else {
              this.mensagemErro = error
              this.showErro = true
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
</style>
