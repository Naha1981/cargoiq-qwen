import { redirect } from "next/navigation";

/**
 * CargoIQ is a product application, not a marketing site at the root route.
 * Send authenticated users straight to the operations command centre.
 * The public marketing sections remain available in the landing components
 * for a future dedicated marketing route if needed.
 */
export default function HomePage() {
  redirect("/dashboard");
}
