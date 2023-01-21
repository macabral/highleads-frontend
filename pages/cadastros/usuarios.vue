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
      <b-form @submit="salvar">
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
            <b-form-group label="Perfil">
              <b-form-select
                v-model="rowSelected.perfil"
                :options="perfilOpt"
                title=""
              />
            </b-form-group>
            <b-form-group label="Ativo">
              <b-form-select
                v-model="rowSelected.ativo"
                :options="ativoOpt"
                title=""
              />
            </b-form-group>
          </b-col>
        </b-row>
        <div class="text-right">
          <b-button type="submit" class="mt-3" variant="primary">
            Salvar
          </b-button>
          <b-button class="mt-3" @click="hideModal('modal-incluir')">
            Cancelar
          </b-button>
        </div>
      </b-form>
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
  name: 'UsuariosPage',
  data () {
    return {
      pageName: 'Usuários',
      url: '/v1/usuarios',
      procurar: '',
      showAlert: false,
      showErro: false,
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
      ativoOpt: [{ value: 1, text: 'Sim' }, { value: 0, text: 'Não' }],
      perfilOpt: [{ value: 1, text: 'Administrador' }, { value: 2, text: 'Consultor' }],
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
          key: 'perfil',
          sortable: true,
          label: 'Perfil',
          tdClass: 'tbvertical',
          formatter: 'perfilData'
        },
        {
          key: 'ativo',
          sortable: true,
          label: 'Ativo',
          tdClass: 'tbvertical',
          formatter: 'ativoData'
        },
        { key: 'actions', label: 'Ação' }
      ],
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
    // --------------------------------------------------------------------------------------  Ativo/Inativo
    ativoData (value) {
      if (value === '1') {
        return 'Sim'
      } else {
        return 'Não'
      }
    },
    // --------------------------------------------------------------------------------------  Perfil
    perfilData (value) {
      if (value === '1') {
        return 'Administrador'
      } else {
        return 'Consultor'
      }
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
      this.showAlert = false
      this.showErro = false
      this.rowSelected = {
        id: 0,
        nome: '',
        email: '',
        password: '',
        ativo: 1,
        perfil: 1
      }
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
    salvar (event) {
      event.preventDefault()
      if (!this.re.test(String(this.rowSelected.email).toLowerCase())) {
        this.mensagemErro = 'Verifique o email informado.'
        this.showErro = true
        return
      }
      this.mensagemErro = 'Salvando...'
      this.showErro = true
      if (this.rowSelected.id === 0) {
        this.rowSelected.password = 'XXX'
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
        .then(() => {
          this.registros()
        })
        .catch((error) => {
          if (error.response.status === 401) {
            if (this.refreshToken()) {
              this.excluirItem()
            }
          } else {
            this.mensagemErro = error
            this.showErro = true
          }
        })
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
              this.mensagemErro = 'Token inválido'
              this.showAlert = true
            }
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
</style>
