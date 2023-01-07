export const state = () => ({
  usuarioId: 0,
  usuarioEmail: '',
  nomeUsuario: '',
  isAdmin: false,
  token: ''
})

export const mutations = {
  usuarioId (state, value) {
    state.usuarioId = value
  },
  usuarioEmail (state, value) {
    state.usuarioEmail = value
  },
  nomeUsuario (state, value) {
    state.nomeUsuario = value
  },
  isAdmin (state, value) {
    state.isAdmin = value
  },
  token (state, value) {
    state.token = value
  }
}
