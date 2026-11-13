/**
 * The assistant: suggestions for me, or free-text search — Track C. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (C4–C6):
 *  - Client container: load events once, pass them with the profile to <AssistantChat>.
 *  - All the model work goes through "@/lib/ai"; this page never imports Transformers.js.
 */
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { Placeholder } from "@/components/shared/Placeholder";

export default function AssistantPage() {
  return (
    <>
      <Placeholder title="Asistente" track="C" features="F16" />
      <AssistantChat />
    </>
  );
}
