import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Strict Admin Check
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Counts
    const totalUsers = await prisma.user.count();
    const totalConversions = await prisma.conversion.count();

    // 2. Top Tools
    const topTools = await prisma.conversion.groupBy({
      by: ["toolUsed"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // 3. Last 7 Days Activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.conversion.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        toolUsed: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 4. Activity by Day (Aggregated for last 7 days including today)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const count = recentActivity.filter((act: any) => 
        act.createdAt.toISOString().split("T")[0] === dateStr
      ).length;

      activityTrend.push({
        date: dateStr,
        count: count,
      });
    }

    // 5. Recent Conversions (Global)
    const recentConversions = await prisma.conversion.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalConversions,
      },
      topTools: topTools.map((t: any) => ({
        name: t.toolUsed,
        count: t._count.id,
      })),
      activityTrend,
      recentConversions,
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
