import { NextResponse } from "next/server";
import { registerUser } from "@/services/user.service";
import { errorHandler } from "@/lib/errorHandler";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const user = await registerUser(body);

  return NextResponse.json(user, { status: 201 });
});