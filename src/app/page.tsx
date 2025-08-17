
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, Mail, RefreshCw, QrCode } from "lucide-react";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EmailViewer } from "@/components/email-viewer";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Email } from "@/types";
import { blogPosts } from '@/lib/blog-posts.tsx';
import { createAccount, fetchInbox } from "./actions";
import { AdPlaceholder } from "@/components/ad-placeholder";

export const dynamic = 'force-dynamic';

const REFRESH_INTERVAL = 15000; // 15 seconds
const POPULAR_ARTICLES_COUNT = 6;

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [inbox, setInbox] = useState<Email[]>([]);
  const [generating, setGenerating] = useState(false);
  const [refreshingInbox, setRefreshingInbox] = useState(false);
  const [progress, setProgress] = useState(100);
  const [showQrCode, setShowQrCode] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const startRefreshTimer = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startTimeRef.current = performance.now();
    setProgress(100);

    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      const elapsed = time - startTimeRef.current;
      const newProgress = Math.max(0, 100 - (elapsed / REFRESH_INTERVAL) * 100);
      setProgress(newProgress);

      if (elapsed < REFRESH_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    intervalIdRef.current = setInterval(() => {
      handleRefresh(false); // Pass false for automatic refresh
    }, REFRESH_INTERVAL);
  }, []);

  const handleRefresh = useCallback(async (manual = false) => {
    const currentToken = token ?? (typeof window !== 'undefined' ? localStorage.getItem("tempEmailToken") : null);
    if (!currentToken || refreshingInbox) return;
  
    setRefreshingInbox(true);
  
    try {
      const newInbox = await fetchInbox(currentToken);
       if (newInbox) {
        setInbox(newInbox);
        if (typeof window !== 'undefined') {
          localStorage.setItem("tempInbox", JSON.stringify(newInbox));
        }
      }
    } catch (error) {
      console.error("Error refreshing inbox", error);
    } finally {
      setRefreshingInbox(false);
      // Always restart the timer after any refresh
      startRefreshTimer();
    }
  }, [refreshingInbox, startRefreshTimer, token]);
  
  const handleNewAddress = useCallback(async () => {
    setGenerating(true);
    try {
      const password = Math.random().toString(36).substring(7);
      const accountData = await createAccount(password);

      if (!accountData || !accountData.address || !accountData.token) {
        throw new Error("Failed to create account.");
      }

      setEmail(accountData.address);
      setToken(accountData.token);
      setInbox([]);

      if (typeof window !== 'undefined') {
        localStorage.setItem("tempEmail", accountData.address);
        localStorage.setItem("tempEmailToken", accountData.token);
        localStorage.removeItem("tempInbox");

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('email');
        newUrl.searchParams.delete('token');
        router.replace(newUrl.pathname, { scroll: false });
      }
      
      startRefreshTimer();
    } catch (error) {
      console.error("Error creating new address", error);
    } finally {
      setGenerating(false);
    }
  }, [startRefreshTimer, router]);


  useEffect(() => {
    const emailFromUrlRaw = searchParams.get('email');
    const tokenFromUrlRaw = searchParams.get('token');

    if (emailFromUrlRaw && tokenFromUrlRaw) {
      const emailFromUrl = decodeURIComponent(emailFromUrlRaw);
      const tokenFromUrl = decodeURIComponent(tokenFromUrlRaw);
      
      const savedToken = localStorage.getItem("tempEmailToken");
      
      if (tokenFromUrl !== savedToken) {
        setEmail(emailFromUrl);
        setToken(tokenFromUrl);
        setInbox([]);
        if(typeof window !== 'undefined') {
          localStorage.setItem("tempEmail", emailFromUrl);
          localStorage.setItem("tempEmailToken", tokenFromUrl);
          localStorage.removeItem("tempInbox");
        }
        handleRefresh(true);

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('email');
        newUrl.searchParams.delete('token');
        router.replace(newUrl.pathname, { scroll: false });
      }
    } else {
      const savedEmail = localStorage.getItem("tempEmail");
      const savedToken = localStorage.getItem("tempEmailToken");
      if (savedEmail && savedToken) {
        setEmail(savedEmail);
        setToken(savedToken);
        const savedInbox = localStorage.getItem("tempInbox");
        if (savedInbox && savedInbox !== "undefined" && savedInbox !== "null") {
          try {
            const parsedInbox = JSON.parse(savedInbox);
            if (Array.isArray(parsedInbox)) {
              setInbox(parsedInbox);
            }
          } catch (error) {
            console.error("Failed to parse inbox from localStorage", error)
            localStorage.removeItem("tempInbox");
          }
        }
        handleRefresh(true);
      } else {
        handleNewAddress();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("tempEmail");
    if (!savedEmail) {
      handleNewAddress();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const copyToClipboard = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
  };
  
  const openQrCode = () => {
    if (!email || !token) return;
    const url = new URL(window.location.origin);
    url.searchParams.set('email', encodeURIComponent(email));
    url.searchParams.set('token', encodeURIComponent(token));
    setShareableUrl(url.toString());
    setShowQrCode(true);
  }
  
  const popularArticles = blogPosts.slice(0, POPULAR_ARTICLES_COUNT);

  return (
    <>
      <Navbar onNewAddress={handleNewAddress} />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-center gap-8">
            <aside className="hidden xl:block w-40 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                    <AdPlaceholder type="vertical" />
                </div>
            </aside>
            <div className="w-full max-w-4xl space-y-8 flex-grow">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-muted-foreground text-center">
                    Your temporary email address
                    </h2>
                    <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 p-2 rounded-full border border-border bg-background/50 backdrop-blur-sm shadow-lg">
                        <Mail className="h-5 w-5 ml-2 text-muted-foreground flex-shrink-0" />
                        <p className="font-mono text-lg flex-1 truncate" title={email}>
                        {email || "Generating..."}
                        </p>
                        <div className="hidden sm:flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={openQrCode}
                            aria-label="Show QR code"
                            disabled={!email}
                        >
                            <QrCode className="h-5 w-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={copyToClipboard}
                            aria-label="Copy email address"
                            disabled={!email}
                        >
                            <Copy className="h-5 w-5" />
                        </Button>
                        </div>
                    </div>

                    <div className="sm:hidden flex flex-col gap-2 mt-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                            onClick={openQrCode}
                            aria-label="Show QR code"
                            disabled={!email}
                            variant="outline"
                            >
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                            </Button>
                            <Button
                            onClick={copyToClipboard}
                            aria-label="Copy email address"
                            disabled={!email}
                            variant="outline"
                            >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                            </Button>
                        </div>
                        <Button
                            onClick={handleNewAddress}
                            disabled={generating}
                            showLoading={generating}
                            className="w-full"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                            New Address
                        </Button>
                    </div>
                    </div>

                    <div className="hidden sm:flex">
                        <Button
                        onClick={handleNewAddress}
                        disabled={generating}
                        showLoading={generating}
                        >
                        <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                            New Address
                        </Button>
                    </div>
                </div>

                <div className="w-full bg-background/30 border border-border/20 rounded-xl p-2 sm:p-4 backdrop-blur-lg shadow-xl overflow-hidden relative">
                    <Progress value={progress} className="absolute top-0 left-0 w-full h-1 rounded-none" />
                    <div className="flex justify-between items-center mb-4 px-2 pt-2 sm:px-0 sm:pt-0">
                    <h3 className="text-2xl font-bold">Inbox</h3>
                    <div className="relative">
                        <Button
                        onClick={() => handleRefresh(true)}
                        disabled={refreshingInbox}
                        size="sm"
                        variant="outline"
                        className="relative"
                        >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshingInbox ? "animate-spin" : ""}`}
                        />
                        <span className="ml-2">Refresh</span>
                        </Button>
                    </div>
                    </div>
                    <EmailViewer emails={inbox} token={token} />
                </div>
                
                <div className="w-full text-left py-8 max-w-4xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-center mb-4">
                    What is a Disposable Temporary E-mail?
                    </h2>
                    <div className="text-muted-foreground space-y-4">
                        <p>
                        A disposable or temporary email is a short-term, throwaway email address you can use for any online sign-up. It acts as a shield, keeping your real inbox clean from spam and protecting your personal information from data breaches. Use it for newsletters, free trials, or any service where you don't want to share your primary email.
                        </p>
                        <p>
                        With TempMailed, you can instantly generate an address, receive confirmation emails, and then simply forget about it. No registration, no passwords—just simple, secure, and anonymous email on demand.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <AdPlaceholder type="horizontal" />
                </div>

                <div className="w-full py-8">
                     <div className="mb-8">
                        <AdPlaceholder type="horizontal" />
                    </div>
                    <h2 className="text-2xl font-bold mb-8 text-center">Popular Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {popularArticles.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
                            <Card className="h-full overflow-hidden transition-all hover:shadow-xl hover:border-primary/50 flex flex-col sm:flex-row items-center p-4">
                            <CardContent className="p-0 flex-1">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.summary}</p>
                            </CardContent>
                            <div className="w-full sm:w-32 h-32 sm:h-24 sm:ml-4 mt-4 sm:mt-0 flex-shrink-0 relative rounded-md overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={post.imageHint}
                                />
                            </div>
                            </Card>
                        </Link>
                        ))}
                    </div>
                </div>

                <div className="w-full text-left py-8 max-w-4xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-center mb-4">
                        The Tech behind Disposable Email Addresses
                    </h2>
                    <div className="text-muted-foreground space-y-4">
                        <p>
                        Everyone uses an email address daily, for everything from connecting at work with business prospects to reaching out to friends and colleagues. It has become an online passport. Nearly 99% of all apps and services we sign-up for today require an email address, and the same goes for most shoppers' loyalty cards, contest entries, and more.
                        </p>
                        <p>
                        While we all enjoy having an email address, getting tons of spam emails each day isn’t comfortable. Furthermore, it’s common for stores to have their databases hacked, leaving your email address at risk and more likely to end up on spam lists. Nothing done online is 100% private. Thus, you need to protect your email identity, and the best way is by using a disposable email address.
                        </p>
                        
                        <h3 className="text-xl font-semibold !mt-6 text-foreground">
                        Why Do You Need a Temporary Email?
                        </h3>
                        <p>
                        Services like Netflix or Hulu offer limited-time trials. With a temporary email, you can test a service thoroughly without committing your primary email. You can extend your trial usage by using a different email address after the initial trial period expires. Retailers often demand an email to give you access to offers, but this can lead to a deluge of spam. A temporary email address makes it easy to avoid these irritating messages.
                        </p>
                        <p>
                        While the idea of a temporary email address might conjure up images of black hat hackers, there are many convincing, legitimate reasons to use these services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>
                            <strong>Sign Up For Store Loyalty Cards:</strong> If you don’t want promotional emails from a store, use a disposable address. If the store's database is ever hacked, your real email address won’t be stolen.
                        </li>
                        <li>
                            <strong>Test Your Applications:</strong> If you're a developer, you can get hundreds of disposable emails to create dummy accounts and rigorously test sign-up flows and other features without hiring external testers.
                        </li>
                        <li>
                            <strong>Eliminate Spam:</strong> For forums, discussion groups, and online forms, using a temporary address can curb spam to an absolute minimum, keeping your main inbox clean.
                        </li>
                        </ul>

                        <h3 className="text-xl font-semibold !mt-6 text-foreground">
                        How to Use TempMailed Effectively
                        </h3>
                        <p>
                        Using TempMailed is simple. Instead of creating and managing a new account with a traditional provider like Gmail, you can generate a disposable address with a single click. All emails sent to this temporary address appear instantly in your TempMailed inbox.
                        </p>
                        <p>
                        This approach protects your real identity and gives you full control. You can participate in online forums, chat rooms, and file-sharing services with confidence, knowing that your primary email address is secure and shielded from spam.
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <AdPlaceholder type="horizontal" />
                </div>
            </div>
             <aside className="hidden xl:block w-40 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                    <AdPlaceholder type="vertical" />
                </div>
            </aside>
        </div>
      </main>
      <Footer />
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan to Share Email</DialogTitle>
            <DialogDescription>
              Scan this QR code with another device to open the same temporary email inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 flex justify-center">
            {shareableUrl && <QRCode value={shareableUrl} size={256} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}

    
