import { getSession } from "@/lib/auth";
import { getPriceAccess } from "@/lib/membership";

export async function getServerPriceContext() {
  const session = await getSession();
  return {
    session,
    priceAccess: getPriceAccess(session),
    isLoggedIn: Boolean(session),
  };
}
