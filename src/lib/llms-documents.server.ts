/**
 * Server-only loader for the LLM-facing documents.
 *
 * The templates live in `src/content/` rather than `public/` on purpose: a file
 * in `public/` is served verbatim by the CDN and can never be rendered from the
 * live model, which is exactly how `/llms.txt` came to state a buy date one day
 * off the pages it summarises. The Vite `?raw` import embeds them in the
 * Nitro/Vercel function bundle, same as the price archive.
 */

import llmsBody from "../content/llms.txt?raw";
import llmsFullBody from "../content/llms-full.txt?raw";

export const LLMS_TEMPLATE: string = typeof llmsBody === "string" ? llmsBody : "";
export const LLMS_FULL_TEMPLATE: string = typeof llmsFullBody === "string" ? llmsFullBody : "";
