import CreateAuth from "@auth/create"
import Credentials from "@auth/core/providers/credentials"

export const { auth } = CreateAuth({
  providers: [Credentials({
    credentials: {
      email: {
        label: 'Email',
        type: 'email',
      },
      password: {
        label: 'Password',
        type: 'password',
      },
    },
  })],
  pages: {
    signIn: '/account/signin',
    signOut: '/account/logout',
  },
})


