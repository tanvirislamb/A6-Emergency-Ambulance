import { errorResponse, response } from "@/Utils/res"
import type { Request, Response } from "express"
import httpStatus from "http-status"
import { authService } from "./auth.service"
import type { ILoginUser, IRegisterUser } from "./user.interface"

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

const registerUser = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.registerUserInDb(req.body as IRegisterUser)
    setAuthCookies(res, accessToken, refreshToken)
    response(res, true, httpStatus.CREATED, "User registered successfully", user)
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to register user")
  }
}

const loginUser = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUserInDb(req.body as ILoginUser)
    setAuthCookies(res, accessToken, refreshToken)
    response(res, true, httpStatus.OK, "User logged in successfully", user)
  } catch (error: any) {
    errorResponse(res, false, httpStatus.BAD_REQUEST, error?.message || "Failed to login user")
  }
}

const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenValue = req.cookies?.refreshToken
    const { accessToken, refreshToken, user } = await authService.refreshTokensInDb(refreshTokenValue)
    setAuthCookies(res, accessToken, refreshToken)
    response(res, true, httpStatus.OK, "Token refreshed successfully", user)
  } catch (error: any) {
    errorResponse(res, false, httpStatus.UNAUTHORIZED, error?.message || "Failed to refresh token")
  }
}

const getMe = async (req: Request, res: Response) => {
  try {
    response(res, true, httpStatus.OK, "User fetched successfully", req.user)
  } catch (error: any) {
    errorResponse(res, false, httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to fetch user")
  }
}

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
}
