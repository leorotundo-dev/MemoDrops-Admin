import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!.+\.[\w]+$|_next).*)", "/"],
};

export function middleware(req: NextRequest) {
  return NextResponse.next();
}
