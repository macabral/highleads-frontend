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
      <div class="text-center">
        <img v-if="carregando" src="~/assets/loading.gif" width="28px">
      </div>
      <b-table
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
    <!------------------------------------------------------------------------------------------------- Incluir Usuário -->
    <b-modal id="modal-incluir" size="lg" :title="pageName" hide-footer>
      <b-form>
        <b-row>
          <b-col cols="12" md="12" sm="12">
            <b-form-group label="Posição">
              <b-form-input
                v-model="rowSelected.text"
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
        <b>{{ rowSelected.text }}</b>
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

export default {
  name: 'SitesPage',
  data () {
    return {
      pageName: 'Sites (landing pages)',
      url: '/v1/sites',
      token: '',
      showAlert: false,
      mensagemErro: '',
      carregando: true,
      items: [],
      fields: [
        {
          key: 'pagina',
          sortable: true,
          label: 'Página',
          tdClass: 'tbvertical'
        },
        { key: 'actions', label: 'Ação' }
      ],
      row: {
        _id: 0,
        pagina: ''
      },
      rowSelected: {}
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
    // -------------------------------------------------------------------------------------- le registros
    async registros () {
      this.carregando = true
      this.items = await this.$axios.$get(this.url, { headers: { 'x-access-token': this.token } })
      this.carregando = false
    },
    // -------------------------------------------------------------------------------------- novo
    novo () {
      this.rowSelected = this.row
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- editar
    editar (item) {
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-incluir', '#btnShow')
    },
    // -------------------------------------------------------------------------------------- salvar
    async salvar () {
      if (this.rowSelected.text === '') {
        return
      }
      if (this.rowSelected._id === 0) {
        await this.$axios.$post(this.url, this.rowSelected, { headers: { 'x-access-token': this.token } })
      } else {
        await this.$axios.$put(this.url, this.rowSelected, { headers: { 'x-access-token': this.token } })
      }
      this.registros()
      this.hideModal('modal-incluir')
    },
    // -------------------------------------------------------------------------------------- excluir
    excluir (item) {
      this.rowSelected = item
      this.$root.$emit('bv::show::modal', 'modal-excluir', '#btnShow')
    },
    async excluirItem () {
      this.hideModal('modal-excluir')
      await this.$axios.$delete(this.url, { headers: { 'x-access-token': this.token }, data: { row: this.rowSelected } })
      this.registros()
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
