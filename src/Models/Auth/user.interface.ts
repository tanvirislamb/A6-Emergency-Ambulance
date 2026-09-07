export type IUser = {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  status: string
}

export type IRegisterUser = {
  email: string
  password: string
  name: string
  phone?: string
  role?: string
}

export type ILoginUser = {
  email: string
  password: string
}
