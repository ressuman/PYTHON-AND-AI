export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret || secret === "fill_in_later" || secret === "") {
    return true
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    })

    const json = await res.json() as { success: boolean; score: number }
    return json.success === true && json.score >= 0.5
  } catch (err) {
    console.error("[RECAPTCHA ERROR]", err)
    return false
  }
}
