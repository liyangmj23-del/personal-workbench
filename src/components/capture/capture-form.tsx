"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { captureFromUrl, captureFromText } from "@/lib/actions/capture";

export function CaptureForm() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Tabs defaultValue="url">
      <TabsList>
        <TabsTrigger value="url">粘贴链接</TabsTrigger>
        <TabsTrigger value="text">粘贴文本</TabsTrigger>
      </TabsList>
      <TabsContent value="url" className="flex flex-col gap-3">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <Button
          className="self-start"
          disabled={pending || !url.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await captureFromUrl(url);
                setUrl("");
                toast.success("抓取并提炼完成");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "抓取失败");
              }
            })
          }
        >
          {pending ? "处理中..." : "抓取并提炼"}
        </Button>
      </TabsContent>
      <TabsContent value="text" className="flex flex-col gap-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴一段访谈/播客文字稿..."
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
                toast.success("提炼完成");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "处理失败");
              }
            })
          }
        >
          {pending ? "处理中..." : "提炼"}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
