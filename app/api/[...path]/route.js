import { handlePortfolioApi } from "../../../src/lib/portfolio-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function dispatch(request, context) {
  const { path = [] } = await context.params;
  return handlePortfolioApi(request, path.join("/"));
}

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const DELETE = dispatch;
