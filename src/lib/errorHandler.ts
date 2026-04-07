import axios from 'axios';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler =
  (
    handler: (
      request: Request,
      { params }: { params: tParams },
    ) => Promise<NextResponse>,
  ) =>
  async (req: Request, { params }: { params: tParams }) => {
    try {
      return await handler(req, { params });
    } catch (err) {
      console.error(err);

      const error = err as {
        status?: number;
        message?: string;
      };

      // Zod validation error
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return NextResponse.json(
          { error: 'ValidationError', issues },
          { status: 400 },
        );
      }

      // Prisma known request errors (e.g. unique / FK / not found)
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const target = (err.meta?.target as string[] | undefined)?.join(', ');
          return NextResponse.json(
            {
              error: 'DuplicateKeyError',
              message: target ? `${target} already exists` : 'Unique constraint violation',
            },
            { status: 409 },
          );
        }

        if (err.code === 'P2025') {
          return NextResponse.json(
            { error: 'NotFoundError', message: 'Requested resource was not found' },
            { status: 404 },
          );
        }

        if (err.code === 'P2003') {
          return NextResponse.json(
            { error: 'ForeignKeyError', message: 'Related record does not exist or cannot be referenced' },
            { status: 400 },
          );
        }

        if (err.code === 'P2000' || err.code === 'P2006' || err.code === 'P2011' || err.code === 'P2012') {
          return NextResponse.json(
            { error: 'ValidationError', message: 'Invalid data provided for database operation' },
            { status: 400 },
          );
        }

        return NextResponse.json(
          { error: 'DatabaseError', message: 'Database request failed' },
          { status: 500 },
        );
      }

      // Prisma query/input validation errors
      if (err instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          { error: 'ValidationError', message: 'Invalid query or payload for database operation' },
          { status: 400 },
        );
      }

      // Prisma connection/bootstrap/runtime errors
      if (
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientRustPanicError ||
        err instanceof Prisma.PrismaClientUnknownRequestError
      ) {
        return NextResponse.json(
          { error: 'DatabaseUnavailable', message: 'Database is temporarily unavailable' },
          { status: 503 },
        );
      }

      // Duplicate key (unique index)
      if ((err as { code: number }).code === 11000) {
        const field = Object.keys(
          (err as { keyValue: string }).keyValue ?? {},
        ).join(', ');
        return NextResponse.json(
          { error: 'DuplicateKeyError', message: `${field} already exists` },
          { status: 409 },
        );
      }

      // Fallback
      return NextResponse.json(
        {
          error: error.message || 'InternalServerError',
          message: error.message || 'Something went wrong',
        },
        { status: error.status || 500 },
      );
    }
  };

export const clientErrorHandler = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data.message || err.message || 'Request failed';
  }
  return err instanceof Error ? err.message : 'Unknown error';
};
