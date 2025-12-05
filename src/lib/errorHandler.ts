import axios from 'axios';
import { NextResponse } from 'next/server';
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
        { error: err.message || 'InternalServerError', message: err.message || 'Something went wrong' },
        { status: err.status || 500 },
      );
    }
  };

export const clientErrorHandler = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data.message || err.message || 'Request failed';
  }
  return err instanceof Error ? err.message : 'Unknown error';
};
