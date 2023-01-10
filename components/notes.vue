<template>
  <div>
    <b-container fluid>
      <div v-if="showAlert" style="padding-top:10px;">
        <b-alert v-model="showAlert" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <div v-if="idContatos != 0">
        <b-button variant="primary" @click="novo()">
          Incluir
        </b-button>
        <br>
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
          <b-button v-if="data.item.usuarios_fk == usuarioId || usuarioPerfil == 1" size="sm" variant="danger" @click="excluir(data.item)">
            Excluir
          </b-button>
        </template>
      </b-table>
    </b-container>
    <!------------------------------------------------------------------------------------------------- Incluir  -->
    <b-modal id="modal-incluir-anotação" size="lg" window-height :title="pageName" hide-footer>
      <div v-if="showErro" style="padding-top:10px;">
        <b-alert v-model="showErro" dismissible>
          {{ mensagemErro }}
        </b-alert>
      </div>
      <b-form>
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="">
              <b-form-textarea
                id="textarea"
                v-model="rowSelected.texto"
                placeholder="Digite sua informação..."
                rows="3"
                max-rows="6"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>
      <div class="text-right">
        <b-button class="mt-3" variant="primary" @click="salvar(rowSelected.id)">
          Salvar
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-incluir-anotação')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?<br>
        <b>{{ formatData(rowSelected.created_at) }}</b>
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
  name: 'NotesPage',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    idContatos: Number
  },
  data () {
    return {
      pageName: 'Anotações',
      url: '/v1/notes',
      token: '',
      showAlert: false,
      showErro: false,
      procurar: '',
      mensagemErro: '',
      carregando: true,
      totalRegistros: '',
      ativoOpt: [{ value: 1, text: 'Sim' }, { value: 0, text: 'Não' }],
      items: [],
      usuarioId: 0,
      fields: [
        {
          key: 'created_at',
          sortable: true,
          label: 'Data',
          tdClass: 'tbvertical',
          formatter: 'formatData'
        },
        {
          key: 'usuarios.nome',
          sortable: true,
          label: 'Usuário',
          tdClass: 'tbvertical'
        },
        {
          key: 'texto',
          sortable: true,
          label: 'Anotação',
          tdClass: 'tbvertical'
        },
        { key: 'actions', label: 'Ação' }
      ],
      row: {
        _id: 0,
        usuarios_fk: 0,
        contatos_fk: 0,
        texto: ''
      },
      rowSelected: {},
      fristPage: 0,
      lastPage: 0,
      Page: 1,
      usuarioPerfil: 0,
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    this.token = this.$store.state.token
    this.usuarioId = this.$store.state.usuarioId
    this.usuarioPerfil = this.$store.state.usuarioPerfil
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
      this.mensagemErro = ''
      this.carregando = true
      const url = this.url + '/' + this.idContatos
      this.$axios.$get(url, { headers: { Authorization: 'Bearer ' + this.token } })
        .then((ret) => {
          this.items = ret
          this.totalRegistros = ret.total
          this.fristPage = ret.form
          this.lastPage = ret.last_page
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
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.rowSelected = {
        usuarios_fk: this.usuarioId,
        contatos_fk: this.idContatos,
        texto: ''
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir-anotação', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showAlert = false
      this.showErro = false
      this.$root.$emit('bv::show::modal', 'modal-incluir-anotação', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    salvar () {
      if (this.rowSelected.texto === '') {
        return
      }
      this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.token } })
        .then((ret) => {
          this.items = ret
          this.hideModal('modal-incluir-anotação')
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
        .then(() => {
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
        this.$axios.$get(this.url + '-search?site=' + this.procurar, { headers: { Authorization: 'Bearer ' + this.token } })
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
