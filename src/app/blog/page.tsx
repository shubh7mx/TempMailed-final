
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { blogPosts } from '@/lib/blog-posts.tsx';

const POSTS_PER_PAGE = 9;

function handleNewAddress() {
  if (typeof window !== 'undefined') {
    // On the blog page, clicking "New Address" should take you to the homepage
    // where the main logic for creating addresses lives.
    localStorage.removeItem("tempEmail");
    localStorage.removeItem("tempEmailToken");
    localStorage.removeItem("tempInbox");
    window.location.href = '/';
  }
};

export default function BlogIndexPage() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = blogPosts.slice(startIndex, endIndex);

  return (
    <>
      <Navbar onNewAddress={handleNewAddress} />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Our Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Insights on privacy, security, and making the most of temporary
            email.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
              <Card className="h-full overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary/50 flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-[16/9] relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint={post.imageHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    TempMailed Blog - {post.date}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-12">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link href={`/blog?page=${page - 1}`}>Previous</Link>
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link href={`/blog?page=${page + 1}`}>Next</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
