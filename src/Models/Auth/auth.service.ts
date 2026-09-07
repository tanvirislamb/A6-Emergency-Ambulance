import config from "@/Config/envCongig";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { ILoginUser, IRegisterUser, IUser } from "./user.interface";

const signTokens = (payload: any) => {
  const accessToken = jwt.sign(payload, config.access_secret as string, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(payload, config.refresh_secret as string, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const registerUserInDb = async (payload: IRegisterUser) => {
  const { email, password, name, phone, role } = payload;

  if (role?.toUpperCase() === "ADMIN") {
    throw new Error("You cannot register as an admin");
  }
  if (role && !["PATIENT", "DISPATCHER"].includes(role.toUpperCase())) {
    throw new Error("Role must be PATIENT or DISPATCHER");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User already exists");
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: encryptedPassword,
      name,
      phone: phone ?? null,
      role: (role?.toUpperCase() || "PATIENT") as any,
    },
    omit: { password: true },
  });

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
  const { accessToken, refreshToken } = signTokens(jwtPayload);

  return { accessToken, refreshToken, user };
};

const loginUserInDb = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const findUser = await prisma.user.findUnique({ where: { email } });

  if (!findUser) {
    throw new Error("User not found");
  }
  if (findUser.deletedAt) {
    throw new Error("Account not found");
  }
  if (findUser.status === "SUSPENDED") {
    throw new Error("Account is suspended");
  }

  const match = await bcrypt.compare(password, findUser.password);
  if (!match) {
    throw new Error("Wrong password");
  }

  const jwtPayload = {
    id: findUser.id,
    role: findUser.role,
    email: findUser.email,
    name: findUser.name,
  };
  const { accessToken, refreshToken } = signTokens(jwtPayload);

  const { password: _, ...safeUser } = findUser;

  return { accessToken, refreshToken, user: safeUser };
};

const refreshTokensInDb = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }
  const decoded = jwt.verify(refreshToken, config.refresh_secret as string) as any;

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
    omit: { password: true },
  });

  if (!user || user.status === "SUSPENDED" || user.deletedAt) {
    throw new Error("Invalid refresh token");
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
  const tokens = signTokens(jwtPayload);

  return { ...tokens, user };
};

const socialLoginInDb = async (googleProfile: any) => {
  const { email, name, picture } = googleProfile;

  if (!email) {
    throw new Error("Google profile missing email");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const created = await prisma.user.create({
      data: {
        email,
        password: "",
        name: name || email.split("@")[0],
        role: "PATIENT",
      },
    });
    user = created;
  }

  if (user.status === "SUSPENDED") {
    throw new Error("Account is suspended");
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
  const { accessToken, refreshToken } = signTokens(jwtPayload);

  const { password: _pw, ...safeUser } = user;

  return { accessToken, refreshToken, user: safeUser };
};

export const authService = {
  registerUserInDb,
  loginUserInDb,
  refreshTokensInDb,
  socialLoginInDb,
};
