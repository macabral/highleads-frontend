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
            <b-button variant="outline-secondary" @click="procurar=''; pageNumber('down'); registros()">
              &lt;
            </b-button>
            <b-button variant="outline-secondary" @click="procurar=''; pageNumber('up'); registros()">
              &gt;
            </b-button>
            <b-button variant="outline-secondary" @click="Page=1, procurar=''; registros()">
              X
            </b-button>
            <b-button variant="outline-secondary" title="Exportar XLS" @click="exportar()">
              Exportar
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div v-if="!carregando" class="text-right">
        {{ totalRegistros }} registros encontrados (15 registros por página)
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
      <b-form @submit="onSubmit">
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="Descrição*">
              <b-form-input
                v-model="rowSelected.descricao"
                size="sm"
                maxlength="254"
                required
              />
            </b-form-group>
            <b-form-group label="Ativo">
              <b-form-select
                v-model="rowSelected.ativo"
                :options="ativoOpt"
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
        <b>{{ rowSelected.descricao }}</b>
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
  name: 'CategoriasPage',
  data () {
    return {
      pageName: 'Categorias',
      url: '/v1/categorias',
      showAlert: false,
      showErro: false,
      procurar: '',
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
      ativoOpt: [{ value: 1, text: 'Sim' }, { value: 0, text: 'Não' }],
      items: [],
      fields: [
        {
          key: 'descricao',
          sortable: true,
          label: 'Descrição',
          tdClass: 'tbvertical'
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
      fristPage: 0,
      lastPage: 0,
      Page: 1,
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
      if (value === 1) {
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
    // -------------------------------------------------------------------------------------- le registros
    registros () {
      this.showAlert = false
      this.carregando = true
      const url = this.url + '?page=' + this.Page
      this.$axios.$get(url, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
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
      this.showErro = false
      this.rowSelected = {
        id: 0,
        descricao: '',
        ativo: 1
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
    onSubmit (event) {
      event.preventDefault()
      if (this.rowSelected.descricao === '') {
        return
      }
      this.showErro = false
      if (this.rowSelected.id === 0) {
        this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.onSubmit()
              }
            } else {
              this.mensagemErro = error
              this.showErro = true
            }
          })
      } else {
        this.mensagemErro = 'Salvando...'
        this.showErro = true
        this.$axios.$put(this.url + '/' + this.rowSelected.id, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.hideModal('modal-incluir')
            this.registros()
          })
          .catch((error) => {
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.onSubmit()
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
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- procurar
    search () {
      if (this.procurar !== '') {
        this.carregando = true
        this.$axios.$get(this.url + '-search?site=' + this.procurar, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.items = ret
            this.totalRegistros = ret.length
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
      if (this.procurar !== '') {
        const data = XLSX.utils.json_to_sheet(this.items)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, data, 'data')
        XLSX.writeFile(wb, this.pageName + '.xls')
      } else {
        this.$axios.$get(this.url + '-all', { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            const data = XLSX.utils.json_to_sheet(ret)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, data, 'data')
            XLSX.writeFile(wb, this.pageName + '.xls')
          })
          .catch((error) => {
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.exportar()
              }
            } else {
              this.mensagemErro = error
              this.showErro = true
            }
          })
      }
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
