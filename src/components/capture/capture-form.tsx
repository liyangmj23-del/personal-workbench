"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { captureFromUrl, captureFromText } from "@/lib/actions/capture";
import { useLanguage } from "@/components/language-provider";

export function CaptureForm() {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Tabs defaultValue="url">
      <TabsList>
        <TabsTrigger value="url">{t.cap_tab_url}</TabsTrigger>
        <TabsTrigger value="text">{t.cap_tab_text}</TabsTrigger>
      </TabsList>
      <TabsContent value="url" className="flex flex-col gap-3">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t.cap_url_placeholder} />
        <Button
          className="self-start"
          disabled={pending || !url.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await captureFromUrl(url);
                setUrl("");
                toast.success(t.cap_fetch_success);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t.cap_fetch_failed);
              }
            })
          }
        >
          {pending ? t.cap_processing : t.cap_fetch_button}
        </Button>
      </TabsContent>
      <TabsContent value="text" className="flex flex-col gap-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.cap_text_placeholder}
          className="min-h-32"
        />
        <Button
          className="self-start"
          disabled={pending || !text.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await captureFromText(text);
                setText("");
                toast.success(t.cap_summarize_success);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : t.cap_summarize_failed);
              }
            })
          }
        >
          {pending ? t.cap_processing : t.cap_summarize_button}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
