<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>
        <img src="../assets/logo-empresa.jpg" height="30" alt="logo empresa">
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/painel" to="/painel">
            Painel de Controle
          </b-nav-item>

          <b-nav-item href="/contatos" to="/contatos">
            Contatos
          </b-nav-item>

          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em>Cadastros</em>
            </template>
            <b-dropdown-item href="/cadastros/sites" to="/cadastros/sites">
              Sites (landing Pages)
            </b-dropdown-item>
            <b-dropdown-item href="/cadastros/usuarios" to="/cadastros/usuarios">
              Usuários
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <!-- <b-nav-form>
            <b-form-input v-model="filtro" size="sm" class="mr-sm-2" placeholder="Procurar" />
            <b-button size="sm" class="my-2 my-sm-0" type="button" @click="procurar()">
              Procurar
            </b-button>
          </b-nav-form> -->

          <b-nav-item-dropdown :text="nomeUsuario" right>
            <!-- Using 'button-content' slot -->
            <template #button-content />
            <!-- <b-dropdown-item href="/perfil" to="/perfil">
              Perfil
            </b-dropdown-item> -->
            <b-dropdown-item href="/" to="/">
              Sair
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'NuxtLayout',
  data () {
    return {
      nomeUsuario: '',
      isAdmin: false,
      isRecepcao: false,
      clinica: ''
    }
  },
  mounted () {
    this.nomeUsuario = this.$store.state.nomeUsuario
    this.isRecepcao = this.$store.state.isRecepcao
    this.isAdmin = this.$store.state.isAdmin
    this.clinica = this.$store.state.clinica
  },
  methods: {
  }

}
</script>
