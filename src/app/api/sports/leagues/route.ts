import { NextResponse } from "next/server";
import { SPORTS } from "@/lib/constants";

export async function GET() {
  return NextResponse.json(SPORTS);
}
