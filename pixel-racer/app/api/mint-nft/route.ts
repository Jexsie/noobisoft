import { mintNft } from "@/server/hedera/hedera";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const receiver = request.nextUrl.searchParams.get("receiver");
    if (!receiver) {
      return NextResponse.json(
        {
          success: false,
          error: "Receiver address is required",
        },
        { status: 400 }
      );
    }
    const serialNumber = await mintNft(receiver);
    return NextResponse.json({
      success: true,
      serialNumber: serialNumber,
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to mint NFT",
      },
      { status: 500 }
    );
  }
}
