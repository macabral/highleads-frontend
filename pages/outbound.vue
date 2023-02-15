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

          <b-input-group-prepend>
            <b-button variant="outline-info">
              Categoria
            </b-button>
            <b-form-select v-model="categorias_fk" :options="categoriasOpt" @change="search()" />
          </b-input-group-prepend>

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
            <b-button
              variant="outline-secondary"
              title="Importar"
              @click="importar()"
            >
              Importar
            </b-button>
            <b-button
              variant="outline-secondary"
              title="Exportar"
              @click="exportar()"
            >
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
    <b-modal id="modal-incluir" size="lg" :title="pageName" hide-footer>
      <div v-if="showAlert" style="padding-top:10px;">
        <b-alert v-model="showAlert" dismissible>
          {{ mensagemAlert }}
        </b-alert>
      </div>
      <b-form @submit="onSubmit">
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Nome">
              <b-form-input
                v-model="rowSelected.nome"
                size="sm"
                maxlength="80"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="email*">
              <b-form-input
                v-model="rowSelected.email"
                required
                maxlength="80"
                size="sm"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Empresa">
              <b-form-input
                v-model="rowSelected.empresa"
                maxlength="120"
                size="sm"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Posição">
              <b-form-input
                v-model="rowSelected.posicao"
                maxlength="120"
                size="sm"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Telefone">
              <b-form-input
                v-model="rowSelected.telefone"
                maxlength="120"
                size="sm"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Cidade">
              <b-form-input
                v-model="rowSelected.cidade"
                maxlength="120"
                size="sm"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="Categoria">
              <b-form-select v-model="rowSelected.categorias_fk" :options="categoriasOpt" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Cliente">
              <b-form-select v-model="rowSelected.iscliente" :options="ativoOpt" />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Inbound">
              <b-form-select v-model="rowSelected.iscontato" :options="ativoOpt" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Ativo">
              <b-form-select v-model="rowSelected.ativo" :options="ativoOpt" />
            </b-form-group>
          </b-col>
          <b-col cols="6" md="6" sm="6">
            <b-form-group label="Validado?">
              <b-form-select v-model="rowSelected.isvalid" :options="ativoOpt" />
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
    <!------------------------------------------------------------------------------------------------- Importar -->
    <b-modal id="modal-importar" title="Importar" hide-footer @hide="search()">
      <file-upload />
    </b-modal>
    <!------------------------------------------------------------------------------------------------- Excluir -->
    <b-modal id="modal-excluir" title="Excluir" hide-footer>
      <p>
        Confirma excluir {{ pageName }}?
        <br>
        <b>{{ rowSelected.pagina }}</b>
      </p>
      <div class="text-right">
        <b-button
          class="mt-3"
          variant="primary"
          @click="excluirItem(rowSelected.id)"
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
import * as XLSX from 'xlsx'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'OutboundPage',
  components: {
    FileUpload
  },
  data () {
    return {
      pageName: 'Contatos - Outbound',
      url: '/v1/outbound',
      procurar: '',
      mensagem: '',
      mensagemAlert: '',
      showMsg: false,
      showAlert: true,
      carregando: true,
      totalRegistros: '',
      ativoOpt: [
        { value: 1, text: 'Sim' },
        { value: 0, text: 'Não' }
      ],
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
          label: 'e-mail',
          tdClass: 'tbvertical'
        },
        {
          key: 'empresa',
          sortable: true,
          label: 'Empresa',
          tdClass: 'tbvertical'
        },
        {
          key: 'categorias.descricao',
          sortable: true,
          label: 'Categoria',
          tdClass: 'tbvertical'
        },
        {
          key: 'isvalid',
          sortable: true,
          label: 'Validado',
          tdClass: 'tbvertical',
          formatter: 'ativoData'
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
      categoriasOpt: [],
      categorias_fk: 0,
      fristPage: 0,
      lastPage: 0,
      Page: 1,
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.categorias()
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
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.mensagemAlert = ''
      this.showAlert = false
      this.rowSelected = {
        id: 0,
        nome: '',
        email: '',
        empresa: '',
        posicao: '',
        telefone: '',
        cidade: '',
        usuarios_fk: this.$store.state.usuarioId,
        categorias_fk: null,
        iscliente: 0,
        iscontato: 0,
        ativo: 1,
        isvalid: 0
      }
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.showAlert = false
      this.showMsg = false
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    onSubmit (event) {
      this.mensagemAlert = 'Salvando...'
      this.showAlert = true
      event.preventDefault()
      const emails = this.rowSelected.email
      const email = emails.split(';')
      let erro = false
      email.forEach((item) => {
        if (!this.re.test(String(item).toLowerCase().trim())) {
          this.mensagemAlert = 'Verifique o email informado.'
          this.showAlert = true
          erro = true
        }
      })
      if (erro) {
        return
      }
      this.mensagemAlert = 'Salvando...'
      if (this.rowSelected.id === 0) {
        this.$axios
          .$post(this.url, this.rowSelected, {
            headers: { Authorization: 'Bearer ' + this.$store.state.token }
          })
          .then((ret) => {
            this.hideModal('modal-incluir')
            this.search()
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
              this.mensagemAlert = 'Email já cadastrado. '
              this.showAlert = true
            } else {
              this.mensagemAlert = error
              this.showAlert = true
            }
          })
      } else {
        this.$axios
          .$put(this.url + '/' + this.rowSelected.id, this.rowSelected, {
            headers: { Authorization: 'Bearer ' + this.$store.state.token }
          })
          .then((ret) => {
            this.hideModal('modal-incluir')
            this.mensagemAlert = ''
            this.showAlert = false
            this.search()
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
        idUsuario: this.$store.state.usuarioId,
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
            }
          } else {
            this.mensagem = error
            this.showMsg = true
          }
          this.carregando = false
        })
    },
    // -------------------------------------------------------------------------------------- importar
    importar () {
      this.$root.$emit('bv::show::modal', 'modal-importar', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- exportar
    exportar () {
      if (this.procurar !== '') {
        const data = XLSX.utils.json_to_sheet(this.items)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, data, 'data')
        XLSX.writeFile(wb, this.pageName + '.xls')
      } else {
        this.$axios
          .$get(this.url + '-all', {
            headers: { Authorization: 'Bearer ' + this.$store.state.token }
          })
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
              this.mensagem = error
              this.showMsg = true
            }
          })
      }
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
