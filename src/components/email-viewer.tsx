
"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Email } from "@/types";
import { MailOpen, Loader2 } from "lucide-react";
import { getEmail } from "@/app/actions";

interface EmailViewerProps {
  emails: Email[];
  token: string | null;
}

export function EmailViewer({ emails, token }: EmailViewerProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const handleEmailClick = async (email: Email) => {
    if (!token) return;
    setLoadingEmail(true);
    setSelectedEmail(email);
    try {
      const fullEmail = await getEmail(token, email.id);
      setSelectedEmail(fullEmail);
    } catch (error) {
      console.error("Could not fetch email content.", error);
      setSelectedEmail(null);
    } finally {
      setLoadingEmail(false);
    }
  };

  const emailList = emails || [];

  const iframeSrcDoc = selectedEmail?.html ? `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            background-color: white; 
            color: black; 
            font-family: sans-serif;
            margin: 1rem;
            word-wrap: break-word;
          }
          img, video, iframe {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>${selectedEmail.html}</body>
    </html>
  ` : "";


  return (
    <>
      <ScrollArea className="h-[calc(100vh-28rem)] md:h-[50vh] w-full">
        <div className="space-y-4 p-1 sm:p-2">
          {emailList.length > 0 ? (
            emailList.map((email) => (
              <Card
                key={email.id}
                className="cursor-pointer transition-all hover:border-accent hover:shadow-md"
                onClick={() => handleEmailClick(email)}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{email.subject}</CardTitle>
                      <CardDescription className="break-all">
                        From: {email.from.address}
                      </CardDescription>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap pt-1 sm:pt-0">
                      {new Date(email.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {email.intro}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MailOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your inbox is empty.</p>
              <p className="text-sm text-muted-foreground">
                Waiting for incoming emails...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      <Dialog
        open={!!selectedEmail}
        onOpenChange={(isOpen) => !isOpen && setSelectedEmail(null)}
      >
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="truncate">
              {selectedEmail?.subject || "Loading..."}
            </DialogTitle>
            {!loadingEmail && selectedEmail && (
              <DialogDescription>
                From: {selectedEmail?.from.address} | Received:{" "}
                {selectedEmail?.createdAt
                  ? new Date(selectedEmail.createdAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : "N/A"}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex-1 mt-4 overflow-hidden">
            {loadingEmail ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedEmail?.html ? (
              <iframe
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0 rounded-md"
                sandbox="allow-same-origin"
              />
            ) : (
              <ScrollArea className="h-full">
                <p className="text-sm leading-relaxed whitespace-pre-wrap p-4">
                  {selectedEmail?.text}
                </p>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
