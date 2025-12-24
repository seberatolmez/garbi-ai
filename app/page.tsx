"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";
import { EventPreview } from "./components/EventPreview";
import { VoiceInputButton } from "./components/VoiceInputButton";

export default function AskGarbi() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Handle voice transcription - append transcribed text to input
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(prev => prev + text);
  }, []);

  useEffect(() => { // TODO: move to higher level component, so all pages are protected
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Get user's timezone from localStorage or detect it
      let userTimeZone = localStorage.getItem("userTimeZone");
      if (!userTimeZone) {
        userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        localStorage.setItem("userTimeZone", userTimeZone);
      }
      
      const response = await fetch("/api/handle-user-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: input.trim(),
          timeZone: userTimeZone
        }),
      });

      const responseData = await response.json().catch(() => null);
      setData(responseData);
      
      if (!response.ok) {
        setError((responseData && responseData.error) || "Failed to submit prompt");
        return;
      }
      // Clear input after successful submission
      setInput("");

    } catch (err) {
      console.error("Error submitting prompt:", err);
      setError("Unexpected error while submitting prompt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch w-full max-w-3xl mx-auto mt-8 px-6 flex-grow">
      <h1 className="text-2xl font-bold mb-2">
        Welcome back{session?.user?.name ? `, ${session.user.name}` : ""} 👋
      </h1>
       
      <section className="w-full mt-10">
        <div className="rounded-xl bg-muted/20 shadow-sm">

       { loading ?  
          <div className="flex flex-col items-center justify-center p-4">
            <Loader size={18}/> 
            <p className="text-gray-400 text-center">Processing your request...</p>
          </div> : null
          } 

        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type what you want to do with garbi..."
          />
          <PromptInputToolbar>
            <VoiceInputButton 
              onTranscript={handleVoiceTranscript}
              disabled={loading}
            />
            <PromptInputSubmit
              disabled={!input.trim() || loading}
              onClick={handleSubmit}
              variant={"ghost"}
              size={"icon-lg"}
            />
          </PromptInputToolbar>
           </PromptInput>
            
           {error && (
             <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
               {error}
             </div>
           )}
           
             <div className="mt-4 p-4 w-full">
               {data && <EventPreview data={data}/>}
             </div>

          </div>  
        </section>
    </div>
  );
}
