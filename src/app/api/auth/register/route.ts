import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/errorHandler";
import { User, UserAttributes } from "@/models/User";
import { createUserSchema } from "@/lib/schema/auth";
import { signIn } from "@/auth";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const { password, ...credentials} = createUserSchema.parse(body);

  const password_hash = await bcrypt.hash(password, 10);
  const availableUser = await User.findByEmail(credentials.email);
  if (availableUser) {
    return NextResponse.json(
      { error: "EmailAlreadyExist", message: 'Email already exists' },
      { status: 400 },
    );
  }
  const user = await User.create({ ...credentials as UserAttributes, password_hash });
  await signIn('credentials', {...credentials, password, redirect: false})

  return NextResponse.json(user, { status: 201 });
});