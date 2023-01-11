<template>
  <div id="app" class="fundo">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>
        <img src="../assets/highleads.png" height="30" alt="logo empresa">
      </b-navbar-brand>
    </b-navbar>
    <div class="login-page">
      <div class="container">
        <b-row>
          <div class="col-lg-6 col-md-6 col-sm-8 mx-auto">
            <div class="card login">
              <div class="text-center">
                <img src="../assets/login.jpg" width="100%">
                <br><br>
              </div>
              <b-alert v-show="mensagemErro != ''" v-model="showAlert" dismissible>
                {{ mensagemErro }}
              </b-alert>
              <input
                v-model="login.email"
                type="email"
                class="form-control espaco-linha"
                placeholder="Email"
                maxlength="50"
                required
              >
              <div class="linha">
                <input
                  v-model="login.senha"
                  type="password"
                  class="form-control espaco-linha"
                  maxlength="20"
                  placeholder="Senha"
                  required
                >
              </div>
              <div class="linha">
                <button class="btn btn-primary btn-sm" @click="doLogin()">
                  Entrar
                </button>
              </div>
              <div class="linha">
                <a href="#" class="linha" @click="alterarSenha()">Esqueceu a senha?</a>
              </div>
            </div>
          </div>
        </b-row>
      </div>
    </div>
    <!------------------------------------------------------------------------------------------------- Alterar Senha -->
    <b-modal id="modal-senha" size="lg" title="Esqueceu a senha?" hide-footer>
      <b-alert v-if="mensagemErro != ''" v-model="showAlert" dismissible>
        {{ mensagemErro }}
      </b-alert>
      <h6>Informe seu email e se ainda não tem o Código de Confirmação clique em "Solicite o Código de Confirmação". Você receberá o código no email informado.</h6>
      <b-form>
        <b-form-group label="email">
          <b-form-input
            v-model="login.email"
            size="sm"
            type="email"
            maxlength="50"
            required
          />
          <b-button class="mt-3" variant="info" @click="enviarLink()">
            Solicite o Código de Confirmação
          </b-button>
        </b-form-group>
        <b-form-group label="Informe o código de confirmação recebido em seu email">
          <b-form-input
            v-model="codigoConfirmacao"
            size="sm"
            type="text"
            maxlength="10"
            required
          />
        </b-form-group>
        <b-form-group label="Informe sua nova senha">
          <b-form-input
            v-model="senha1"
            size="sm"
            type="password"
            maxlength="50"
            required
          />
        </b-form-group>
        <b-form-group label="Confirme sua nova senha">
          <b-form-input
            v-model="senha2"
            size="sm"
            type="password"
            maxlength="50"
            required
          />
        </b-form-group>
        <div class="text-right">
          <b-button class="mt-3" variant="primary" @click="salvarSenha()">
            Alterar Senha
          </b-button>
          <b-button class="mt-3" @click="hideModal('modal-senha'); mensagemErro=''">
            Cancelar
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'LoginPage',
  data () {
    return {
      config: {},
      login: {
        name: '',
        senha: '',
        email: ''
      },
      codigoConfirmacao: '',
      senha1: '',
      senha2: '',
      showAlert: false,
      mensagemErro: '',
      re: /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    }
  },
  mounted () {
    this.$store.commit('usuarioId', 0)
  },
  methods: {
    // hide modal
    hideModal (id) {
      this.$root.$emit('bv::hide::modal', id, '#btnShow')
    },
    // -------------------------------------------------------------------------------------- login
    doLogin () {
      this.mensagemErro = ''
      const email = this.login.email
      const senha = this.login.senha
      email.trim()
      if (email.length === 0 || senha.length === 0) {
        this.mensagemErro = 'Informe seu email e senha.'
        this.showAlert = true
        return
      }
      if (email.length > 80) {
        this.mensagemErro = 'Verifique seu email.'
        this.showAlert = true
        return
      }
      if (!this.re.test(String(email).toLowerCase())) {
        this.mensagemErro = 'Verifique seu email.'
        this.showAlert = true
        return
      }
      this.mensagemErro = 'Verificando login...'
      this.showAlert = true
      const url = '/v1/login'
      const login = {
        email: this.login.email,
        password: this.login.senha
      }
      this.$axios.$post(url, login)
        .then((ret) => {
          this.$store.commit('usuarioEmail', login.email)
          this.$store.commit('token', ret.token)
          this.$store.commit('usuarioPerfil', ret.perfil)
          this.$store.commit('usuarioNome', ret.nome)
          this.$store.commit('usuarioId', ret.id)
          this.$router.push('/painel')
        })
        .catch(() => {
          this.mensagemErro = 'Não foi possível logar. Verifique seu email/senha.'
          this.showAlert = true
        })
    },
    // -------------------------------------------------------------------------------------- lembrar a senha
    alterarSenha () {
      this.mensagemErro = ''
      this.$root.$emit('bv::show::modal', 'modal-senha', '#btnShow')
      this.codigoConfirmacao = ''
      this.senha1 = ''
      this.senha2 = ''
    },
    // -------------------------------------------------------------------------------------- enviar email com o código de confirmação
    enviarLink () {
      this.showAlert = false
      const email = this.login.email
      email.trim()
      if (email.length === 0 || email.length > 80 || !this.re.test(String(email).toLowerCase())) {
        this.mensagemErro = 'Verifique seu email.'
        this.showAlert = true
        return
      }
      this.mensagemErro = 'Verificando email...'
      this.showAlert = true
      // --- envia código de confirmação
      const url = '/v1/envia-codigo?email=' + email
      this.$axios.$get(url)
        .then((ret) => {
          this.mensagemErro = 'O Código de Confirmação foi encaminhado para o seu email.'
          this.showAlert = true
        })
        .catch(() => {
          this.mensagemErro = 'O email não foi encontrado no cadastro de Usuários. Por favor, verifique com o Administrador do Sistema.'
          this.showAlert = true
        })
    },
    // -------------------------------------------------------------------------------------- salvar senha
    salvarSenha () {
      const email = this.login.email
      email.trim()
      if (email.length === 0 || email.length > 80) {
        this.mensagemErro = 'Verifique seu email.'
        this.showAlert = true
        return
      }
      if (!this.re.test(String(email).toLowerCase())) {
        this.mensagemErro = 'Verifique seu email.'
        this.showAlert = true
        return
      }
      const codigo = this.codigoConfirmacao
      codigo.trim()
      if (codigo.length === 0 || codigo.length > 5) {
        this.mensagemErro = 'Informe o Código de Confirmação.'
        this.showAlert = true
        return
      }
      const senha1 = this.senha1
      senha1.trim()
      if (senha1.length === 0 || senha1.length > 50) {
        this.mensagemErro = 'Verifique a senha informada.'
        this.showAlert = true
        return
      }
      const senha2 = this.senha2
      senha2.trim()
      if (senha2.length === 0 || senha2.length > 50) {
        this.mensagemErro = 'Verifique a senha informada.'
        this.showAlert = true
        return
      }
      if (this.senha1 !== this.senha2) {
        this.mensagemErro = 'As senhas não conferem.'
        this.showAlert = true
        return false
      }
      this.mensagemErro = 'Alterando sua senha...'
      this.showAlert = true
      // --- altera a senha
      const url = '/v1/altera-senha'
      const data = {
        email: this.login.email,
        codigo: this.codigoConfirmacao,
        senha: this.senha1
      }
      this.$axios.$put(url, data)
        .then((ret) => {
          this.mensagemErro = 'Senha alterada com sucesso!'
          this.showAlert = true
        })
        .catch((e) => {
          this.mensagemErro = 'Não foi possível alterar a senha. Verifique seu email e o Código de Confirmação. O Código de Confirmação tem validade de 1 hora e não pode ser reutilizado.'
          this.showAlert = true
        })
    }
  }
}
</script>
<style>
.card {
   padding: 10px;
}

.login-page {
  align-items: center;
  display: flex;
  height: 70vh;
  .wallpaper-login {
    background-size: cover;
    height: 100%;
    position: absolute;
     width: 100%;
  }
  .fade-enter-active,
  .fade-leave-active {
  transition: opacity .5s;
}
   .fade-enter,
   .fade-leave-to {
      opacity: 0;
   }

   h1 {
      margin-bottom: 1.5rem;
   }
}

.error {
   animation-name: errorShake;
   animation-duration: 0.3s;
}

@keyframes errorShake {
   0% {
      transform: translateX(-25px);
   }
   25% {
      transform: translateX(25px);
   }
   50% {
      transform: translateX(-25px);
   }
   75% {
      transform: translateX(25px);
   }
   100% {
      transform: translateX(0);
   }
}

.linha {
  padding-top: 10px;
}
</style>
