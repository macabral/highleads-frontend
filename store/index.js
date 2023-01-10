export const state = () => ({
  usuarioId: 0,
  usuarioEmail: '',
  usuarioNome: '',
  usuarioPerfil: false,
  token: ''
})

export const mutations = {
  usuarioId (state, value) {
    state.usuarioId = value
  },
  usuarioEmail (state, value) {
    state.usuarioEmail = value
  },
  usuarioNome (state, value) {
    state.usuarioNome = value
  },
  usuarioPerfil (state, value) {
    state.usuarioPerfil = value
  },
  token (state, value) {
    state.token = value
  }
}
