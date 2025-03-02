


export async function POST(req:Response) {
    const { userQuery } = await req.json();

    const extractionPrompt = `
        Identify the NBA player names in the user query.
        Only return a JSON array of names.

        Example:
        Input: "Who should I pick up for fantasy, Stephen Curry or Russel Westbrook?"
        Output: ["Stephen Curry", "Russel Westbrook"]
    `
}