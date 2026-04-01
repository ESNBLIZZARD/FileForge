/**
 * Utility to log a successful conversion to the user's history.
 */
export async function trackConversion(fileName: string, fileType: string, toolUsed: string) {
  try {
    const res = await fetch("/api/conversions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType, toolUsed }),
    });

    if (!res.ok) {
      const message = await res.text();
      console.warn("Failed to log conversion history:", res.status, message || res.statusText);
    }
  } catch (error) {
    console.error("Error in trackConversion:", error);
  }
}
