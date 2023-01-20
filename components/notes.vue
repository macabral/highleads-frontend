<template>
  <div>
    <b-container fluid>
      <div v-if="showErro" style="padding-top:10px;">
        <b-alert dismissible>
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
        :items="notesItens"
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
    <b-modal id="modal-excluir-nota" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?<br>
        <b>{{ formatData(rowSelected.created_at) }}</b>
      </p>
      <div class="text-right">
        <b-button class="mt-3" variant="primary" @click="excluirItem(rowSelected.id)">
          Excluir
        </b-button>
        <b-button class="mt-3" @click="hideModal('modal-excluir-nota')">
          Cancelar
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>

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
      showErro: false,
      mensagemErro: '',
      carregando: true,
      notesItens: [],
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
      rowSelected: {},
      usuarioPerfil: 0
    }
  },
  mounted () {
    this.usuarioId = this.$store.state.usuarioId
    this.usuarioPerfil = this.$store.state.usuarioPerfil
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.registros()
  },
  methods: {
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
      this.showErro = false
      const url = this.url + '/' + this.idContatos
      this.$axios.$get(url, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.notesItens = ret
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
      this.rowSelected = {
        usuarios_fk: this.usuarioId,
        contatos_fk: this.idContatos,
        texto: ''
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir-anotação', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showErro = false
      this.$root.$emit('bv::show::modal', 'modal-incluir-anotação', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    salvar () {
      if (this.rowSelected.texto === '') {
        return
      }
      this.$axios.$post(this.url, this.rowSelected, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
        .then((ret) => {
          this.notesItens = ret
          this.hideModal('modal-incluir-anotação')
          this.registros()
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
    // -------------------------------------------------------------------------------------- excluir
    excluir (item) {
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-excluir-nota', '#btnShow')
    },
    excluirItem () {
      this.hideModal('modal-excluir-nota')
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
          this.carregando = false
        })
    },
    // -------------------------------------------------------------------------------------- procurar
    search () {
      if (this.procurar !== '') {
        this.carregando = true
        this.$axios.$get(this.url + '-search?site=' + this.procurar, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
          .then((ret) => {
            this.notesItens = ret
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
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
