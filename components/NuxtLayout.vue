<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>
        <img src="../assets/highleads.png" height="30" alt="highleads">
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/painel" to="/painel">
            Painel de Controle
          </b-nav-item>

          <b-nav-item href="/contatos" to="/contatos">
            Inbound
          </b-nav-item>

          <b-nav-item href="/outbound" to="/outbound">
            Outbound
          </b-nav-item>

          <b-nav-item href="/campanhas" to="/campanhas">
            Campanhas
          </b-nav-item>

          <b-nav-item-dropdown v-if="usuarioPerfil == 1" right>
            <!-- Using 'button-content' slot -->
            <template #button-content>
              <em>Administração</em>
            </template>
            <b-dropdown-item href="/cadastros/categorias" to="/cadastros/categorias">
              Categorias
            </b-dropdown-item>
            <b-dropdown-item href="/cadastros/sites" to="/cadastros/sites">
              Sites (landing Pages)
            </b-dropdown-item>
            <b-dropdown-item href="/cadastros/listanegra" to="/cadastros/listanegra">
              Lista Negra
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
            <b-dropdown-item href="#" to="#" @click="logout()">
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
      usuarioPerfil: 0
    }
  },
  mounted () {
    this.nomeUsuario = this.$store.state.usuarioEmail
    this.usuarioPerfil = this.$store.state.usuarioPerfil
  },
  methods: {
    // -------------------------------------------------------------------------------------- logout
    logout () {
      this.$axios
        .$get(this.url, {
          headers: { Authorization: 'Bearer ' + this.$store.state.token }
        })
        .then((ret) => {
          this.$router.push('/')
        })
        .catch(() => {
          this.$router.push('/')
        })
    }
  }

}
</script>
