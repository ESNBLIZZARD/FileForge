/**
 * Utility to log a successful conversion to the user's history.
 */
export async function trackConversion(fileName: string, fileType: string, toolUsed: string) {
  try {
    const res = await fetch("/api/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType, toolUsed }),
    });

    if (!res.ok) {
      console.warn("Failed to log conversion history:", res.statusText);
    }
  } catch (error) {
    console.error("Error in trackConversion:", error);
  }
}
