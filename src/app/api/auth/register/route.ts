import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/errorHandler";
import { createUserSchema } from "@/lib/schema/auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const { password, ...credentials} = createUserSchema.parse(body);

  const password_hash = await bcrypt.hash(password, 10);
  const availableUser = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (availableUser) {
    return NextResponse.json(
      { error: "EmailAlreadyExist", message: 'Email already exists' },
      { status: 400 },
    );
  }

  const user = await prisma.user.create({ data: { ...credentials, password_hash } });
  await signIn('credentials', {...credentials, password, redirect: false})

  return NextResponse.json(user, { status: 201 });
});