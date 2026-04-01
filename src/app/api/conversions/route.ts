import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AuthenticatedSessionUser = {
  id?: string;
  email?: string | null;
};

async function resolveCurrentUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { session: null, userId: null };
  }

  const sessionUser = session.user as typeof session.user & AuthenticatedSessionUser;
  if (sessionUser.id) {
    return { session, userId: sessionUser.id as string };
  }

  if (!sessionUser.email) {
    return { session, userId: null };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: sessionUser.email,
    },
    select: {
      id: true,
    },
  });

  return { session, userId: user?.id ?? null };
}

// POST /api/conversions - Log a new conversion
export async function POST(req: Request) {
  try {
    const { session, userId } = await resolveCurrentUserId();
    if (!session?.user || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, toolUsed } = await req.json();

    if (!fileName || !fileType || !toolUsed) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conversion = await prisma.conversion.create({
      data: {
        userId,
        fileName,
        fileType,
        toolUsed,
      },
    });

    return NextResponse.json(conversion);
  } catch (error) {
    console.error("Error logging conversion:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/conversions - Fetch history for the current user
export async function GET() {
  try {
    const { session, userId } = await resolveCurrentUserId();
    if (!session?.user || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversions = await prisma.conversion.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 for now
    });

    return NextResponse.json(conversions);
  } catch (error) {
    console.error("Error fetching conversions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
