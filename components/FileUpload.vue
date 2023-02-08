<template>
  <div>
    <b-container fluid>
      <div v-if="showMsg" style="padding-top: 10px">
        <b-alert v-model="showMsg" dismissible>
          {{ mensagem }}
        </b-alert>
      </div>
      <div v-if="carregando" class="text-center">
        <br>
        <img src="~/assets/loading.gif" width="28px">
        <br><br>
      </div>
      <p>Selecione o arquivo para importar no formato TXT ou CSV com as seguintes colunas: nome, email, empresa, posição, telefone, cidade - separados por vírgula e delimitados com aspas.</p>
      <b-form-group label="Categoria">
        <b-form-select v-model="categorias_fk" :options="categoriasOpt" />
      </b-form-group>
      <b-form-file
        v-model="file1"
        :state="Boolean(file1)"
        accept=".txt, .csv"
        placeholder="Selecione o arquivo ou arraste até aqui."
        drop-placeholder="elecione o arquivo ou arraste até aqui."
      />
      <br></br>
      <b-button class="mr-2" @click="enviarArquivo">
        Enviar
      </b-button>
    </b-container>
  </div>
</template>

<script>

export default {
  name: 'ImportarPage',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    idContatos: Number
  },
  data () {
    return {
      pageName: 'Importar',
      url: '/v1/importar-outbound',
      mensagem: 'Importar',
      showMsg: false,
      carregando: false,
      file1: null,
      categorias_fk: null,
      categoriasOpt: null
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.categorias()
  },
  methods: {
    // --------------------------------------------------------------------------------------  hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // -------------------------------------------------------------------------------------- Enviar arquivo para o servidor
    enviarArquivo () {
      if (this.file1 !== null) {
        this.mensagem = 'Enviando arquivo...'
        this.showMsg = true
        this.carregando = true
        const formData = new FormData()
        formData.append('file', this.file1)
        formData.append('categoria_fk', this.categorias_fk)
        formData.append('usuarios_fk', this.$store.state.usuarioId)
        const url = this.url
        this.$axios.$post(url, formData, { headers: { Authorization: 'Bearer ' + this.$store.state.token, 'Content-Type': 'multipart/form-data' } })
          .then((ret) => {
            this.carregando = false
            this.mensagem = 'Importação concluída com sucesso!'
            this.showMsg = true
          })
          .catch((error) => {
            if (!error.response) {
              this.mensagem = 'Erro ao conectar ao servidor backend.'
              this.showMsg = true
              this.carregando = false
            }
            if (error.response.status === 401) {
              if (this.refreshToken()) {
                this.enviarArquivo()
              }
            } else {
              this.mensagem = 'Não foi possível importar. Verifique o arquivo.'
              this.carregando = false
              this.showMsg = true
            }
          })
      }
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
              this.categorias()
            }
          } else {
            this.mensagem = error
            this.showMsg = true
          }
          this.carregando = false
        })
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
