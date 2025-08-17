
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { blogPosts, BlogPost } from '@/lib/blog-posts.tsx';
import Image from 'next/image';
import { Logo } from '@/components/logo';

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

export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (params.slug) {
      const foundPost = blogPosts.find(p => p.slug === params.slug);
      if (foundPost) {
        setPost(foundPost);
      } else {
        router.push('/blog'); // Redirect to blog index if post not found
      }
    }
  }, [params.slug, router]);

  if (!post) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Logo className="w-16 h-16 animate-pulse" />
        <p className="text-muted-foreground">Loading Post...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar onNewAddress={handleNewAddress} />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              TempMailed Blog - {post.date}
            </p>
          </header>

          <div className="aspect-[16/9] relative mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint={post.imageHint}
            />
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground text-lg">
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
