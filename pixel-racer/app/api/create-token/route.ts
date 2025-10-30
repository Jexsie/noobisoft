import { createToken } from "@/server/hedera/hedera";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tokenId = await createToken();

    return NextResponse.json({
      success: true,
      tokenId: tokenId,
    });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to create token",
      },
      { status: 500 }
    );
  }
}
