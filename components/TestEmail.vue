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
      <b-form-group label="Nome">
        <b-form-input
          v-model="nome"
          size="sm"
          maxlength="80"
        />
      </b-form-group>
      <b-form-group label="Email*">
        <b-form-input
          v-model="emailDestino"
          size="sm"
          required
          type="email"
          maxlength="80"
        />
      </b-form-group>
      <b-button class="mr-2" @click="enviarArquivo">
        Enviar
      </b-button>
    </b-container>
  </div>
</template>

<script>

export default {
  name: 'TestPage',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    content: Text,
    assunto: Text
  },
  data () {
    return {
      pageName: 'TestEmail',
      url: '/v1/importar-outbound',
      mensagem: '',
      showMsg: false,
      carregando: false,
      emailDestino: '',
      nome: '',
      emailAssunto: '',
      emailContent: '',
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    if (this.$store.state.token === '') {
      this.$router.push('/')
    }
    this.emailAssunto = this.assunto
    this.emailContent = this.content
  },
  methods: {
    // -------------------------------------------------------------------------------------- Enviar arquivo para o servidor
    enviarArquivo () {
      if (this.emailDestino !== '') {
        this.mensagem = 'Enviando mensagem de teste...'
        this.showMsg = true
        this.carregando = true
        const emails = this.emailDestino
        const email = emails.split(';')
        email.forEach((item) => {
          if (!this.re.test(String(item).toLowerCase().trim())) {
            this.mensagem = 'Verifique o email informado.'
            this.showErro = true
            this.carregando = false
          }
        })
        let assunto = this.emailAssunto
        let content = this.emailContent
        if (this.nome !== '') {
          assunto = assunto.replaceAll('[NOME]', this.nome)
          content = content.replaceAll('[NOME]', this.nome)
          content = content.replaceAll('[UNIQUEID]', 'XYFTSREREESESE')
        }
        const send = {
          para: this.emailDestino,
          cc: '',
          bcc: '',
          assunto: '[HighLeads-TEST] ' + assunto,
          texto: content,
          prioridade: 0
        }
        if (!this.showErro) {
          // --- envia código de confirmação
          const url = '/v1/emails'
          this.$axios.$post(url, send, { headers: { Authorization: 'Bearer ' + this.$store.state.token } })
            .then((ret) => {
              this.mensagem = 'Email enviado com sucesso!'
              this.showErro = true
              this.carregando = false
            })
            .catch((error) => {
              if (!error.response) {
                this.mensagem = 'Erro ao conectar ao servidor backend.'
                this.showAlert = true
                this.carregando = false
              } else if (error.response.status === 401) {
                if (this.refreshToken()) {
                  this.salvar()
                }
              } else {
                this.carregando = false
                this.mensagem = error
                this.showErro = true
              }
            })
        }
      }
    }
  } /* Fim Methods */
} /* Fim export */
</script>

<style>
</style>
